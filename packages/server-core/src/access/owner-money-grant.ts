// E00-T02 · owner-money grant (ADR-0007, BRD Law 2, Q-004 answer).
//
// Being signed in does NOT let you see money. Due amounts, bill dues, reminder
// ROI and attributed income are protected behind a SEPARATE owner-PIN grant,
// because Garazo runs on a shared workshop phone where a mechanic may hold the
// device while the owner is away.
//
// This is deliberately a distinct type from WorkshopScope and AdminScope so
// that no function can accept one where another is required. E01 issues real
// grants; E00 only fixes the shape.

import type { EpochMillis, OpaqueId } from './access-context';

/**
 * Permission to read protected money values.
 *
 * `locked` is the default state and must stay representable: the app spends
 * most of its life locked, and code that cannot express "locked" ends up
 * leaking amounts.
 */
export type OwnerMoneyGrant =
  | { readonly kind: 'locked' }
  | {
      readonly kind: 'granted';
      /** The workshop this grant unlocks. A grant is never global. */
      readonly workshopId: OpaqueId;
      /**
       * Hard expiry. The grant relocks on explicit lock, on leaving a protected
       * route, on app background, and after inactivity — those are client-side
       * lifecycle events, while this is the server-side ceiling.
       */
      readonly expiresAt: EpochMillis;
    };

/** The default: money stays masked. */
export const lockedOwnerMoneyGrant: OwnerMoneyGrant = { kind: 'locked' };

/**
 * True only when this grant currently unlocks money for the given workshop.
 *
 * Callers must use this rather than checking `kind` themselves, so the expiry
 * and workshop-match checks can never be forgotten independently.
 */
export function grantsMoneyAccess(
  grant: OwnerMoneyGrant,
  workshopId: OpaqueId,
  now: EpochMillis,
): boolean {
  return grant.kind === 'granted' && grant.workshopId === workshopId && grant.expiresAt > now;
}
