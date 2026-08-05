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
