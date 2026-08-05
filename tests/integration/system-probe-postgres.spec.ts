// E00-T04 · integration against a REAL PostgreSQL (EARS-E00-9, EARS-E00-10).
//
// A fake repository proves the use case's logic; only a real database proves
// the SQL. The atomic-upsert claim in particular cannot be verified against a
// stub — losing increments under concurrency is exactly the bug a stub hides,
// because a stub has no concurrency.
//
// The database is started from infra/compose/compose.development.yaml.

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

const DATABASE_URL = 'postgres://garazo:garazo-local-dev@127.0.0.1:5432/garazo';
const COMPOSE_FILE = 'infra/compose/compose.development.yaml';

interface PoolLike {
  query(text: string, values?: readonly unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
  end(): Promise<void>;
}

let pool: PoolLike | undefined;
let databaseAvailable = false;

function compose(...args: string[]): string {
  return execFileSync('docker', ['compose', '-f', COMPOSE_FILE, ...args], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

before(async () => {
  // Start ONLY the database. Building the application images here would make a
  // repository test depend on three Dockerfiles and take minutes.
  compose('up', '--detach', '--wait', '--wait-timeout', '120', 'postgres');

  execFileSync('bash', ['scripts/migrate-diagnostic.sh', 'up'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    env: { ...process.env, DATABASE_URL, APP_ENV: 'test' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const { Pool } = requireFromServerCore('pg') as { Pool: new (config: object) => PoolLike };
  pool = new Pool({ connectionString: DATABASE_URL, max: 20 });
  databaseAvailable = true;
});

after(async () => {
  await pool?.end();
  // The container is left running: tearing it down here would fight any other
  // suite using it, and `make down` is the deliberate stop.
});

/** Returns the probe table to a known-empty state before each assertion. */
async function resetProbe(): Promise<void> {
  await pool!.query('DELETE FROM system_probes');
}

test('test_EARS_E00_9_probe_round_trip_persists_and_returns', async () => {
  assert.ok(databaseAvailable, 'the test database did not start');
  await resetProbe();

  const { PostgresSystemProbeRepository } = requireFromServerCore(
    join(repositoryRoot, 'packages/server-core/dist/system/postgres-system-probe.repository.js'),
  ) as {
    PostgresSystemProbeRepository: new (pool: PoolLike) => {
      increment(): Promise<{ visitCount: number; updatedAt: Date }>;
    };
  };

  const repository = new PostgresSystemProbeRepository(pool!);

  // First call must exercise the INSERT path — the migration deliberately
  // seeds no row, so a broken insert cannot hide behind an existing one.
  const first = await repository.increment();
  assert.equal(first.visitCount, 1);
  assert.ok(first.updatedAt instanceof Date);

  const second = await repository.increment();
  assert.equal(second.visitCount, 2);
  assert.ok(second.updatedAt >= first.updatedAt);
});

test('test_EARS_E00_9_parallel_probe_increments_are_atomic', async () => {
  assert.ok(databaseAvailable, 'the test database did not start');
  await resetProbe();

  const { PostgresSystemProbeRepository } = requireFromServerCore(
    join(repositoryRoot, 'packages/server-core/dist/system/postgres-system-probe.repository.js'),
  ) as {
    PostgresSystemProbeRepository: new (pool: PoolLike) => {
      increment(): Promise<{ visitCount: number }>;
    };
  };

  const repository = new PostgresSystemProbeRepository(pool!);

  // The load-bearing test. A read-then-write implementation passes every
  // sequential test above and fails here: concurrent callers read the same
  // value and overwrite each other, so increments vanish with no error.
  const concurrency = 25;
  const results = await Promise.all(
    Array.from({ length: concurrency }, () => repository.increment()),
  );

  const counts = results.map((result) => result.visitCount).sort((a, b) => a - b);

  assert.deepEqual(
    counts,
    Array.from({ length: concurrency }, (_, index) => index + 1),
    'concurrent increments were not distinct — the upsert is not atomic',
  );

  const final = await pool!.query('SELECT visit_count FROM system_probes');
  assert.equal(Number(final.rows[0]!.visit_count), concurrency);
});

test('test_EARS_E00_9_migration_constrains_the_table_to_the_diagnostic_key', async () => {
  assert.ok(databaseAvailable, 'the test database did not start');

  // The CHECK is what stops this "temporary" table quietly becoming a generic
  // key-value store that nobody can safely drop later.
  await assert.rejects(
    () =>
      pool!.query(
        `INSERT INTO system_probes (probe_key, visit_count, updated_at)
         VALUES ('some-product-key', 1, now())`,
      ),
    /violates check constraint/,
  );

  await assert.rejects(
    () =>
      pool!.query(
        `INSERT INTO system_probes (probe_key, visit_count, updated_at)
         VALUES ('walking-skeleton', -1, now())
         ON CONFLICT (probe_key) DO UPDATE SET visit_count = -1`,
      ),
    /violates check constraint/,
  );
});

test('test_EARS_E00_10_unreachable_database_reports_down_without_detail', async () => {
  const { Pool } = requireFromServerCore('pg') as { Pool: new (config: object) => PoolLike };
  const { PostgresReadinessCheck } = requireFromServerCore(
    join(repositoryRoot, 'apps/api/dist/system/postgres-readiness.check.js'),
  ) as {
    PostgresReadinessCheck: new (pool: PoolLike) => { isDatabaseReachable(): Promise<boolean> };
  };

  // Port 1 is closed. The check must answer false rather than throwing: a
  // readiness endpoint that propagates a driver error discloses the host, the
  // port and usually the user.
  const deadPool = new Pool({
    connectionString: 'postgres://garazo:garazo-local-dev@127.0.0.1:1/garazo',
    connectionTimeoutMillis: 2000,
  });

  try {
    const check = new PostgresReadinessCheck(deadPool);
    assert.equal(await check.isDatabaseReachable(), false);
  } finally {
    await deadPool.end().catch(() => {});
  }

  // And the healthy path still answers true, so the check is not simply
  // hard-coded to false.
  const { PostgresReadinessCheck: Check } = requireFromServerCore(
    join(repositoryRoot, 'apps/api/dist/system/postgres-readiness.check.js'),
  ) as {
    PostgresReadinessCheck: new (pool: PoolLike) => { isDatabaseReachable(): Promise<boolean> };
  };
  assert.equal(await new Check(pool!).isDatabaseReachable(), true);
});

test('test_EARS_E00_9_down_migration_removes_only_the_diagnostic_table', async () => {
  assert.ok(databaseAvailable, 'the test database did not start');

  // A neighbouring table stands in for product data. The down-migration must
  // not touch it — a rollback that reaches beyond its own migration is how a
  // bad night becomes a data-loss incident.
  await pool!.query('CREATE TABLE IF NOT EXISTS not_a_probe (id int primary key)');

  try {
    execFileSync('bash', ['scripts/migrate-diagnostic.sh', 'down'], {
      cwd: repositoryRoot,
      encoding: 'utf8',
      env: { ...process.env, DATABASE_URL, APP_ENV: 'test' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const probe = await pool!.query("SELECT to_regclass('public.system_probes') AS present");
    assert.equal(probe.rows[0]!.present, null, 'system_probes survived the down migration');

    const neighbour = await pool!.query("SELECT to_regclass('public.not_a_probe') AS present");
    assert.notEqual(
      neighbour.rows[0]!.present,
      null,
      'the down migration destroyed an unrelated table',
    );
  } finally {
    await pool!.query('DROP TABLE IF EXISTS not_a_probe');
    // Restore the schema for any test that runs after this one.
    execFileSync('bash', ['scripts/migrate-diagnostic.sh', 'up'], {
      cwd: repositoryRoot,
      encoding: 'utf8',
      env: { ...process.env, DATABASE_URL, APP_ENV: 'test' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  }
});

test('test_NFR_SEC_01_migration_runner_refuses_production', () => {
  // The guard that stops a mistyped environment migrating the wrong database.
  assert.throws(() => {
    execFileSync('bash', ['scripts/migrate-diagnostic.sh', 'up'], {
      cwd: repositoryRoot,
      encoding: 'utf8',
      env: { ...process.env, DATABASE_URL, APP_ENV: 'production' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  });
});
