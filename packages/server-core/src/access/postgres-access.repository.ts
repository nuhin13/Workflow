// E01-T02 · PostgreSQL adapter for the access repository (ADR-0004 adapter edge).
//
// Everything above this file speaks only `AccessRepository`. All
// workshop-scoped reads/writes go through `withTenantScope`
// (../access/tenant-guard.ts) except the two operations documented below
// that legitimately run before a workshop scope exists — see the "bootstrap"
// comment in infra/db/migrations/0002_access_workshop.up.sql for the full
// rationale.
//
// This adapter takes a `pg.Pool` structurally (`PgPool` below) rather than
// importing the `pg` package: `tests/architecture/module-boundaries.spec.ts`
// (out of this task's file scope) enumerates the exact set of files that may
// import a provider driver, and adding to that list is not this task's to do
// unasked. A structural type accepts a real `pg.Pool`/`PoolClient` at the
// composition root without this file naming the package, so the boundary
// test's existing list stays authoritative and untouched. See this task's
// Open Questions/Deviations note.

import { randomUUID } from 'node:crypto';
import { asOpaqueId, type OpaqueId, type WorkshopScope } from './access-context';
import type {
  Account,
  AccessRepository,
  FailureState,
  NewWorkshopInput,
  SessionRecord,
  WorkshopSummary,
} from './access.repository';
import { withTenantScope } from './tenant-guard';

/** Structural shape of a `pg.Pool` query result. Matches `pg`'s real return shape. */
interface PgQueryResult<Row> {
  rows: Row[];
}

/** Structural shape of a `pg.PoolClient`. Matches `pg`'s real client without importing it. */
interface PgClient {
  query<Row = Record<string, unknown>>(
    text: string,
    values?: readonly unknown[],
  ): Promise<PgQueryResult<Row>>;
  release(): void;
}

/** Structural shape of a `pg.Pool`. A real `pg.Pool` instance satisfies this. */
interface PgPool {
  query<Row = Record<string, unknown>>(
    text: string,
    values?: readonly unknown[],
  ): Promise<PgQueryResult<Row>>;
  connect(): Promise<PgClient>;
}

interface AccountRow {
  account_id: string;
  phone_digest: string;
  created_at: Date;
  disabled_at: Date | null;
}

interface SessionRow {
  session_id: string;
  account_id: string;
  workshop_id: string | null;
  token_digest: string;
  issued_at: Date;
  expires_at: Date;
  revoked_at: Date | null;
}

interface FailureStateRow {
  consecutive_failures: number;
  completed_cycles: number;
  cooldown_until: Date | null;
  updated_at: Date;
}

function toAccount(row: AccountRow): Account {
  return {
    accountId: asOpaqueId(row.account_id),
    phoneDigest: row.phone_digest,
    createdAt: row.created_at.getTime(),
    disabledAt: row.disabled_at ? row.disabled_at.getTime() : null,
  };
}

function toSessionRecord(row: SessionRow): SessionRecord {
  return {
    sessionId: asOpaqueId(row.session_id),
    accountId: asOpaqueId(row.account_id),
    workshopId: row.workshop_id ? asOpaqueId(row.workshop_id) : null,
    tokenDigest: row.token_digest,
    issuedAt: row.issued_at.getTime(),
    expiresAt: row.expires_at.getTime(),
    revokedAt: row.revoked_at ? row.revoked_at.getTime() : null,
  };
}

/**
 * Runs `work` inside one transaction with the `garazo.bootstrap` flag set
 * transaction-locally. Reserved for the two operations that must run before
 * any workshop scope can exist: creating the first account/workshop/
 * membership, and resolving a session by its token digest. Never exported —
 * nothing outside this adapter may reach for it.
 */
