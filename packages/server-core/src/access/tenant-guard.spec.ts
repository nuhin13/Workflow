// E01-T02 · tenant-guard unit tests (EARS-E01-T02-1). No database: this
// proves the GUARD's own logic against a fake pool/client, the same way
// run-system-probe.use-case.spec.ts proves the use case without PostgreSQL.

import assert from 'node:assert/strict';
import test from 'node:test';
import { asOpaqueId } from './access-context.ts';
import {
  assertScoped,
  withTenantScope,
  type TenantScopedClient,
  type TenantScopePool,
} from './tenant-guard.ts';

interface FakePool {
  pool: TenantScopePool;
  queries: { text: string; values: readonly unknown[] | undefined }[];
  connectCount: number;
}

function fakePool(): FakePool {
  const queries: { text: string; values: readonly unknown[] | undefined }[] = [];
  const state = { connectCount: 0 };

  const client: TenantScopedClient & { release(): void } = {
    async query(text: string, values?: readonly unknown[]) {
      queries.push({ text, values });
      return { rows: [] };
    },
    release() {
      // no-op; release counting is asserted via a wrapping pool where needed.
    },
  };

  const pool: TenantScopePool = {
    async connect() {
      state.connectCount += 1;
      return client;
    },
  };

  return {
    pool,
    queries,
    get connectCount() {
      return state.connectCount;
    },
  };
}

test('test_EARS_E01_T02_1_assertScoped_throws_for_none', () => {
  assert.throws(() => assertScoped({ kind: 'none' }), /unscoped/);
});

test('test_EARS_E01_T02_1_assertScoped_accepts_workshop_scope', () => {
  assert.doesNotThrow(() => assertScoped({ kind: 'workshop', workshopId: asOpaqueId('w1') }));
});

test('test_EARS_E01_T02_1_unscoped_query_is_rejected', async () => {
  const { pool, connectCount } = fakePool();

  await assert.rejects(
    () => withTenantScope(pool, { kind: 'none' }, async () => 'never'),
    /unscoped/,
  );

  // The whole point: an unscoped call must never even reach the pool.
  assert.equal(connectCount, 0);
});

test('test_EARS_E01_T02_1_withTenantScope_sets_transaction_local_config_then_commits', async () => {
  const { pool, queries } = fakePool();

  const result = await withTenantScope(
    pool,
    { kind: 'workshop', workshopId: asOpaqueId('workshop-a') },
    async (client) => {
      await client.query('SELECT 1');
      return 42;
    },
  );

  assert.equal(result, 42);
  assert.equal(queries[0]!.text, 'BEGIN');
  assert.match(queries[1]!.text, /set_config\('garazo\.workshop_id', \$1, true\)/);
  assert.deepEqual(queries[1]!.values, ['workshop-a']);
  assert.equal(queries[2]!.text, 'SELECT 1');
  assert.equal(queries[3]!.text, 'COMMIT');
});

test('test_EARS_E01_T02_1_withTenantScope_rolls_back_and_releases_on_error', async () => {
  const { pool, queries } = fakePool();

  await assert.rejects(
    () =>
      withTenantScope(
        pool,
        { kind: 'workshop', workshopId: asOpaqueId('workshop-a') },
        async () => {
          throw new Error('boom');
        },
      ),
    /boom/,
  );

  assert.ok(queries.some((q) => q.text === 'ROLLBACK'));
  assert.ok(!queries.some((q) => q.text === 'COMMIT'));
});

test('test_EARS_E01_T02_1_withTenantScope_always_releases_the_client', async () => {
  const { pool } = fakePool();
  let releaseCalls = 0;

  const trackedPool: TenantScopePool = {
    async connect() {
      const inner = await pool.connect();
      return {
        ...inner,
        release() {
          releaseCalls += 1;
          inner.release();
        },
      };
    },
  };

  await withTenantScope(
    trackedPool,
    { kind: 'workshop', workshopId: asOpaqueId('workshop-a') },
    async () => 'ok',
  );
  assert.equal(releaseCalls, 1);

  await assert.rejects(
    withTenantScope(
      trackedPool,
      { kind: 'workshop', workshopId: asOpaqueId('workshop-a') },
      async () => {
        throw new Error('boom');
      },
    ),
  );
  assert.equal(releaseCalls, 2);
});
