// E00-T02 · behavioural contract tests (EARS-E00-4, EARS-E00-5).
//
// These boot the REAL Nest application and speak HTTP to it. Asserting on the
// source instead would prove only that we wrote the code we meant to write, not
// that a client receives the shape the contract promises.
//
// The app is imported from apps/api/dist because the source uses decorators,
// which Node's type stripping does not support.

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import test, { after, before } from 'node:test';
import { fileURLToPath } from 'node:url';
import type { AddressInfo } from 'node:net';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const apiDist = join(repositoryRoot, 'apps/api/dist/app.module.js');

// pnpm links dependencies strictly, so @nestjs/* is resolvable from apps/api
// but not from the repository root. Resolving through the API's own manifest
// keeps Nest out of the root package.json, where it does not belong.
const requireFromApi = createRequire(join(repositoryRoot, 'apps/api/package.json'));

/** Started once for the whole file; booting Nest per test is needlessly slow. */
let baseUrl = '';
// The Nest application type is not imported: doing so would pull decorator
// syntax into this file.
interface NestApplicationLike {
  listen(port: number, hostname: string): Promise<unknown>;
  getHttpServer(): { address(): AddressInfo | string | null };
  close(): Promise<void>;
}

let app: NestApplicationLike | undefined;

before(async () => {
  if (!existsSync(apiDist)) {
    execFileSync('corepack', ['pnpm', '--filter', '@garazo/api', 'run', 'build'], {
      cwd: repositoryRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8',
    });
  }

  // The probe flag is enabled here so the enabled-path tests are meaningful;
  // the disabled path is exercised by a separate child process below.
  process.env.NODE_ENV = 'test';
  process.env.GARAZO_FLAG_SYSTEM_WALKING_SKELETON = 'true';

  const { NestFactory } = requireFromApi('@nestjs/core') as {
    NestFactory: {
      create(module: unknown, options: { logger: boolean }): Promise<NestApplicationLike>;
    };
  };
  const { AppModule } = requireFromApi(apiDist) as { AppModule: unknown };

  const created = await NestFactory.create(AppModule, { logger: false });
  await created.listen(0, '127.0.0.1');
  const address = created.getHttpServer().address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
  app = created;
});

after(async () => {
  await app?.close();
});

test('test_EARS_E00_4_live_returns_only_status_and_correlation', async () => {
  const response = await fetch(`${baseUrl}/api/v1/system/live`);
  assert.equal(response.status, 200);

  const body = (await response.json()) as Record<string, unknown>;
  assert.deepEqual(Object.keys(body).sort(), ['correlationId', 'status']);
  assert.equal(body.status, 'ok');
  assert.equal(typeof body.correlationId, 'string');
  assert.equal(response.headers.get('x-correlation-id'), body.correlationId);
});

test('test_EARS_E00_4_correlation_id_is_echoed_when_safe', async () => {
  const supplied = 'client-supplied-correlation-1';
  const response = await fetch(`${baseUrl}/api/v1/system/live`, {
    headers: { 'X-Correlation-Id': supplied },
  });
  const body = (await response.json()) as { correlationId: string };
  assert.equal(body.correlationId, supplied);
});

test('test_NFR_SEC_01_unsafe_correlation_id_is_replaced', async () => {
  // An over-long or empty value must be discarded and replaced, not truncated
  // or echoed. Truncating would still let a caller choose our log keys.
  for (const unsafe of ['x'.repeat(300), '']) {
    const response = await fetch(`${baseUrl}/api/v1/system/live`, {
      headers: { 'X-Correlation-Id': unsafe },
    });
    const body = (await response.json()) as { correlationId: string };
    assert.notEqual(body.correlationId, unsafe);
    assert.match(body.correlationId, /^[\x20-\x7E]{1,128}$/);
  }
});

test('test_NFR_SEC_01_control_characters_never_become_a_correlation_id', () => {
  // Control characters cannot be sent through fetch or Node's http client at
  // all — both reject the header before it leaves. So this is asserted against
  // the resolver directly: the guard must live in our code, not depend on a
  // client library refusing to send the value.
  const { resolveCorrelationId } = requireFromApi(
    join(repositoryRoot, 'apps/api/dist/common/request/request-context.js'),
  ) as { resolveCorrelationId: (headers: Record<string, string | string[]>) => string };

  for (const unsafe of ['bad\nvalue', 'bad\rvalue', 'bad\u0000value', 'বাংলা']) {
    const resolved = resolveCorrelationId({ 'x-correlation-id': unsafe });
    assert.notEqual(resolved, unsafe);
    assert.match(resolved, /^[\x20-\x7E]{1,128}$/);
  }

  // A repeated header has no principled winner, so it is treated as absent.
  const fromArray = resolveCorrelationId({ 'x-correlation-id': ['one', 'two'] });
  assert.notEqual(fromArray, 'one');
  assert.notEqual(fromArray, 'two');

  // A safe value still survives.
  assert.equal(resolveCorrelationId({ 'x-correlation-id': 'safe-1' }), 'safe-1');
});