async function withBootstrapContext<T>(
  pool: PgPool,
  work: (client: PgClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`SELECT set_config('garazo.bootstrap', 'true', true)`);
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

export class PostgresAccessRepository implements AccessRepository {
  private readonly pool: PgPool;

  constructor(pool: PgPool) {
    this.pool = pool;
  }

  async findAccountByPhoneDigest(digest: string): Promise<Account | null> {
    // `accounts` carries no RLS policy (conventions: not workshop-scoped); a
    // plain pool query is correct here, not a scope bypass.
    const result = await this.pool.query<AccountRow>(
      `SELECT account_id, phone_digest, created_at, disabled_at
       FROM accounts
       WHERE phone_digest = $1`,
      [digest],
    );

    const row = result.rows[0];
    return row ? toAccount(row) : null;
  }

  async createAccountWithWorkshop(input: NewWorkshopInput): Promise<WorkshopSummary> {
    if (input.vehicleTypes.length === 0) {
      throw new Error('createAccountWithWorkshop: at least one vehicle type is required');
    }

    return withBootstrapContext(this.pool, async (client) => {
      const accountId = randomUUID();
      const workshopId = randomUUID();
      const membershipId = randomUUID();
      const now = new Date(input.now);

      await client.query(
        `INSERT INTO accounts (account_id, phone_digest, created_at) VALUES ($1, $2, $3)`,
        [accountId, input.phoneDigest, now],
      );

      const workshopResult = await client.query<{
        workshop_id: string;
        name: string;
        region_profile: string;
        locale: string;
        created_at: Date;
      }>(
        `INSERT INTO workshops (workshop_id, name, created_at)
         VALUES ($1, $2, $3)
         RETURNING workshop_id, name, region_profile, locale, created_at`,
        [workshopId, input.workshopName, now],
      );
      const workshopRow = workshopResult.rows[0];
      if (workshopRow === undefined) {
        throw new Error('createAccountWithWorkshop: workshop insert returned no row');
      }

      for (const vehicleType of input.vehicleTypes) {
        await client.query(
          `INSERT INTO workshop_vehicle_types (workshop_id, vehicle_type) VALUES ($1, $2)`,
          [workshopId, vehicleType],
        );
      }

      await client.query(
        `INSERT INTO memberships (membership_id, account_id, workshop_id, role, created_at)
         VALUES ($1, $2, $3, 'owner', $4)`,
        [membershipId, accountId, workshopId, now],
      );

      return {
        accountId: asOpaqueId(accountId),
        workshopId: asOpaqueId(workshopRow.workshop_id),
        membershipId: asOpaqueId(membershipId),
        name: workshopRow.name,
        regionProfile: workshopRow.region_profile,
        locale: workshopRow.locale,
        createdAt: workshopRow.created_at.getTime(),
      };
    });
  }

  async findSessionByTokenDigest(digest: string): Promise<SessionRecord | null> {
    // One statement, one implicit transaction: `set_config(..., true)` and the
    // read below run in the SAME transaction via a CTE, so the bootstrap flag
    // never survives past this single round trip and never leaks to another
    // pooled connection. The token digest is a unique-indexed lookup — at
    // most one row is ever returned regardless of workshop.
    const result = await this.pool.query<SessionRow>(
      `WITH _ctx AS (SELECT set_config('garazo.bootstrap', 'true', true))
       SELECT session_id, account_id, workshop_id, token_digest, issued_at, expires_at, revoked_at
       FROM application_sessions, _ctx
       WHERE token_digest = $1`,
      [digest],
    );

    const row = result.rows[0];
    return row ? toSessionRecord(row) : null;
  }

  async recordPinFailure(scope: WorkshopScope): Promise<FailureState> {
    return withTenantScope(this.pool, scope, async (client) => {
      // assertScoped inside withTenantScope guarantees scope.kind === 'workshop'.
      if (scope.kind !== 'workshop') {
        throw new Error('recordPinFailure: unreachable — withTenantScope already asserted scope');
      }
      const workshopId: OpaqueId = scope.workshopId;

      // ONE atomic statement, same shape as the E00 probe-counter upsert
      // (postgres-system-probe.repository.ts): a read-then-write here would
      // let concurrent invalid attempts under-count (EARS-E01-T02-4).
      const result = await client.query<FailureStateRow>(
        `INSERT INTO owner_pin_failure_states (workshop_id, consecutive_failures, completed_cycles, cooldown_until, updated_at)
         VALUES ($1, 1, 0, NULL, transaction_timestamp())
         ON CONFLICT (workshop_id) DO UPDATE SET
           consecutive_failures = CASE
             WHEN owner_pin_failure_states.consecutive_failures + 1 >= 5 THEN 0
             ELSE owner_pin_failure_states.consecutive_failures + 1
           END,
           completed_cycles = CASE
             WHEN owner_pin_failure_states.consecutive_failures + 1 >= 5
               THEN owner_pin_failure_states.completed_cycles + 1
             ELSE owner_pin_failure_states.completed_cycles
           END,
           cooldown_until = CASE
             WHEN owner_pin_failure_states.consecutive_failures + 1 >= 5 THEN
               transaction_timestamp() + (
                 CASE owner_pin_failure_states.completed_cycles + 1
                   WHEN 1 THEN interval '60 seconds'
                   WHEN 2 THEN interval '120 seconds'
                   ELSE interval '240 seconds'
                 END
               )
             ELSE owner_pin_failure_states.cooldown_until
           END,
           updated_at = transaction_timestamp()
         RETURNING consecutive_failures, completed_cycles, cooldown_until, updated_at`,
        [workshopId],
      );

      const row = result.rows[0];
      if (row === undefined) {
        throw new Error('recordPinFailure: upsert returned no row');
      }

      return {
        workshopId,
        consecutiveFailures: row.consecutive_failures,
        completedCycles: row.completed_cycles,
        cooldownUntil: row.cooldown_until ? row.cooldown_until.getTime() : null,
        updatedAt: row.updated_at.getTime(),
      };
    });
  }
}
