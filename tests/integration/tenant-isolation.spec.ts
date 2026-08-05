// E01-T02 · the two-workshop attack suite (EARS-E01-T02-1, NFR-SEC-01) against
// a REAL PostgreSQL. This is the whole point of the task: seed two workshops,
// then actually ATTEMPT to read workshop B's rows from workshop A's scope —
// at the application layer (`withTenantScope`) and at the PostgreSQL layer
// (a raw query as the non-superuser application role, bypassing the
// repository entirely) — and prove the read returns zero rows, not merely
// that a policy object exists.
//
// The database is started from infra/compose/compose.development.yaml, the
// same pattern tests/integration/access-schema.spec.ts and
// tests/integration/system-probe-postgres.spec.ts use.

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test, { after, before } from 'node:test';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const requireFromServerCore = createRequire(
  join(repositoryRoot, 'packages/server-core/package.json'),
);

// `node --test` runs each *.spec.ts file as its own process, and this file
// runs CONCURRENTLY with tests/integration/access-schema.spec.ts — both apply
// migration 0002 in `before()`, and access-schema.spec.ts's own
// `test_ADR_0005_down_migration_removes_only_access_tables` drops and
// re-creates the whole schema mid-suite. Two processes running DDL (ALTER
// TABLE, CREATE POLICY, GRANT) against the same tables at once genuinely
// deadlocks PostgreSQL, and even without a deadlock, one file's mid-suite
// `down` would make the other file's in-flight SELECTs fail on a dropped
// table. The fix is full mutual exclusion for the file's ENTIRE run, not just
// around individual migrate calls: the lock is acquired in `before()` and
// held until `after()`. `mkdirSync` is atomic at the OS level, so it doubles
// as a cross-process mutex with no extra tooling.
const MIGRATION_LOCK_DIR = join(tmpdir(), 'garazo-migration-lock');

async function acquireMigrationLock(): Promise<void> {
  const deadline = Date.now() + 120_000;
  for (;;) {
    try {
      mkdirSync(MIGRATION_LOCK_DIR);
      return;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      if (Date.now() > deadline) throw new Error('timed out waiting for the migration lock');
      await new Promise((resolveWait) => setTimeout(resolveWait, 100));
    }
  }
}

function releaseMigrationLock(): void {
  rmdirSync(MIGRATION_LOCK_DIR, { recursive: true });
}

const SUPERUSER_DATABASE_URL = 'postgres://garazo:garazo-local-dev@127.0.0.1:5432/garazo';
// garazo_app is the application role the migration creates: NOT a superuser
// and does not own any table, so a connection through it is the only
// connection that can actually prove RLS is enforced rather than bypassed by
// table ownership (infra/db/README.md).
const APP_ROLE_DATABASE_URL = 'postgres://garazo_app:garazo-app-local-dev@127.0.0.1:5432/garazo';
const COMPOSE_FILE = 'infra/compose/compose.development.yaml';

interface PoolClientLike {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    text: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
  release(): void;
}

interface PoolLike {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    text: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
  connect(): Promise<PoolClientLike>;
  end(): Promise<void>;
}

let superuserPool: PoolLike | undefined;
let appPool: PoolLike | undefined;
let databaseAvailable = false;

// Two workshops seeded directly (superuser, bypasses RLS by table ownership)
// so this suite tests the READ path in isolation, not the write path.
let workshopA: { workshopId: string; membershipId: string; accountId: string };
let workshopB: { workshopId: string; membershipId: string; accountId: string };

