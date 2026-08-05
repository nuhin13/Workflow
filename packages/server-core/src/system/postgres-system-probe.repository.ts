// E00-T04 · PostgreSQL adapter for the diagnostic probe.
//
// This file is an ADAPTER EDGE: it is one of the few places allowed to import a
// provider driver (ADR-0004). Everything above it speaks only
// SystemProbeRepository, so replacing PostgreSQL would mean writing a sibling
// of this file and nothing else.

import type { Pool } from 'pg';
import {
  SYSTEM_PROBE_KEY,
  type SystemProbeRecord,
  type SystemProbeRepository,
} from './system-probe';

/**
 * Increments the probe counter in a single atomic statement.
 *
 * The whole operation is ONE `INSERT … ON CONFLICT DO UPDATE`. A read followed
 * by a write would lose increments under concurrency without erroring anywhere:
 * two callers read 4, both write 5, and one round trip disappears. PostgreSQL
 * takes a row lock for the duration of the upsert, so concurrent callers
 * serialise on it and every call is counted exactly once.
 *
 * `RETURNING` gives back the committed value rather than a value we computed
 * ourselves, so the number reported to the user is the number in the database.
 */
export class PostgresSystemProbeRepository implements SystemProbeRepository {
  private readonly pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async increment(): Promise<SystemProbeRecord> {
    const result = await this.pool.query<{ visit_count: string; updated_at: Date }>(
      `INSERT INTO system_probes (probe_key, visit_count, updated_at)
       VALUES ($1, 1, transaction_timestamp())
       ON CONFLICT (probe_key) DO UPDATE
         SET visit_count = system_probes.visit_count + 1,
             updated_at  = transaction_timestamp()
       RETURNING visit_count, updated_at`,
      [SYSTEM_PROBE_KEY],
    );

    const row = result.rows[0];
    if (row === undefined) {
      throw new Error('system probe upsert returned no row');
    }

    // node-postgres returns bigint as a STRING, because bigint does not fit a
    // JavaScript number exactly. Parsing here — and letting the use case reject
    // anything outside the safe range — keeps that decision visible instead of
    // silently truncating.
    const visitCount = Number(row.visit_count);

    return { visitCount, updatedAt: row.updated_at };
  }
}
