// E01-T01 · opaque session/grant token types (ADR-0007, BRD Law 2, Q-004).
//
// A Garazo application session proves "signed in". An owner-money grant
// proves "may see protected money right now". They are deliberately
// DIFFERENT branded types so the compiler rejects passing one where the
// other belongs: being signed in must never be expressible as "may see
// money", because Garazo runs on a shared workshop phone where a mechanic
// may hold the device while the owner is away.
//
// Token minting, storage, and lifetime VALUES are a T03/T05 implementation
// decision behind its own dependency gate. This file fixes only the shape.

import type { EpochMillis } from './access-context.ts';

/** Opaque, server-issued application-session token. Never parsed by application code. */
export type SessionToken = string & { readonly __sessionToken: unique symbol };

/**
 * Opaque, server-issued owner-money-grant token.
 *
 * Structurally distinct from {@link SessionToken} even though both are
 * branded strings: the two brand symbols are different, so a `SessionToken`
 * is not assignable to a parameter typed `OwnerGrantToken`, and vice versa.
 */
export type OwnerGrantToken = string & { readonly __ownerGrantToken: unique symbol };

/** Narrows a trusted server-generated string into a {@link SessionToken}. */
export function asSessionToken(value: string): SessionToken {
  return value as SessionToken;
}

/** Narrows a trusted server-generated string into an {@link OwnerGrantToken}. */
export function asOwnerGrantToken(value: string): OwnerGrantToken {
  return value as OwnerGrantToken;
}

/**
 * Wire shape shared by `SessionEnvelope` and `GrantEnvelope` in the OpenAPI
 * contract (§7). Kept generic here so the two envelopes stay structurally
 * identical without becoming the same nominal type.
 */
export interface TokenEnvelope<T extends SessionToken | OwnerGrantToken> {
  readonly token: T;
  readonly expiresAt: EpochMillis;
}

export type SessionEnvelope = TokenEnvelope<SessionToken>;
export type GrantEnvelope = TokenEnvelope<OwnerGrantToken>;