function compose(...args: string[]): string {
  return execFileSync('docker', ['compose', '-f', COMPOSE_FILE, ...args], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

/** True only when the container is already running AND passing its healthcheck. */
function isPostgresContainerHealthy(): boolean {
  try {
    const status = execFileSync(
      'docker',
      ['inspect', '--format', '{{.State.Health.Status}}', 'garazo-dev-postgres-1'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim();
    return status === 'healthy';
  } catch {
    return false;
  }
}

/**
 * `docker compose up` is not safe under concurrent invocation from separate
 * processes targeting the same project: even with the container already
 * running, two near-simultaneous `up` calls can both decide a (re)create is
 * needed and collide with "Conflict. The container name ... is already in
 * use". This suite already serializes against
 * tests/integration/access-schema.spec.ts via the migration lock, but
 * tests/integration/system-probe-postgres.spec.ts (E00, out of this task's
 * scope) calls `docker compose up` on its own, unlocked. The health-check
 * short-circuit above handles the common case; retrying past a transient
 * conflict — rather than failing the whole suite — handles the rest: by the
 * retry, the container that "won" the race is already up, and this call
 * becomes a no-op health check.
 */
function composeUpWithRetry(): void {
  // Short-circuit entirely when another process already brought the
  // container up and healthy — this is what makes the common case a single
  // winner instead of three concurrent `docker compose up` calls.
  if (isPostgresContainerHealthy()) {
    return;
  }

  const maxAttempts = 10;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      compose('up', '--detach', '--wait', '--wait-timeout', '120', 'postgres');
      return;
    } catch (error) {
      if (isPostgresContainerHealthy()) {
        // Another process's concurrent `up` finished the job while this
        // attempt was mid-flight and reported the conflict; nothing left to do.
        return;
      }
      const message = error instanceof Error ? error.message : String(error);
      if (attempt === maxAttempts || !message.includes('Conflict')) {
        throw error;
      }
      execFileSync('sleep', [String(1 + Math.floor(Math.random() * 2))]);
    }
  }
}

function migrate(direction: 'up' | 'down', migration = '0002_access_workshop'): void {
  execFileSync('bash', ['scripts/migrate-diagnostic.sh', direction, migration], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    env: { ...process.env, DATABASE_URL: SUPERUSER_DATABASE_URL, APP_ENV: 'test' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

async function seedWorkshop(
  name: string,
  phoneDigest: string,
): Promise<{ workshopId: string; membershipId: string; accountId: string }> {
  const account = await superuserPool!.query<{ account_id: string }>(
    `INSERT INTO accounts (account_id, phone_digest, created_at)
     VALUES (gen_random_uuid(), $1, now()) RETURNING account_id`,
    [phoneDigest],
  );
  const accountId = account.rows[0]!.account_id;

  const workshop = await superuserPool!.query<{ workshop_id: string }>(
    `INSERT INTO workshops (workshop_id, name, created_at)
     VALUES (gen_random_uuid(), $1, now()) RETURNING workshop_id`,
    [name],
  );
  const workshopId = workshop.rows[0]!.workshop_id;

  const membership = await superuserPool!.query<{ membership_id: string }>(
    `INSERT INTO memberships (membership_id, account_id, workshop_id, role, created_at)
     VALUES (gen_random_uuid(), $1, $2, 'owner', now()) RETURNING membership_id`,
    [accountId, workshopId],
  );
  const membershipId = membership.rows[0]!.membership_id;

  await superuserPool!.query(
    `INSERT INTO owner_pin_credentials (workshop_id, pin_digest, updated_at)
     VALUES ($1, $2, now())`,
    [workshopId, `argon2id$${name}`],
  );

  return { workshopId, membershipId, accountId };
}

before(async () => {
  await acquireMigrationLock();

  composeUpWithRetry();

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

  await superuserPool.query(
    `TRUNCATE owner_money_grants, owner_pin_failure_states, owner_pin_credentials,
              application_sessions, memberships, workshop_vehicle_types, workshops, accounts`,
  );

  workshopA = await seedWorkshop('Workshop A', 'digest-of-phone-a');
  workshopB = await seedWorkshop('Workshop B', 'digest-of-phone-b');
});

after(async () => {
  await superuserPool?.end();
  await appPool?.end();
  // The container and the applied migration are left running: tearing down
  // here would fight other suites sharing the same database.
  releaseMigrationLock();
});

/** Runs `work` as the application role, transaction-local RLS scope set to `workshopId`. */
async function asScopedAppRole<T>(
  workshopId: string,
  work: (client: PoolClientLike) => Promise<T>,
): Promise<T> {
  const client = await appPool!.connect();
  try {
    await client.query('BEGIN');
    await client.query(`SELECT set_config('garazo.workshop_id', $1, true)`, [workshopId]);
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

test('test_EARS_E01_T02_1_workshop_scope_reads_only_its_own_membership_row', async () => {
  assert.ok(databaseAvailable, 'the test database did not start');

  // The attack: scoped to workshop A, explicitly ask for workshop B's
  // membership row by primary key. A repository bug that forgot a WHERE
  // clause, or RLS silently disabled, would leak it here.
  const attackResult = await asScopedAppRole(workshopA.workshopId, (client) =>
    client.query<{ membership_id: string }>(
      `SELECT membership_id FROM memberships WHERE membership_id = $1`,
      [workshopB.membershipId],
    ),
  );
  assert.equal(
    attackResult.rows.length,
    0,
    'workshop A scope must not be able to read workshop B membership row',
  );

  // Sanity: the SAME scope CAN read its own row, proving the zero result
  // above is isolation, not a broken query.
  const ownResult = await asScopedAppRole(workshopA.workshopId, (client) =>
    client.query<{ membership_id: string }>(
      `SELECT membership_id FROM memberships WHERE membership_id = $1`,
      [workshopA.membershipId],
    ),
  );
  assert.equal(ownResult.rows.length, 1, 'workshop A scope must still read its own membership row');
});

test('test_EARS_E01_T02_1_unfiltered_scan_of_a_scoped_table_returns_only_the_scoped_workshop', async () => {
  assert.ok(databaseAvailable, 'the test database did not start');

  // No WHERE clause at all — the exact "someone wrote a raw query in a hurry"
  // scenario conventions.md calls out. RLS, not application filtering, is
  // what must save this.
  const rows = await asScopedAppRole(workshopA.workshopId, (client) =>
    client.query<{ workshop_id: string }>(`SELECT workshop_id FROM workshops`),
  );
  assert.equal(rows.rows.length, 1, 'an unfiltered scan must still return exactly one workshop');
  assert.equal(rows.rows[0]!.workshop_id, workshopA.workshopId);

  const memberships = await asScopedAppRole(workshopA.workshopId, (client) =>
    client.query<{ workshop_id: string }>(`SELECT workshop_id FROM memberships`),
  );
  assert.ok(
    memberships.rows.every((row) => row.workshop_id === workshopA.workshopId),
    'an unfiltered membership scan must never include workshop B',
  );
});

test('test_NFR_SEC_01_a_query_with_no_scope_set_returns_nothing_from_a_scoped_table', async () => {
  assert.ok(databaseAvailable, 'the test database did not start');

  // The application role, no `garazo.workshop_id` set at all — as if the
  // guard (tenant-guard.ts) were bypassed entirely. Proves RLS is the actual
  // backstop, not merely present.
  const client = await appPool!.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query<{ workshop_id: string }>(`SELECT workshop_id FROM workshops`);
    assert.equal(result.rows.length, 0, 'an unscoped connection must see zero workshop rows');
    await client.query('ROLLBACK');
  } finally {
    client.release();
  }
});

test('test_NFR_SEC_01_tenant_scope_does_not_leak_across_a_pooled_connection', async () => {
  assert.ok(databaseAvailable, 'the test database did not start');

  // Force a small pool so the SAME underlying connection is very likely to be
  // reused, then prove the scope set on request 1 is gone for request 2.
  const { Pool } = requireFromServerCore('pg') as { Pool: new (config: object) => PoolLike };
  const smallPool = new Pool({ connectionString: APP_ROLE_DATABASE_URL, max: 1 });
  try {
    await asScopedAppRoleOnPool(smallPool, workshopA.workshopId, async (client) => {
      const result = await client.query<{ workshop_id: string }>(
        `SELECT workshop_id FROM workshops`,
      );
      assert.equal(result.rows.length, 1, 'the scoped transaction must see its own workshop');
    });

    // A brand-new transaction on the (likely reused) connection, no scope set.
    const client = await smallPool.connect();
    try {
      await client.query('BEGIN');
      const leaked = await client.query<{ setting: string | null }>(
        `SELECT current_setting('garazo.workshop_id', true) AS setting`,
      );
      // PostgreSQL represents "never set at session level" for a custom GUC as
      // either SQL NULL (never touched this session) or '' (touched via
      // `set_config(..., true)` earlier, then reverted to the session
      // default at COMMIT) — never the workshop id that was set locally.
      // Either value proves the local setting from the prior transaction did
      // NOT survive; only a literal leak of workshopA's id would fail this.
      assert.notEqual(
        leaked.rows[0]!.setting,
        workshopA.workshopId,
        'garazo.workshop_id must not survive past COMMIT on a pooled connection',
      );
      assert.ok(
        leaked.rows[0]!.setting === null || leaked.rows[0]!.setting === '',
        `expected the transaction-local setting to have reverted to unset, got ${JSON.stringify(leaked.rows[0]!.setting)}`,
      );
      const rows = await client.query<{ workshop_id: string }>(`SELECT workshop_id FROM workshops`);
      assert.equal(rows.rows.length, 0, 'a fresh unscoped transaction must see zero workshop rows');
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }
  } finally {
    await smallPool.end();
  }
});

async function asScopedAppRoleOnPool<T>(
  pool: PoolLike,
  workshopId: string,
  work: (client: PoolClientLike) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`SELECT set_config('garazo.workshop_id', $1, true)`, [workshopId]);
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

test('test_EARS_E01_T02_1_repository_layer_via_withTenantScope_cannot_reach_another_workshop', async () => {
  assert.ok(databaseAvailable, 'the test database did not start');

  const { withTenantScope } = requireFromServerCore(
    join(repositoryRoot, 'packages/server-core/dist/access/tenant-guard.js'),
  ) as {
    withTenantScope<T>(
      pool: unknown,
      scope: unknown,
      work: (client: unknown) => Promise<T>,
    ): Promise<T>;
  };
  const { asOpaqueId: asOpaqueIdFn } = requireFromServerCore(
    join(repositoryRoot, 'packages/server-core/dist/access/access-context.js'),
  ) as { asOpaqueId(value: string): unknown };

  const { Pool } = requireFromServerCore('pg') as { Pool: new (config: object) => PoolLike };
  const scopedPool = new Pool({ connectionString: APP_ROLE_DATABASE_URL, max: 5 });
  try {
    const scope = { kind: 'workshop', workshopId: asOpaqueIdFn(workshopA.workshopId) };

    const result = await withTenantScope(scopedPool, scope, async (client: PoolClientLike) => {
      return client.query<{ membership_id: string }>(
        `SELECT membership_id FROM memberships WHERE membership_id = $1`,
        [workshopB.membershipId],
      );
    });

    assert.equal(
      (result as { rows: unknown[] }).rows.length,
      0,
      'withTenantScope for workshop A must not be able to fetch workshop B membership row',
    );
  } finally {
    await scopedPool.end();
  }
});

test('test_NFR_SEC_01_superuser_connection_bypasses_rls_confirming_the_app_role_is_the_correct_test_subject', async () => {
  assert.ok(databaseAvailable, 'the test database did not start');

  // Negative control: the superuser (table-owner) connection is NOT scoped by
  // RLS at all (PostgreSQL rule: table owners always bypass RLS). If this
  // assertion ever fails, every other test in this file is testing the wrong
  // connection and its "zero rows" results would be meaningless.
  const result = await superuserPool!.query<{ workshop_id: string }>(
    `SELECT workshop_id FROM workshops`,
  );
  assert.equal(result.rows.length, 2, 'the superuser connection must see both seeded workshops');
});
