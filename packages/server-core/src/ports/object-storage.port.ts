/**
 * Object storage port (E00-T01).
 *
 * Keeps object binaries out of PostgreSQL (`conventions.md` §2): PostgreSQL
 * stores structured authoritative records, private object storage holds
 * binaries referenced by workshop-scoped metadata. No adapter exists yet.
 */

/** Private binary stream plus server-resolved ownership context. Opaque. */
export interface PrivateObject {
  /** Server-resolved, provider-neutral ownership scope; never client-supplied. */
  readonly ownerScopeRef: string;
  /** Idempotency identity for this upload attempt. */
  readonly uploadId: string;
}

/** Provider-neutral private object reference. */
export interface ObjectReference {
  readonly objectRef: string;
}

export interface ObjectStoragePort {
  /**
   * @param object private binary stream plus server-resolved ownership context.
   * @returns provider-neutral private object reference.
   */
  put(object: PrivateObject): Promise<ObjectReference>;
}
