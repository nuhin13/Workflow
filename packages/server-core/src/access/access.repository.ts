// E01-T02 · access repository contract (NFR-SEC-01, NFR-SEC-02, ADR-0007).
//
// The interface lives in its own file so that consumers depend on the
// CONTRACT and never on the PostgreSQL adapter (conventions.md §2). Every
// method that touches a workshop-scoped table is parameterized with a
// server-resolved scope, never a client-supplied identifier.

import type { EpochMillis, OpaqueId, WorkshopScope } from './access-context.ts';

/** A Garazo access account. Never carries the raw phone number. */
export interface Account {
  readonly accountId: OpaqueId;
  /** One-way digest of the verified phone number (EARS-E01-T02-2). */
  readonly phoneDigest: string;
  readonly createdAt: EpochMillis;
  readonly disabledAt: EpochMillis | null;
}

/** Validated input for the first-time account + workshop + membership transaction. */
export interface NewWorkshopInput {
  /** One-way digest of the verified phone number; never the raw number. */
  readonly phoneDigest: string;
  readonly workshopName: string;
  /** At least one approved vehicle-type key (Q-008). No client-supplied identifier. */
  readonly vehicleTypes: readonly string[];
  readonly now: EpochMillis;
}

/** The workshop context created by {@link AccessRepository.createAccountWithWorkshop}. */
export interface WorkshopSummary {
  readonly accountId: OpaqueId;
  readonly workshopId: OpaqueId;
  readonly membershipId: OpaqueId;
  readonly name: string;
  readonly regionProfile: string;
  readonly locale: string;
  readonly createdAt: EpochMillis;
}

/** A Garazo application session, resolved from its token digest. */
export interface SessionRecord {
  readonly sessionId: OpaqueId;
  readonly accountId: OpaqueId;
  /** Null until workshop setup completes (E00 note: a real, representable state). */
  readonly workshopId: OpaqueId | null;
  readonly tokenDigest: string;
  readonly issuedAt: EpochMillis;
  readonly expiresAt: EpochMillis;
  readonly revokedAt: EpochMillis | null;
}

/** The owner-PIN failure/cooldown state a workshop is currently in (Q-005). */
export interface FailureState {
  readonly workshopId: OpaqueId;
  readonly consecutiveFailures: number;
  readonly completedCycles: number;
  readonly cooldownUntil: EpochMillis | null;
  readonly updatedAt: EpochMillis;
}

/**
 * The persistence boundary for the access domain.
 *
 * Every method that reaches a workshop-scoped table does so only through
 * `withTenantScope` (`./tenant-guard.ts`) — that function, not this
 * interface, is what makes an unscoped scoped-query impossible.
 */
export interface AccessRepository {
  /** Account lookup without the raw phone number ever reaching storage. Never throws on absence. */
  findAccountByPhoneDigest(digest: string): Promise<Account | null>;

  /** One transaction creating account, workshop, and membership together. */
  createAccountWithWorkshop(input: NewWorkshopInput): Promise<WorkshopSummary>;

  /** Resolve authority from the session, never from request input. Never throws on absence. */
  findSessionByTokenDigest(digest: string): Promise<SessionRecord | null>;

  /** Atomic failure accounting that concurrency cannot under-count (EARS-E01-T02-4). */
  recordPinFailure(scope: WorkshopScope): Promise<FailureState>;
}
