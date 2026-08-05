// E00-T03 · validated runtime configuration (L-process-005, NFR-SEC-01).
//
// Every process validates its whole environment BEFORE bootstrap and refuses to
// start if anything is wrong. A service that boots with half its configuration
// fails later, in production, under load — and by then the cause is three
// layers away from the symptom.
//
// Validation is hand-written rather than schema-library-driven: this task's
// dependency gate permits no new runtime library, and the rules are small
// enough that a dependency would cost more than it saves.

export type ServiceName = 'admin' | 'api' | 'worker';
export type AppEnv = 'development' | 'test' | 'staging' | 'production';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const APP_ENVS: readonly AppEnv[] = ['development', 'test', 'staging', 'production'];
const LOG_LEVELS: readonly LogLevel[] = ['debug', 'info', 'warn', 'error'];

export interface RuntimeConfig {
  readonly service: ServiceName;
  readonly appEnv: AppEnv;
  readonly logLevel: LogLevel;

  /** API only. */
  readonly apiPort?: number;
  /** API and worker. Never logged — see redactLogFields. */
  readonly databaseUrl?: string;
  /** API only. Always false in production. */
  readonly walkingSkeletonEnabled?: boolean;

  /** Worker only. E00 runs 1; not a throughput commitment. */
  readonly workerConcurrency?: number;

  /** Admin only. */
  readonly apiBaseUrl?: string;

  // Boundary-only keys. Named so operators can see the shape of what is coming,
  // unused until each provider's adapter task is approved. Deliberately NO
  // credential keys exist yet (ADR-0004).
  readonly objectStorageEndpoint?: string;
  readonly objectStorageBucket?: string;
  readonly firebaseProjectId?: string;
  readonly smsProvider?: string;
}

/**
 * Raised when configuration is unusable.
 *
 * The message names KEYS and never values. A configuration error is precisely
 * where a database URL with an embedded password would otherwise be printed to
 * a log, a terminal, or a CI transcript.
 */
export class ConfigError extends Error {
  readonly keys: readonly string[];

  constructor(problems: readonly string[], keys: readonly string[]) {
    super(`invalid configuration: ${problems.join('; ')}`);
    this.name = 'ConfigError';
    this.keys = keys;
  }
}

type Env = Record<string, string | undefined>;

function requiredString(env: Env, key: string, problems: string[], keys: string[]): string {
  const value = env[key];
  if (value === undefined || value.trim() === '') {
    problems.push(`${key} is required`);
    keys.push(key);
    return '';
  }
  return value;
}

function requiredEnum<T extends string>(
  env: Env,
  key: string,
  allowed: readonly T[],
  problems: string[],
  keys: string[],
): T {
  const value = requiredString(env, key, problems, keys);
  if (value !== '' && !allowed.includes(value as T)) {
    // Lists what is ALLOWED, never what was supplied.
    problems.push(`${key} must be one of ${allowed.join(', ')}`);
    keys.push(key);
  }
  return value as T;
}

function requiredInteger(
  env: Env,
  key: string,
  min: number,
  max: number,
  problems: string[],
  keys: string[],
): number {
  const raw = requiredString(env, key, problems, keys);
  if (raw === '') {
    return 0;
  }
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    problems.push(`${key} must be an integer between ${min} and ${max}`);
    keys.push(key);
    return 0;
  }
  return parsed;
}

function requiredBoolean(env: Env, key: string, problems: string[], keys: string[]): boolean {
  const raw = requiredString(env, key, problems, keys);
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  if (raw !== '') {
    problems.push(`${key} must be exactly "true" or "false"`);
    keys.push(key);
  }
  return false;
}

function optionalString(env: Env, key: string): string | undefined {
  const value = env[key];
  return value === undefined || value.trim() === '' ? undefined : value;
}

/**
 * Validates the environment for one service and returns immutable config.
 *
 * Every problem is collected before throwing, so an operator fixes one round of
 * errors instead of rediscovering them one restart at a time.
 */
export function loadRuntimeConfig(service: ServiceName, env: Env): RuntimeConfig {
  const problems: string[] = [];
  const keys: string[] = [];

  const appEnv = requiredEnum(env, 'APP_ENV', APP_ENVS, problems, keys);
  const logLevel = requiredEnum(env, 'LOG_LEVEL', LOG_LEVELS, problems, keys);

  const config: Record<string, unknown> = { service, appEnv, logLevel };

  if (service === 'api') {
    config.apiPort = requiredInteger(env, 'API_PORT', 1, 65535, problems, keys);
    config.databaseUrl = requiredString(env, 'DATABASE_URL', problems, keys);

    const walkingSkeletonEnabled = requiredBoolean(env, 'WALKING_SKELETON_ENABLED', problems, keys);
    // Defence in depth. T02's route already refuses in production; refusing to
    // BOOT means a mis-set production flag is caught at deploy time, loudly,
    // rather than sitting armed and unnoticed.
    if (walkingSkeletonEnabled && appEnv === 'production') {
      problems.push('WALKING_SKELETON_ENABLED must be false when APP_ENV is production');
      keys.push('WALKING_SKELETON_ENABLED');
    }
    config.walkingSkeletonEnabled = walkingSkeletonEnabled;
  }

  if (service === 'worker') {
    config.databaseUrl = requiredString(env, 'DATABASE_URL', problems, keys);
    config.workerConcurrency = requiredInteger(env, 'WORKER_CONCURRENCY', 1, 64, problems, keys);
  }

  if (service === 'admin') {
    config.apiBaseUrl = requiredString(env, 'API_BASE_URL', problems, keys);
  }

  config.objectStorageEndpoint = optionalString(env, 'OBJECT_STORAGE_ENDPOINT');
  config.objectStorageBucket = optionalString(env, 'OBJECT_STORAGE_BUCKET');
  config.firebaseProjectId = optionalString(env, 'FIREBASE_PROJECT_ID');
  config.smsProvider = optionalString(env, 'SMS_PROVIDER');

  if (problems.length > 0) {
    throw new ConfigError(problems, keys);
  }

  // Frozen so a later code path cannot quietly repoint the database at runtime.
  return Object.freeze(config) as unknown as RuntimeConfig;
}
