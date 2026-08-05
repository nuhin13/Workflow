/**
 * @garazo/server-core public surface (E00-T01).
 *
 * Composition roots (apps/api, apps/worker) may import only what is
 * exported here — never a path under `src/modules/**` or `src/ports/**`
 * directly (`conventions.md` §2/§4). No adapter is bound to a port at this
 * stage; that is a later approved task.
 */
export { registerModuleBoundary } from './modules/module-boundary';
export type { ModuleBoundary } from './modules/module-boundary';

export type { DurableJobPort, DurableJobIntent } from './ports/durable-job.port';
export type { PhoneIdentityPort, PhoneIdentityResult } from './ports/phone-identity.port';
export type { SmsSenderPort, SmsMessage, SmsSendResult } from './ports/sms-sender.port';
export type {
  ObjectStoragePort,
  PrivateObject,
  ObjectReference,
} from './ports/object-storage.port';

// Access boundary (E00-T02). Authorization is what the SERVER resolved; a
// client-supplied identifier is data, never authority (NFR-SEC-01, ADR-0007).
export { asOpaqueId, anonymousContext } from './access/access-context';
export type {
  OpaqueId,
  EpochMillis,
  AuthenticatedActor,
  WorkshopScope,
  RequestContext,
} from './access/access-context';

export { lockedOwnerMoneyGrant, grantsMoneyAccess } from './access/owner-money-grant';
export type { OwnerMoneyGrant } from './access/owner-money-grant';

export { noAdminScope, hasAdminPermission } from './access/admin-scope';
export type { AdminScope, AdminPermission } from './access/admin-scope';

// System diagnostic (E00-T04). The PostgreSQL adapter is exported so the API
// composition root can bind it; nothing else may depend on it.
export { RunSystemProbeUseCase } from './system/run-system-probe.use-case';
export { PostgresSystemProbeRepository } from './system/postgres-system-probe.repository';
export { SYSTEM_PROBE_KEY } from './system/system-probe';
export type {
  SystemProbeRecord,
  SystemProbeRepository,
  SystemProbeResult,
} from './system/system-probe';
