// E00-T04 · cross-process end-to-end (EARS-E00-9, -10, -11).
//
// Every other test proves one layer. This proves the LINE: a real HTTP request
// crosses a container boundary into the API, the API writes to a real
// PostgreSQL, and the committed number comes back. Nothing here is stubbed.
//
// It runs against the development Compose stack, which is what a human uses.

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import test, { after, before } from 'node:test';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const COMPOSE_FILE = 'infra/compose/compose.development.yaml';
const API = 'http://127.0.0.1:3000';
const DATABASE_URL = 'postgres://garazo:garazo-local-dev@127.0.0.1:5432/garazo';

function compose(...args: string[]): string {
  return execFileSync('docker', ['compose', '-f', COMPOSE_FILE, ...args], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function migrate(direction: 'up' | 'down'): void {
  execFileSync('bash', ['scripts/migrate-diagnostic.sh', direction], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    env: { ...process.env, DATABASE_URL, APP_ENV: 'test' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

/** Runs one probe and returns status plus parsed body. */
async function probe(): Promise<{ status: number; body: Record<string, unknown> }> {
  const response = await fetch(`${API}/api/v1/system/walking-skeleton`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return { status: response.status, body: (await response.json()) as Record<string, unknown> };
}

before(() => {
  // Full stack, built from source — the same command a developer runs.
  compose('up', '--build', '--detach', '--wait', '--wait-timeout', '420');
  migrate('up');
});

after(() => {
  compose('down', '--remove-orphans');
});

test('test_EARS_E00_9_probe_round_trip_persists_and_returns', async () => {
  // Start from a known count so the assertions are absolute rather than
  // relative to whatever a previous run left behind.
  execFileSync(
    'docker',
    [
      'compose',
      '-f',
      COMPOSE_FILE,
      'exec',
      '-T',
      'postgres',
      'psql',
      '-U',
      'garazo',
      '-d',
      'garazo',
      '-c',
      'DELETE FROM system_probes',
    ],
    { cwd: repositoryRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );

  const first = await probe();
  assert.equal(first.status, 200);
  assert.equal(first.body.status, 'persisted');
  assert.equal(first.body.visitCount, 1);
  assert.equal(typeof first.body.correlationId, 'string');

  const second = await probe();
  assert.equal(second.body.visitCount, 2);

  // Different requests must get different correlation ids, or tracing a single
  // user's report back to a log line becomes impossible.
  assert.notEqual(first.body.correlationId, second.body.correlationId);
});

/**
 * Probes with a short retry.
 *
 * Immediately after `docker compose restart`, the published port can accept a
 * connection and then reset it while the new process is still binding — health
 * reporting green does not guarantee the forwarded socket is settled. Retrying
 * a connection-level failure keeps this test about persistence rather than
 * about Docker's port-forwarding timing. A non-2xx RESPONSE is never retried;
 * only a failure to get one at all.
 */
async function probeWithRetry(
  attempts = 10,
): Promise<{ status: number; body: Record<string, unknown> }> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await probe();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw lastError;
}

test('test_NFR_REL_01_probe_survives_api_restart', async () => {
  const before = await probe();
  const countBefore = before.body.visitCount as number;

  // Restarting the API proves the count lives in PostgreSQL and not in process
  // memory — the difference between a real round trip and a convincing mock.
  compose('restart', 'api');
  compose('up', '--detach', '--wait', '--wait-timeout', '180', 'api');

  const after = await probeWithRetry();
  assert.equal(after.status, 200);
  assert.equal(after.body.visitCount, countBefore + 1);
});

test('test_EARS_E00_9_concurrent_probes_all_persist', async () => {
  const start = await probe();
  const base = start.body.visitCount as number;

  const concurrency = 10;
  const results = await Promise.all(Array.from({ length: concurrency }, () => probe()));

  for (const result of results) {
    assert.equal(result.status, 200);
  }

  const counts = results.map((result) => result.body.visitCount as number).sort((a, b) => a - b);
  assert.deepEqual(
    counts,
    Array.from({ length: concurrency }, (_, index) => base + index + 1),
    'concurrent HTTP probes did not each persist exactly one increment',
  );
});

test('test_EARS_E00_10_database_failure_returns_redacted_503', async () => {
  compose('stop', 'postgres');

  try {
    const response = await probe();

    // Never a false success. A skeleton that reports persisted while the
    // database is down makes every downstream verification worthless.
    assert.equal(response.status, 503);

    const body = response.body as { error: Record<string, unknown> };
    assert.deepEqual(Object.keys(body), ['error']);
    assert.equal(body.error.code, 'SYSTEM.DATABASE_UNAVAILABLE');
    assert.ok(typeof body.error.correlationId === 'string');

    const raw = JSON.stringify(body);
    for (const leak of ['postgres', '5432', 'ECONNREFUSED', 'garazo-local-dev', 'at ', '/app/']) {
      assert.ok(!raw.includes(leak), `the 503 body leaked "${leak}": ${raw}`);
    }

    // Readiness must also report unhealthy rather than claiming ready.
    const ready = await fetch(`${API}/api/v1/system/ready`);
    assert.equal(ready.status, 503);
    const readyRaw = await ready.text();
    assert.ok(!readyRaw.includes('5432'));
    assert.ok(!readyRaw.includes('ECONNREFUSED'));
  } finally {
    compose('start', 'postgres');
    compose('up', '--detach', '--wait', '--wait-timeout', '180', 'postgres', 'api');
  }
});

test('test_EARS_E00_11_production_has_no_usable_probe_route', () => {
  // Two independent guards, asserted at the source because standing up a
  // production container would need the registry decision that is still open.
  //
  // 1. The API refuses to BOOT in production with the flag on.
  const configSource = readFileSync(
    join(repositoryRoot, 'packages/runtime-config/src/config.ts'),
    'utf8',
  );
  assert.match(configSource, /WALKING_SKELETON_ENABLED must be false when APP_ENV is production/);

  // 2. Even if it did boot, the route checks the environment itself and answers
  //    404 — indistinguishable from a path that does not exist.
  const controllerSource = readFileSync(
    join(repositoryRoot, 'apps/api/src/system/system.controller.ts'),
    'utf8',
  );
  assert.match(controllerSource, /isProduction = .*production/);
  assert.match(controllerSource, /ApiErrorCode\.SystemNotFound/);

  // 3. Production Compose hard-wires the flag off.
  const prodCompose = readFileSync(
    join(repositoryRoot, 'infra/compose/compose.production.yaml'),
    'utf8',
  );
  assert.match(prodCompose, /WALKING_SKELETON_ENABLED: "false"/);

  // 4. The Flutter route is compiled out of a release build entirely, so there
  //    is no page to reach even with a debugger attached.
  const appSource = readFileSync(join(repositoryRoot, 'apps/mobile/lib/app/app.dart'), 'utf8');
  assert.match(appSource, /bool\.fromEnvironment\('dart\.vm\.product'\)/);
  assert.match(appSource, /if \(systemProbeRouteEnabled\)/);
});

test('test_ADR_0008_flutter_uses_the_generated_client', () => {
  // A hand-written request or model beside the generated client is how the two
  // sides of the wire drift apart silently.
  const repositorySource = readFileSync(
    join(repositoryRoot, 'apps/mobile/lib/features/system_probe/data/system_probe_repository.dart'),
    'utf8',
  );

  assert.match(repositorySource, /core\/api\/generated\/lib\/api\.dart/);
  assert.match(repositorySource, /_api\.systemWalkingSkeleton\(/);

  for (const adHoc of ['http.post', 'HttpClient', 'jsonDecode', 'Uri.parse']) {
    assert.ok(
      !repositorySource.includes(adHoc),
      `the Flutter repository uses ${adHoc} instead of the generated client`,
    );
  }
});
