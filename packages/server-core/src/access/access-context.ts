// E00-T02 · access boundary types (ADR-0007, NFR-SEC-01).
//
// These types exist to make one class of bug impossible: treating something a
// CLIENT sent as something the SERVER decided. A workshop id in a request body
// or header is data. Authorization is only ever what the server resolved from a
// verified session.
//
// No framework type, no provider SDK type, and no product entity may appear
// here. E00 defines the shapes; E01 fills them from real authentication.

/** Opaque server-issued identifier. Never parsed, never derived from input. */
export type OpaqueId = string & { readonly __opaque: unique symbol };

/** Narrows a trusted server-generated string into an OpaqueId. */
export function asOpaqueId(value: string): OpaqueId {
  return value as OpaqueId;
}

/** Milliseconds since the Unix epoch. */
export type EpochMillis = number;

/**
 * The actor behind a request, as resolved by the server.
 *
 * `anonymous` is a first-class state, not a null: E00 has no authentication at
 * all, and every consumer must handle the unauthenticated case explicitly
 * rather than assuming a logged-in actor exists.
 *
 * E01 note: `actorId` identifies the Garazo account behind a rotated
 * application session (`SessionToken`, `./session-token.ts`). It is never a
 * Firebase uid and the session token itself is never carried on this type —
 * a resolved actor is what the token proved, not the token.
 */
export type AuthenticatedActor =
  | { readonly kind: 'anonymous' }
  | {
      readonly kind: 'user';
      /** Server-issued subject id. NOT a phone number and NOT a provider uid. */
      readonly actorId: OpaqueId;
      /** When the session backing this actor stops being valid. */
      readonly sessionExpiresAt: EpochMillis;
    };

/**
 * Which workshop the server decided this request may act on.
 *
 * `none` means the request carries no workshop authority. A client-supplied
 * workshop identifier can never produce anything other than `none` — that is
 * the whole point of this type (NFR-SEC-01).
 *
 * E01 note: an authenticated account that has not finished workshop setup
 * (`WORKSHOP.NOT_SET_UP`) is ALSO `none` — it has no workshop authority yet,
 * for the same reason an anonymous request has none. The distinction between
 * "not signed in" and "signed in, no workshop" lives on `AuthenticatedActor`,
 * not here; this type only ever answers "which workshop, if any".
 */
export type WorkshopScope =
  | { readonly kind: 'none' }
  | {
      readonly kind: 'workshop';
      readonly workshopId: OpaqueId;
      /** Optional branch narrowing; absent means the whole workshop. */
      readonly branchId?: OpaqueId;
    };

/**
 * Immutable per-request context created by the server from untrusted headers.
 *
 * Everything on it is server-decided. It deliberately exposes no raw headers,
 * so downstream code cannot reach around the boundary.
 */
export interface RequestContext {
  /** Safe, server-resolved correlation id. Never identity, never authority. */
  readonly correlationId: string;
  readonly actor: AuthenticatedActor;
  readonly workshopScope: WorkshopScope;
  readonly receivedAt: EpochMillis;
}

/** The unauthenticated, unscoped context every E00 request runs under. */
export function anonymousContext(correlationId: string, receivedAt: EpochMillis): RequestContext {
  return {
    correlationId,
    actor: { kind: 'anonymous' },
    workshopScope: { kind: 'none' },
    receivedAt,
  };
}
