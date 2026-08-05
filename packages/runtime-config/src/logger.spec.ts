// E00-T03 · structured logging and redaction (EARS-E00-7).
//
// Garazo handles phone numbers, OTPs, an owner PIN and money the owner has
// deliberately hidden from everyone holding the shared workshop phone. A log
// line is a permanent, widely-readable copy, so redaction is tested with
// realistic fixtures rather than trusted to reviewer discipline.

import assert from 'node:assert/strict';
import test from 'node:test';
import { createStructuredLogger, redactLogFields, type LogRecord } from './logger.ts';

/** Values that must never survive into output, whatever the field is called. */
const SECRET_FIXTURES = {
  otp: '482913',
  pin: '9021',
  token: 'eyJhbGciOiJIUzI1NiJ9.super-secret-token',
  phone: '+8801712345678',
  password: 's3cr3t-password',
  databaseUrl: 'postgres://user:s3cr3t-password@db.internal:5432/garazo',
  dueAmount: 4500,
  apiKey: 'sk_live_abcdef123456',
};

function collect(): { sink: (line: string) => void; lines: string[] } {
  const lines: string[] = [];
  return { sink: (line: string) => lines.push(line), lines };
}

test('test_EARS_E00_7_logger_redacts_sensitive_fields', () => {
  const { sink, lines } = collect();
  const logger = createStructuredLogger('api', sink);

  logger.info('login attempted', {
    otp: SECRET_FIXTURES.otp,
    pin: SECRET_FIXTURES.pin,
    accessToken: SECRET_FIXTURES.token,
    phoneNumber: SECRET_FIXTURES.phone,
    password: SECRET_FIXTURES.password,
    databaseUrl: SECRET_FIXTURES.databaseUrl,
    dueAmount: SECRET_FIXTURES.dueAmount,
    apiKey: SECRET_FIXTURES.apiKey,
    correlationId: 'safe-correlation-1',
  });

  const output = lines.join('\n');
  for (const [name, value] of Object.entries(SECRET_FIXTURES)) {
    assert.ok(
      !output.includes(String(value)),
      `log output leaked ${name} (${String(value)}): ${output}`,
    );
  }

  // Redaction must not silently swallow the operational signal.
  const record = JSON.parse(lines[0]!) as Record<string, unknown>;
  assert.equal(record.message, 'login attempted');
  assert.equal(record.correlationId, 'safe-correlation-1');
  assert.equal(record.service, 'api');
});

test('test_EARS_E00_7_redaction_survives_nesting_and_arrays', () => {
  // Real payloads are not flat. A redactor that only walks the top level gives
  // false confidence.
  const redacted = redactLogFields({
    level: 'info',
    message: 'nested',
    context: {
      user: { phoneNumber: SECRET_FIXTURES.phone, otp: SECRET_FIXTURES.otp },
      bills: [{ dueAmount: 1200 }, { dueAmount: 3400 }],
    },
  } as unknown as LogRecord);

  const serialized = JSON.stringify(redacted);
  assert.ok(!serialized.includes(SECRET_FIXTURES.phone));
  assert.ok(!serialized.includes(SECRET_FIXTURES.otp));
  assert.ok(!serialized.includes('1200'));
  assert.ok(!serialized.includes('3400'));
});

test('test_EARS_E00_7_unknown_sensitive_looking_keys_are_redacted', () => {
  // The list is matched by SUBSTRING so a field nobody anticipated —
  // ownerPinAttempt, smsToken, customerPhone — is caught by default. Failing
  // open here would mean every future epic could add a leaking field silently.
  const redacted = redactLogFields({
    level: 'info',
    message: 'future fields',
    context: {
      ownerPinAttempt: '1234',
      smsToken: 'abc',
      customerPhone: '+8801700000000',
      attributedIncome: 999,
      refreshSecret: 'zzz',
    },
  } as unknown as LogRecord);

  const serialized = JSON.stringify(redacted);
  for (const leak of ['1234', 'abc', '+8801700000000', '999', 'zzz']) {
    assert.ok(!serialized.includes(leak), `leaked ${leak}: ${serialized}`);
  }
});

test('test_EARS_E00_7_error_objects_never_emit_a_stack_trace', () => {
  const { sink, lines } = collect();
  const logger = createStructuredLogger('worker', sink);

  logger.error('boom', {
    error: new Error('connect ECONNREFUSED 10.0.0.5:5432 for user admin'),
  });

  const output = lines.join('\n');
  assert.ok(!output.includes('10.0.0.5'), 'leaked a host address');
  assert.ok(!output.includes('at '), 'leaked a stack frame');
  assert.ok(!output.includes('.ts:'), 'leaked a source path');
});

test('test_EARS_E00_7_log_lines_are_single_line_json', () => {
  // Log shippers split on newlines. A multi-line record becomes several broken
  // records, and an attacker-supplied newline becomes a forged one.
  const { sink, lines } = collect();
  const logger = createStructuredLogger('api', sink);

  logger.info('multi\nline\nmessage', { note: 'a\nb' });

  assert.equal(lines.length, 1);
  assert.ok(!lines[0]!.includes('\n'));
  const record = JSON.parse(lines[0]!) as { level: string; timestamp: string };
  assert.equal(record.level, 'info');
  assert.ok(typeof record.timestamp === 'string');
});

test('test_EARS_E00_7_log_level_threshold_is_honoured', () => {
  const { sink, lines } = collect();
  const logger = createStructuredLogger('api', sink, 'warn');

  logger.debug('noise');
  logger.info('noise');
  logger.warn('kept');
  logger.error('kept');

  assert.equal(lines.length, 2);
});
