// E00-T04 · real PostgreSQL readiness (binds T02's port).

import type { Pool } from 'pg';
import type { ReadinessCheck } from './system.service';

/**
 * Answers whether the database is actually reachable.
 *
 * `SELECT 1` is deliberate: it touches no table, so readiness stays true even
 * before migrations run, and it cannot be affected by product data. It proves
 * exactly one thing — a connection can be acquired and a round trip completes.
 *
 * Every failure returns false rather than throwing. A readiness endpoint that
 * 500s with a driver message discloses the host, the port and often the user,
 * which is the disclosure NFR-SEC-01 exists to prevent.
 */
export class PostgresReadinessCheck implements ReadinessCheck {
  private readonly pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async isDatabaseReachable(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}
