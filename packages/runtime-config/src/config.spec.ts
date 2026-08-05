// E00-T03 · configuration contract (L-process-005, NFR-SEC-01).
//
// Configuration is the most common source of "worked on my machine, dead in
// production". Two rules are tested here: fail CLOSED before bootstrap when
// anything required is missing, and never echo a value in the failure.

import assert from 'node:assert/strict';
import test from 'node:test';
import { ConfigError, loadRuntimeConfig } from './config.ts';

const API_ENV = {
  APP_ENV: 'development',
  LOG_LEVEL: 'info',
  API_PORT: '3000',
  DATABASE_URL: 'postgres://user:s3cr3t-password@db.internal:5432/garazo',
  WALKING_SKELETON_ENABLED: 'true',
};

const WORKER_ENV = {
  APP_ENV: 'development',
  LOG_LEVEL: 'info',
  DATABASE_URL: 'postgres://user:s3cr3t-password@db.internal:5432/garazo',
  WORKER_CONCURRENCY: '1',
};

test('test_L_PROCESS_005_required_config_is_present_in_all_launchers', () => {
  const api = loadRuntimeConfig('api', API_ENV);
  assert.equal(api.service, 'api');
  assert.equal(api.appEnv, 'development');
  assert.equal(api.apiPort, 3000);
  assert.equal(api.databaseUrl, API_ENV.DATABASE_URL);
  assert.equal(api.walkingSkeletonEnabled, true);

  const worker = loadRuntimeConfig('worker', WORKER_ENV);
  assert.equal(worker.service, 'worker');
  assert.equal(worker.workerConcurrency, 1);

  const admin = loadRuntimeConfig('admin', {
    APP_ENV: 'development',
    LOG_LEVEL: 'info',
    API_BASE_URL: 'http://api:3000',
  });
  assert.equal(admin.apiBaseUrl, 'http://api:3000');
});

test('test_L_PROCESS_005_missing_required_key_fails_closed', () => {
  for (const missing of ['APP_ENV', 'DATABASE_URL', 'API_PORT']) {
    const env: Record<string, string | undefined> = { ...API_ENV };
    delete env[missing];

    assert.throws(
      () => loadRuntimeConfig('api', env),
      (error: unknown) => {
        assert.ok(error instanceof ConfigError);
        assert.ok(
          error.message.includes(missing),
          `error should name the missing key ${missing}: ${error.message}`,
        );
        return true;
      },
    );
  }
});

test('test_NFR_SEC_01_config_errors_name_keys_but_never_values', () => {
  // An invalid DATABASE_URL is the dangerous case: the natural error message
  // would quote the string, which contains the password.
  const env = { ...API_ENV, DATABASE_URL: 'postgres://user:s3cr3t-password@bad', API_PORT: 'abc' };

  try {
    loadRuntimeConfig('api', env);
    assert.fail('expected loadRuntimeConfig to throw');
  } catch (error) {
    assert.ok(error instanceof ConfigError);
    assert.ok(error.message.includes('API_PORT'), 'should name the offending key');
    assert.ok(!error.message.includes('s3cr3t-password'), 'must not echo a secret value');
    assert.ok(!error.message.includes('abc'), 'must not echo the offending value');
    assert.ok(!JSON.stringify(error).includes('s3cr3t-password'));
  }
});

test('test_NFR_SEC_01_production_rejects_the_walking_skeleton_flag', () => {
  // Defence in depth: T02's route already refuses in production, and the config
  // layer refuses to even load a production process that asks for it.
  assert.throws(
    () =>
      loadRuntimeConfig('api', {
        ...API_ENV,
        APP_ENV: 'production',
        WALKING_SKELETON_ENABLED: 'true',
      }),
    ConfigError,
  );

  const safe = loadRuntimeConfig('api', {
    ...API_ENV,
    APP_ENV: 'production',
    WALKING_SKELETON_ENABLED: 'false',
  });
  assert.equal(safe.walkingSkeletonEnabled, false);
});

test('test_L_PROCESS_005_invalid_enum_values_are_rejected', () => {
  assert.throws(
    () => loadRuntimeConfig('api', { ...API_ENV, APP_ENV: 'staging-ish' }),
    ConfigError,
  );
  assert.throws(() => loadRuntimeConfig('api', { ...API_ENV, LOG_LEVEL: 'chatty' }), ConfigError);
  assert.throws(() => loadRuntimeConfig('api', { ...API_ENV, API_PORT: '70000' }), ConfigError);
  assert.throws(
    () => loadRuntimeConfig('worker', { ...WORKER_ENV, WORKER_CONCURRENCY: '0' }),
    ConfigError,
  );
});

test('test_L_PROCESS_005_config_is_immutable', () => {
  const config = loadRuntimeConfig('api', API_ENV);
  assert.throws(() => {
    (config as { apiPort: number }).apiPort = 9999;
  }, TypeError);
});

test('test_NFR_SEC_01_boundary_keys_are_optional_and_absent_by_default', () => {
  // These name future provider boundaries. They must not be required now, and
  // no credential key may exist until its adapter task is approved.
  const config = loadRuntimeConfig('api', API_ENV);
  assert.equal(config.objectStorageEndpoint, undefined);
  assert.equal(config.firebaseProjectId, undefined);

  const withBoundaries = loadRuntimeConfig('api', {
    ...API_ENV,
    OBJECT_STORAGE_ENDPOINT: 'https://objects.example',
    FIREBASE_PROJECT_ID: 'garazo-dev',
  });
  assert.equal(withBoundaries.objectStorageEndpoint, 'https://objects.example');
});
