/**
 * Phone identity port (E00-T01).
 *
 * Keeps provider SDK types (e.g. Firebase) out of domain code
 * (`conventions.md` §2/§3). No adapter exists yet; a later approved task
 * binds this port inside its owning module.
 */

/** Provider-neutral outcome of validating an identity assertion. */
export interface PhoneIdentityResult {
  /** Whether the provider accepted the assertion. */
  readonly verified: boolean;
  /** Provider-neutral, opaque subject identity; never a workshop/owner id. */
  readonly subjectRef: string;
}

export interface PhoneIdentityPort {
  /**
   * @param assertion opaque provider assertion supplied at the adapter edge.
   * @returns provider-neutral identity result; never workshop authorization.
   */
  verify(assertion: string): Promise<PhoneIdentityResult>;
}
