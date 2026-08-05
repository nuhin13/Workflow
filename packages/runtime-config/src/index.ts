/**
 * @garazo/runtime-config public surface (E00-T03).
 *
 * Configuration is validated once, before bootstrap, and logging is redacted on
 * the way out. Consumers import from here — never from a path inside src/ —
 * so the internal layout stays free to change (conventions.md §2/§4).
 */
export { loadRuntimeConfig, ConfigError } from './config';
export type { RuntimeConfig, ServiceName, AppEnv, LogLevel } from './config';

export { createStructuredLogger, redactLogFields, REDACTED } from './logger';
export type { Logger, LogSink, LogRecord, SafeLogRecord } from './logger';

export {
  installGracefulShutdown,
  markWorkerReady,
  clearWorkerReady,
  WORKER_READY_MARKER,
} from './lifecycle';
export type { ClosableApplication } from './lifecycle';
