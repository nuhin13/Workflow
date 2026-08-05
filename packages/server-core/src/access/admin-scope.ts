// E00-T02 · admin scope (ADR-0007, SCR-014).
//
// Garazo staff administration is a different authority from workshop
// membership, and neither implies the other. A workshop owner is not an admin,
// and an admin is not silently granted a workshop's private money.
//
// Kept structurally distinct from WorkshopScope and OwnerMoneyGrant so the
// compiler rejects substituting one for another.

import type { EpochMillis, OpaqueId } from './access-context';

/**
 * What a Garazo staff actor is permitted to do.
 *
 * Permissions are enumerated rather than free strings so that adding a new
 * admin capability is a deliberate contract change, reviewable in a diff.
 */
export type AdminPermission =
  | 'config.read'
  | 'config.write'
  | 'flag.write'
  | 'referral.audit'
  | 'support.lookup'
  | 'metrics.read';

export type AdminScope =
  | { readonly kind: 'none' }
  | {
      readonly kind: 'admin';
      readonly adminId: OpaqueId;
      readonly permissions: readonly AdminPermission[];
      readonly expiresAt: EpochMillis;
    };

/** The default: no administrative authority. */
export const noAdminScope: AdminScope = { kind: 'none' };

/**
 * True only when this scope currently carries the permission.
 *
 * Expiry is checked here so no caller can test the permission list alone and
 * accidentally honour a stale scope.
 */
export function hasAdminPermission(
  scope: AdminScope,
  permission: AdminPermission,
  now: EpochMillis,
): boolean {
  return scope.kind === 'admin' && scope.expiresAt > now && scope.permissions.includes(permission);
}
