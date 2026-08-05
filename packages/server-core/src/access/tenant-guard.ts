// E01-T02 · tenant scope enforcement (NFR-SEC-01, EARS-E01-T02-1).
//
// This file is the APPLICATION layer of the two-layer isolation guarantee
// (PostgreSQL row-level security is the other, see
// infra/db/migrations/0002_access_workshop.up.sql). `withTenantScope` is the
// ONLY way any code in this package may query a workshop-scoped table; there
// is no other exported way to obtain a scoped connection.

import type { WorkshopScope } from './access-context.ts';

/** The narrowed, always-authoritative branch of {@link WorkshopScope}. */
export type WorkshopScoped = Extract<WorkshopScope, { kind: 'workshop' }>;

/**
 * Narrows `scope` to {@link WorkshopScoped}, throwing for `{ kind: 'none' }`.
 *
 * This turns "someone forgot to check the scope" from a runtime discovery
 * (wrong/empty data returned silently) into an immediate, loud failure at the
 * one call site that matters — the moment a scoped query is about to run.
 */
export function assertScoped(scope: WorkshopScope): asserts scope is WorkshopScoped {
  if (scope.kind !== 'workshop') {
    throw new Error(
      'tenant-guard: refusing to run a scoped query against an unscoped WorkshopScope',
    );
  }
}

/** The minimal client surface `withTenantScope` needs from a `pg` pooled connection. */
export interface TenantScopedClient {
  query<Row = Record<string, unknown>>(
    text: string,
    values?: readonly unknown[],
  ): Promise<{ rows: Row[] }>;
}

/** The minimal pool surface `withTenantScope` needs from a `pg.Pool`. */
export interface TenantScopePool {
  connect(): Promise<TenantScopedClient & { release(): void }>;
}

/**
 * Runs `work` inside one PostgreSQL transaction with the RLS setting
 * `garazo.workshop_id` set to `scope.workshopId`, and only ever that.
 *
 * Two things make this safe:
 *
 * 1. `assertScoped` runs FIRST, before a connection is even acquired, so an
 *    unscoped call never touches the pool at all (EARS-E01-T02-1).
 * 2. `set_config(name, value, true)` — the trailing `true` — is
 *    TRANSACTION-LOCAL. Without it, the setting would survive past `COMMIT`
 *    and leak to whichever unrelated request the pool hands this same
 *    connection to next: one workshop would inherit another's scope, the
 *    exact opposite of what this function exists to guarantee.
 */
export async function withTenantScope<T>(
  pool: TenantScopePool,
  scope: WorkshopScope,
  work: (client: TenantScopedClient) => Promise<T>,
): Promise<T> {
  assertScoped(scope);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`SELECT set_config('garazo.workshop_id', $1, true)`, [scope.workshopId]);

    const result = await work(client);

    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {
      // Rollback failure is not more informative than the original error; the
      // original is what the caller needs to see.
    });
    throw error;
  } finally {
    client.release();
  }
}