test('test_EARS_E00_4_readiness_failure_uses_the_uniform_envelope', async () => {
  // No readiness check is bound in T02, so this is the genuine unavailable
  // path rather than a simulated one.
  const response = await fetch(`${baseUrl}/api/v1/system/ready`);
  assert.equal(response.status, 503);

  const body = (await response.json()) as { error: Record<string, unknown> };
  assert.deepEqual(Object.keys(body), ['error']);
  assert.deepEqual(Object.keys(body.error).sort(), [
    'code',
    'correlationId',
    'fieldErrors',
    'messageKey',
  ]);
  assert.equal(body.error.code, 'SYSTEM.NOT_READY');
  assert.equal(body.error.messageKey, 'errors.systemNotReady');
  assert.deepEqual(body.error.fieldErrors, []);
});

test('test_EARS_E00_4_error_envelope_leaks_no_internal_detail', async () => {
  const responses = await Promise.all([
    fetch(`${baseUrl}/api/v1/system/ready`),
    fetch(`${baseUrl}/api/v1/system/does-not-exist`),
    fetch(`${baseUrl}/api/v1/system/walking-skeleton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unexpected: 'field' }),
    }),
  ]);

  for (const response of responses) {
    const raw = await response.text();
    // Anything that would tell an attacker about the host, the datastore, or
    // our source layout.
    for (const leak of ['Error:', 'at Object', '/Users/', 'node_modules', 'postgres', 'stack']) {
      assert.ok(!raw.includes(leak), `error body leaked "${leak}": ${raw}`);
    }

    const body = JSON.parse(raw) as { error: Record<string, unknown> };
    assert.deepEqual(Object.keys(body), ['error']);
    assert.ok(typeof body.error.code === 'string');
  }
});

test('test_EARS_E00_4_unknown_route_uses_the_same_envelope', async () => {
  const response = await fetch(`${baseUrl}/api/v1/nothing-here`);
  assert.equal(response.status, 404);

  const body = (await response.json()) as { error: { code: string } };
  assert.equal(body.error.code, 'SYSTEM.NOT_FOUND');
  assert.ok(response.headers.get('x-correlation-id'));
});

test('test_EARS_E00_4_invalid_probe_body_is_rejected', async () => {
  const response = await fetch(`${baseUrl}/api/v1/system/walking-skeleton`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ unexpected: 'field' }),
  });
  assert.equal(response.status, 400);

  const body = (await response.json()) as {
    error: { code: string; fieldErrors: { field: string }[] };
  };
  assert.equal(body.error.code, 'VALIDATION.INVALID_FIELD');
  assert.deepEqual(
    body.error.fieldErrors.map((fieldError) => fieldError.field),
    ['unexpected'],
  );
});

test('test_EARS_E00_5_probe_reports_unavailable_without_a_bound_implementation', async () => {
  // The flag is on and the body is valid, so the only reason left is that T04
  // has not bound a probe. It must be a database-unavailable 503, never a
  // fabricated success.
  const response = await fetch(`${baseUrl}/api/v1/system/walking-skeleton`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.equal(response.status, 503);

  const body = (await response.json()) as { error: { code: string } };
  assert.equal(body.error.code, 'SYSTEM.DATABASE_UNAVAILABLE');
});

test('test_EARS_E00_5_probe_is_hidden_when_the_flag_is_off_or_in_production', () => {
  // Checked as pure logic against an injected environment: booting a second
  // server per environment permutation would be slow and prove no more.
  const { isWalkingSkeletonEnabled } = requireFromApi(
    join(repositoryRoot, 'apps/api/dist/system/system.controller.js'),
  ) as { isWalkingSkeletonEnabled: (env: NodeJS.ProcessEnv) => boolean };

  assert.equal(
    isWalkingSkeletonEnabled({
      NODE_ENV: 'development',
      GARAZO_FLAG_SYSTEM_WALKING_SKELETON: 'true',
    }),
    true,
  );
  // Production wins even with the flag explicitly on.
  assert.equal(
    isWalkingSkeletonEnabled({
      NODE_ENV: 'production',
      GARAZO_FLAG_SYSTEM_WALKING_SKELETON: 'true',
    }),
    false,
  );
  assert.equal(
    isWalkingSkeletonEnabled({
      NODE_ENV: 'development',
      GARAZO_FLAG_SYSTEM_WALKING_SKELETON: 'false',
    }),
    false,
  );
  // Absent flag is off, not on.
  assert.equal(isWalkingSkeletonEnabled({ NODE_ENV: 'development' }), false);
  assert.equal(isWalkingSkeletonEnabled({}), false);
});
