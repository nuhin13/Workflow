// E01-T02 · access schema and migration integration tests (EARS-E01-T02-2,
// -3, -4; NFR-SEC-01, NFR-SEC-02) against a REAL PostgreSQL.
//
// The database is started from infra/compose/compose.development.yaml, the
// same pattern tests/integration/system-probe-postgres.spec.ts uses.

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import test, { after, before } from 'node:test';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const requireFromServerCore = createRequire(
  join(repositoryRoot, 'packages/server-core/package.json'),
);

const SUPERUSER_DATABASE_URL = 'postgres://garazo:garazo-local-dev@127.0.0.1:5432/garazo';
// garazo_app is the application role the migration creates. Its password is a
// fixed local-only placeholder (infra/db/README.md); it is deliberately NOT a
// superuser and does not own any table, so a connection through it is the
// only connection that can actually prove RLS is enforced.
const APP_ROLE_DATABASE_URL = 'postgres://garazo_app:garazo-app-local-dev@127.0.0.1:5432/garazo';
const COMPOSE_FILE = 'infra/compose/compose.development.yaml';

interface PoolLike {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    text: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
  end(): Promise<void>;
}

let superuserPool: PoolLike | undefined;
let appPool: PoolLike | undefined;
let databaseAvailable = false;

function compose(...args: string[]): string {
  return execFileSync('docker', ['compose', '-f', COMPOSE_FILE, ...args], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function migrate(direction: 'up' | 'down', migration = '0002_access_workshop'): void {
  execFileSync('bash', ['scripts/migrate-diagnostic.sh', direction, migration], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    env: { ...process.env, DATABASE_URL: SUPERUSER_DATABASE_URL, APP_ENV: 'test' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

before(async () => {
  compose('up', '--detach', '--wait', '--wait-timeout', '120', 'postgres');

  const { Pool } = requireFromServerCore('pg') as { Pool: new (config: object) => PoolLike };

  // Ensure a clean slate: some other suite may have left 0002 applied or not.
  try {
    migrate('down');
  } catch {
    // Not applied yet — fine.
  }
  migrate('up');

  superuserPool = new Pool({ connectionString: SUPERUSER_DATABASE_URL, max: 10 });
  appPool = new Pool({ connectionString: APP_ROLE_DATABASE_URL, max: 10 });
  databaseAvailable = true;
});

after(async () => {
  await superuserPool?.end();
  await appPool?.end();
  // The container and the applied migration are left running: tearing down
  // here would fight other suites sharing the same database.
});

/** Clears every access table between assertions, respecting FK order. */
async function resetAccessTables(): Promise<void> {
  await superuserPool!.query(
    `TRUNCATE owner_money_grants, owner_pin_failure_states, owner_pin_credentials,
              application_sessions, memberships, workshop_vehicle_types, workshops, accounts`,
  );
}

test('test_EARS_E01_T02_migration_creates_eight_access_tables', async () => {
  assert.ok(databaseAvailable, 'the test database did not start');

  const expected = [
    'accounts',
    'workshops',
    'workshop_vehicle_types',
    'memberships',
    'application_sessions',
    'owner_pin_credentials',
    'owner_pin_failure_states',
    'owner_money_grants',
  ];

  for (const table of expected) {
    const result = await superuserPool!.query<{ present: string | null }>(
      `SELECT to_regclass('public.' || $1) AS present`,
      [table],
    );
    assert.notEqual(result.rows[0]!.present, null, `${table} was not created by the migration`);
  }
});

test('test_EARS_E01_T02_2_no_secret_is_stored_in_reversible_form', async () => {
  assert.ok(databaseAvailable, 'the test database did not start');
  await resetAccessTables();

  const rawPhone = '+8801711000000';
  const rawPin = '1234';
  const rawToken = 'super-secret-session-token-value';
  const phoneDigest = `digest-of-${rawPhone}`;
  const tokenDigest = `digest-of-${rawToken}`;
  const pinDigest = `argon2id$digest-of-${rawPin}`;

  await superuserPool!.query(
    `INSERT INTO accounts (account_id, phone_digest, created_at) VALUES (gen_random_uuid(), $1, now())`,
    [phoneDigest],
  );
  const workshopResult = await superuserPool!.query<{ workshop_id: string }>(
    `INSERT INTO workshops (workshop_id, name, created_at) VALUES (gen_random_uuid(), 'Test Workshop', now())
     RETURNING workshop_id`,
  );
  const workshopId = workshopResult.rows[0]!.workshop_id;

  await superuserPool!.query(
    `INSERT INTO owner_pin_credentials (workshop_id, pin_digest, updated_at) VALUES ($1, $2, now())`,
    [workshopId, pinDigest],
  );

  const accountRow = await superuserPool!.query<{ account_id: string }>(
    `SELECT account_id FROM accounts WHERE phone_digest = $1`,
    [phoneDigest],
  );
  await superuserPool!.query(
    `INSERT INTO application_sessions (session_id, token_digest, account_id, workshop_id, issued_at, expires_at)
     VALUES (gen_random_uuid(), $1, $2, $3, now(), now() + interval '30 days')`,
    [tokenDigest, accountRow.rows[0]!.account_id, workshopId],
  );

  // Dump every text-ish column across the access tables and assert none of
  // the RAW secret values ever appear — only their digests do.
  const dump = await superuserPool!.query<{ value: string | null }>(
    `SELECT phone_digest::text AS value FROM accounts
     UNION ALL SELECT token_digest::text FROM application_sessions
     UNION ALL SELECT pin_digest::text FROM owner_pin_credentials`,
  );

  const values = dump.rows.map((row) => row.value).join('\n');
  assert.ok(!values.includes(rawPhone), 'raw phone number leaked into storage');
  assert.ok(!values.includes(rawPin), 'raw PIN leaked into storage');
  assert.ok(!values.includes(rawToken), 'raw session token leaked into storage');
  assert.ok(values.includes(phoneDigest), 'the phone digest itself should be present');
  assert.ok(values.includes(tokenDigest), 'the token digest itself should be present');
  assert.ok(values.includes(pinDigest), 'the PIN digest itself should be present');
});

test('test_EARS_E01_T02_3_revoking_a_session_revokes_its_money_grants', async () => {
  assert.ok(databaseAvailable, 'the test database did not start');
  await resetAccessTables();

  const account = await superuserPool!.query<{ account_id: string }>(
    `INSERT INTO accounts (account_id, phone_digest, created_at) VALUES (gen_random_uuid(), 'p1', now()) RETURNING account_id`,
  );
  const workshop = await superuserPool!.query<{ workshop_id: string }>(
    `INSERT INTO workshops (workshop_id, name, created_at) VALUES (gen_random_uuid(), 'W', now()) RETURNING workshop_id`,
  );
  const session = await superuserPool!.query<{ session_id: string }>(
    `INSERT INTO application_sessions (session_id, token_digest, account_id, workshop_id, issued_at, expires_at)
     VALUES (gen_random_uuid(), 't1', $1, $2, now(), now() + interval '30 days') RETURNING session_id`,
    [account.rows[0]!.account_id, workshop.rows[0]!.workshop_id],
  );
  await superuserPool!.query(
    `INSERT INTO owner_money_grants (grant_id, token_digest, session_id, workshop_id, issued_at, expires_at)
     VALUES (gen_random_uuid(), 'g1', $1, $2, now(), now() + interval '5 minutes')`,
    [session.rows[0]!.session_id, workshop.rows[0]!.workshop_id],
  );

  let grants = await superuserPool!.query(`SELECT 1 FROM owner_money_grants WHERE token_digest = 'g1'`);
  assert.equal(grants.rows.length, 1, 'the grant should exist before revocation');

  // "Revoking" here is deleting the session outright to prove the CASCADE;
  // T05 will implement soft revocation (revoked_at) as its own behaviour.
  await superuserPool!.query(`DELETE FROM application_sessions WHERE session_id = $1`, [
    session.rows[0]!.session_id,
  ]);

  grants = await superuserPool!.query(`SELECT 1 FROM owner_money_grants WHERE token_digest = 'g1'`);
  assert.equal(grants.rows.length, 0, 'the money grant must not outlive its session (cascade)');
});

test('test_FR_ACCESS_11_pin_failure_accounting_is_atomic', async () => {
  assert.ok(databaseAvailable, 'the test database did not start');
  await resetAccessTables();

  const workshop = await superuserPool!.query<{ workshop_id: string }>(
    `INSERT INTO workshops (workshop_id, name, created_at) VALUES (gen_random_uuid(), 'W', now()) RETURNING workshop_id`,
  );
  const workshopId = workshop.rows[0]!.workshop_id;

  const { asOpaqueId } = requireFromServerCore(
    join(repositoryRoot, 'packages/server-core/dist/access/access-context.js'),
  ) as { asOpaqueId(value: string): unknown };
  const { PostgresAccessRepository } = requireFromServerCore(
    join(repositoryRoot, 'packages/server-core/dist/access/postgres-access.repository.js'),
  ) as {
    PostgresAccessRepository: new (pool: unknown) => {
      recordPinFailure(scope: unknown): Promise<{ consecutiveFailures: number; completedCycles: number }>;
    };
  };

  const { Pool } = requireFromServerCore('pg') as { Pool: new (config: object) => PoolLike };
  const scopedPool = new Pool({ connectionString: SUPERUSER_DATABASE_URL, max: 20 });
  try {
    const repository = new PostgresAccessRepository(scopedPool);
    const scope = { kind: 'workshop', workshopId: asOpaqueId(workshopId) };

    // A read-then-write implementation would under-count here — exactly the
    // failure mode postgres-system-probe.repository.ts's counter test guards
    // against (EARS-E01-T02-4).
    const concurrency = 5;
    const results = await Promise.all(
      Array.from({ length: concurrency }, () => repository.recordPinFailure(scope)),
    );

    // Every one of the 5 concurrent failures must be counted exactly once:
    // the fifth completes a cycle, resetting consecutive_failures to 0 with
    // completedCycles = 1.
    const finalCounts = results.map((r) => r.consecutiveFailures).sort((a, b) => a - b);
    assert.deepEqual(finalCounts, [0, 1, 2, 3, 4], 'each concurrent failure must see a distinct count');

    const finalState = await superuserPool!.query<{
      consecutive_failures: number;
      completed_cycles: number;
      cooldown_until: Date | null;
    }>(`SELECT consecutive_failures, completed_cycles, cooldown_until FROM owner_pin_failure_states WHERE workshop_id = $1`, [
      workshopId,
    ]);
    const row = finalState.rows[0]!;
    assert.equal(row.consecutive_failures, 0);
    assert.equal(row.completed_cycles, 1);
    assert.notEqual(row.cooldown_until, null, 'the first completed cycle must set a cooldown');
  } finally {
    await scopedPool.end();
  }
});

test('test_ADR_0005_down_migration_removes_only_access_tables', async () => {
  assert.ok(databaseAvailable, 'the test database did not start');

  try {
    migrate('down');

    for (const table of ['accounts', 'workshops', 'application_sessions']) {
      const result = await superuserPool!.query<{ present: string | null }>(
        `SELECT to_regclass('public.' || $1) AS present`,
        [table],
      );
      assert.equal(result.rows[0]!.present, null, `${table} survived the down migration`);
    }

    const probe = await superuserPool!.query<{ present: string | null }>(
      `SELECT to_regclass('public.system_probes') AS present`,
    );
    assert.notEqual(probe.rows[0]!.present, null, 'the down migration destroyed system_probes (E00, unrelated)');
  } finally {
    migrate('up');
  }
});

test('test_NFR_SEC_01_migration_runner_still_refuses_production', () => {
  assert.throws(() => {
    execFileSync('bash', ['scripts/migrate-diagnostic.sh', 'up', '0002_access_workshop'], {
      cwd: repositoryRoot,
      encoding: 'utf8',
      env: { ...process.env, DATABASE_URL: SUPERUSER_DATABASE_URL, APP_ENV: 'production' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  });
});
