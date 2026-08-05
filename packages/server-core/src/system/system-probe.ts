// E00-T04 · diagnostic probe types.
//
// Deliberately domain-neutral. Nothing here names a workshop, customer,
// vehicle, job or amount, because this is a proof that the architecture works
// — not a product record. If a later epic wants to reuse these types, that is a
// signal the epic needs its own model, not that this one should grow.

/** One retained diagnostic counter row. */
export interface SystemProbeRecord {
  readonly visitCount: number;
  readonly updatedAt: Date;
}

/** What the use case returns to the transport layer. */
export interface SystemProbeResult {
  readonly status: 'persisted';
  readonly visitCount: number;
  readonly correlationId: string;
}

/**
 * Persistence boundary for the probe.
 *
 * `increment` is one operation rather than a read followed by a write. Under
 * concurrency a read-then-write loses increments silently — two callers read 4,
 * both write 5, and one round trip vanishes without an error anywhere. The
 * interface forbids that shape rather than trusting each adapter to remember.
 */
export interface SystemProbeRepository {
  increment(): Promise<SystemProbeRecord>;
}

/** The only key this diagnostic ever writes. Matches the migration's CHECK. */
export const SYSTEM_PROBE_KEY = 'walking-skeleton';
