// E01-T01 · access error vocabulary (ADR-0007, Q-005, Q-009, L-auth-003).
//
// Added to the ONE error envelope's ErrorCode enum (conventions.md §3, E00).
// Defined once here so the OpenAPI contract, the API implementation, and
// tests all read from the same list and cannot silently drift apart.

export type AccessErrorCode =
  | 'AUTH.INVALID_CREDENTIALS'
  | 'AUTH.SESSION_INVALID'
  | 'AUTH.PIN_INVALID'
  | 'AUTH.PIN_COOLDOWN'
  | 'AUTH.PIN_NOT_SET'
  | 'AUTH.RECOVERY_INVALID'
  | 'AUTH.RECOVERY_COOLDOWN'
  | 'AUTH.GRANT_REQUIRED'
  | 'WORKSHOP.NOT_SET_UP'
  | 'WORKSHOP.ALREADY_SET_UP';

/** The full access error vocabulary, in the order the task contract lists it. */
export const ACCESS_ERROR_CODES: readonly AccessErrorCode[] = [
  'AUTH.INVALID_CREDENTIALS',
  'AUTH.SESSION_INVALID',
  'AUTH.PIN_INVALID',
  'AUTH.PIN_COOLDOWN',
  'AUTH.PIN_NOT_SET',
  'AUTH.RECOVERY_INVALID',
  'AUTH.RECOVERY_COOLDOWN',
  'AUTH.GRANT_REQUIRED',
  'WORKSHOP.NOT_SET_UP',
  'WORKSHOP.ALREADY_SET_UP',
];

/**
 * True only for codes that must stay undifferentiated pre-session
 * (EARS-E01-T01-3, `L-auth-003`).
 *
 * Today that is exactly one code: distinguishing "unknown number" from
 * "wrong code" from "expired assertion" would turn the login endpoint into a
 * phone-number oracle, so every pre-session identity-exchange failure must
 * collapse to `AUTH.INVALID_CREDENTIALS`. `AUTH.SESSION_INVALID` is
 * deliberately excluded: it answers "is there a live session right now",
 * which reveals nothing about whether an account exists.
 */
export function isPreSessionFailure(code: AccessErrorCode): boolean {
  return code === 'AUTH.INVALID_CREDENTIALS';
}
