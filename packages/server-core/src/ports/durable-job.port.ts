/**
 * Durable job port (E00-T01).
 *
 * Reserves the accepted "consequential background work" boundary
 * (`conventions.md` §4: durable intent in the same PostgreSQL transaction,
 * replay-safe worker handler) without selecting a queue library. No adapter
 * exists yet; a later approved task binds this port to a concrete
 * implementation inside its owning module.
 */

/** Provider-neutral durable work identity and kind. Opaque — no product payload. */
export interface DurableJobIntent {
  /** Idempotency/dedupe identity for this unit of durable work. */
  readonly intentId: string;
  /** Stable, provider-neutral job kind, e.g. "reminder.dispatch". */
  readonly kind: string;
}

export interface DurableJobPort {
  /**
   * @param intent provider-neutral durable work identity and kind.
   * @returns resolves only after durable acceptance.
   */
  enqueue(intent: DurableJobIntent): Promise<void>;
}
