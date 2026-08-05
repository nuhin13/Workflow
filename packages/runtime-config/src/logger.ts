// E00-T03 · structured, redacted JSON logging (EARS-E00-7, NFR-SEC-01).
//
// One logging pattern for every service, with redaction applied on the way out
// rather than left to each call site. Call sites are where discipline fails:
// there will be hundreds of them across sixteen epics, written by different
// agents, and a single careless one is a permanent leak.

import type { LogLevel, ServiceName } from './config';

export type LogSink = (line: string) => void;

export interface LogRecord {
  level: LogLevel;
  message: string;
  service?: ServiceName;
  timestamp?: string;
  correlationId?: string;
  context?: Record<string, unknown>;
  [key: string]: unknown;
}

export type SafeLogRecord = LogRecord;

export const REDACTED = '[redacted]';

/**
 * Substring fragments that mark a field as sensitive.
 *
 * Matched as SUBSTRINGS, case-insensitively, so fields nobody anticipated —
 * `ownerPinAttempt`, `customerPhone`, `smsToken` — are caught by default. This
 * fails CLOSED: the cost of over-redacting an operational field is a slightly
 * less useful log line, while the cost of under-redacting is a leaked OTP or a
 * due amount the owner deliberately hid from a shared phone (BRD Law 2).
 */
const SENSITIVE_FRAGMENTS: readonly string[] = [
  'otp',
  'pin',
  'password',
  'passphrase',
  'secret',
  'token',
  'credential',
  'apikey',
  'api_key',
  'authorization',
  'cookie',
  'session',
  'phone',
  'msisdn',
  'databaseurl',
  'database_url',
  'connectionstring',
  'dsn',
  // Money the owner PIN protects. Not "confidential" in the usual sense, but
  // the product's central privacy promise (Q-004 answer).
  'due',
  'amount',
  'balance',
  'income',
  'salary',
  'roi',
  'price',
];

/** Kept even though they contain a sensitive fragment, because they are safe. */
const ALLOWED_EXACT_KEYS: readonly string[] = ['correlationId', 'service', 'level', 'timestamp'];

function isSensitiveKey(key: string): boolean {
  if (ALLOWED_EXACT_KEYS.includes(key)) {
    return false;
  }
  const normalized = key.toLowerCase();
  return SENSITIVE_FRAGMENTS.some((fragment) => normalized.includes(fragment));
}

/** Collapses newlines so one record can never become two log lines. */
function flatten(value: string): string {
  return value.replace(/[\r\n\u2028\u2029]+/g, ' ');
}

/**
 * Value shapes that must never survive in free text.
 *
 * Key-based redaction cannot help here: `logger.info(`otp ${code} sent`)` has no
 * sensitive KEY at all, so the message field would pass through untouched. This
 * is defence in depth for that mistake.
 *
 * It is deliberately conservative — it matches shapes that are almost certainly
 * secrets, not anything that merely looks numeric. Over-matching would mangle
 * ordinary operational messages and get the whole mechanism switched off.
 */
const SENSITIVE_VALUE_PATTERNS: readonly RegExp[] = [
  /eyJ[A-Za-z0-9_-]{10,}/g, // JWT
  /sk_live_[0-9a-zA-Z]{8,}/g, // live payment secret
  /AKIA[0-9A-Z]{16}/g, // AWS access key id
  /AIza[0-9A-Za-z_-]{20,}/g, // Google / Firebase API key
  /gh[pousr]_[0-9a-zA-Z]{20,}/g, // GitHub token
  /\b[a-z][a-z0-9+.-]*:\/\/[^\s:@/]+:[^\s@/]+@\S+/gi, // any URI with credentials
  /\b\+?8801\d{8,9}\b/g, // Bangladeshi mobile number — the product's core PII
  /\b[0-9a-f]{32,}\b/gi, // hex digest or long opaque token
];

/**
 * Scrubs secret-shaped values out of free text.
 *
 * The REAL rule is structural and cannot be enforced here: never interpolate a
 * value into a log message — pass it as a keyed field so key-based redaction can
 * see it. This function is the safety net for when that rule is forgotten, not a
 * licence to forget it.
 */
export function scrubMessage(value: string): string {
  let result = flatten(value);
  for (const pattern of SENSITIVE_VALUE_PATTERNS) {
    result = result.replace(pattern, REDACTED);
  }
  return result;
}

function redactValue(key: string, value: unknown, depth: number): unknown {
  if (isSensitiveKey(key)) {
    return REDACTED;
  }

  // Depth guard: a cyclic or pathological object must not hang the logger.
  if (depth > 6) {
    return REDACTED;
  }

  if (value instanceof Error) {
    // The NAME only. A message routinely carries a host, a port, or a query,
    // and a stack carries our source layout.
    return { name: value.name };
  }

  if (Array.isArray(value)) {
    return value.map((entry) => redactValue(key, entry, depth + 1));
  }

  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [childKey, childValue] of Object.entries(value as Record<string, unknown>)) {
      result[childKey] = redactValue(childKey, childValue, depth + 1);
    }
    return result;
  }

  if (typeof value === 'string') {
    // A non-sensitive KEY can still carry a sensitive VALUE — `{ note: 'otp
    // 482913' }`. Key matching cannot see that; the value scrub can.
    return scrubMessage(value);
  }

  return value;
}

/**
 * Removes every prohibited field from a candidate record.
 *
 * Exported so tests can assert redaction directly, and so a future transport
 * can reuse exactly the rules the logger uses.
 */
export function redactLogFields(record: LogRecord): SafeLogRecord {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (key === 'message') {
      // Scrubbed, not merely flattened: a message is free text with no key for
      // key-based redaction to match on.
      result[key] = scrubMessage(String(value));
      continue;
    }
    result[key] = redactValue(key, value, 0);
  }
  return result as SafeLogRecord;
}

export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

/**
 * Builds the one logger every service uses.
 *
 * The sink is injectable so tests assert on real emitted bytes rather than on
 * intent — this is the difference between proving redaction and hoping for it.
 */
export function createStructuredLogger(
  service: ServiceName,
  sink: LogSink = (line) => process.stdout.write(`${line}\n`),
  minimumLevel: LogLevel = 'info',
): Logger {
  const threshold = LEVEL_ORDER[minimumLevel];

  const emit = (level: LogLevel, message: string, context?: Record<string, unknown>): void => {
    if (LEVEL_ORDER[level] < threshold) {
      return;
    }

    const record: LogRecord = {
      timestamp: new Date().toISOString(),
      level,
      service,
      message,
      ...(context ?? {}),
    };

    // JSON.stringify escapes any remaining control character, so the emitted
    // line is always single-line and parseable by a log shipper.
    sink(JSON.stringify(redactLogFields(record)));
  };

  return {
    debug: (message, context) => emit('debug', message, context),
    info: (message, context) => emit('info', message, context),
    warn: (message, context) => emit('warn', message, context),
    error: (message, context) => emit('error', message, context),
  };
}
