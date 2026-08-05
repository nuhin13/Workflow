// E00-T03 · infrastructure contracts (EARS-E00-6, EARS-E00-8).
//
// These assert the shape of the deployment, not just that the files parse.
// The production topology is the one place where a single careless line —
// adding a `postgres` service — would put every workshop's only copy of its
// money records on a host the architecture explicitly accepts losing.

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

function read(path: string): string {
  return readFileSync(join(repositoryRoot, path), 'utf8');
}

/** Resolves a Compose file through the docker CLI, so we test what Docker sees. */
function composeServices(file: string): string[] {
  const output = execFileSync('docker', ['compose', '-f', file, 'config', '--services'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      // Placeholders purely to satisfy required interpolation; the topology
      // is what is under test, not these values.
      APP_ENV: 'production',
      DATABASE_URL: 'postgres://placeholder',
      GARAZO_API_IMAGE: 'placeholder',
      GARAZO_WORKER_IMAGE: 'placeholder',
      GARAZO_ADMIN_IMAGE: 'placeholder',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return output.trim().split('\n').filter(Boolean).sort();
}

test('test_EARS_E00_6_production_compose_has_only_application_services', () => {
  const services = composeServices('infra/compose/compose.production.yaml');

  assert.deepEqual(
    services,
    ['admin', 'api', 'worker'],
    'production must run exactly the three application services',
  );

  const source = read('infra/compose/compose.production.yaml');

  // Belt and braces: catch a datastore added under any service name.
  for (const forbidden of ['postgres', 'postgresql', 'mysql', 'redis', 'minio', 's3', 'mongo']) {
    assert.ok(
      !new RegExp(`image:\\s*\\S*${forbidden}`, 'i').test(source),
      `production Compose declares a ${forbidden} image; data services stay external (ADR-0005/0006)`,
    );
  }

  // No volume means nothing on this host is authoritative.
  assert.ok(
    !/^volumes:/m.test(source),
    'production Compose declares a volume; nothing on the application VM may be authoritative',
  );
});

test('test_ADR_0006_production_services_are_hardened', () => {
  const source = read('infra/compose/compose.production.yaml');

  const occurrences = (needle: string): number => source.split(needle).length - 1;

  // One per service, for all three.
  assert.equal(occurrences('no-new-privileges:true'), 3);
  assert.equal(occurrences('read_only: true'), 3);
  assert.equal(occurrences('healthcheck:'), 3);
  assert.equal(occurrences('restart: unless-stopped'), 3);
  assert.equal(occurrences('stop_grace_period:'), 3);

  // DATABASE_URL must be required, never defaulted: a default would silently
  // point production at the wrong datastore.
  assert.match(source, /DATABASE_URL: \$\{DATABASE_URL:\?\}/);

  // The diagnostic write path is hard-wired off in production.
  assert.match(source, /WALKING_SKELETON_ENABLED: "false"/);
});

test('test_ADR_0006_each_service_image_is_non_root', () => {
  for (const app of ['api', 'worker', 'admin']) {
    const dockerfile = read(`apps/${app}/Dockerfile`);

    assert.match(
      dockerfile,
      /adduser -S -G garazo garazo/,
      `${app} does not create a service user`,
    );
    assert.match(dockerfile, /^USER garazo$/m, `${app} does not drop to a non-root user`);
    assert.match(dockerfile, /HEALTHCHECK/, `${app} declares no health check`);

    // Multi-stage, so no compiler or dev dependency ships in the runtime image.
    assert.ok(
      (dockerfile.match(/^FROM /gm) ?? []).length >= 2,
      `${app} is not a multi-stage build`,
    );

    // A shell-form CMD means SIGTERM reaches the shell, not node, and graceful
    // shutdown never runs.
    assert.match(dockerfile, /CMD \[/, `${app} must use exec-form CMD so SIGTERM reaches node`);

    // Never invent a digest. If one appears it must be real; a fabricated one
    // is worse than an honest tag pin.
    const digests = dockerfile.match(/sha256:[0-9a-f]{64}/g) ?? [];
    assert.deepEqual(digests, [], `${app} pins a digest; verify it against the chosen registry`);
  }
});

test('test_EARS_E00_8_compose_down_preserves_named_volumes', () => {
  const script = read('scripts/compose-down.sh');

  // The whole point: a developer stopping the stack must not lose local data,
  // and a command that sometimes deletes data teaches people to fear it.
  assert.ok(!/\bdown\b[^\n]*(-v|--volumes)/.test(script), 'compose-down removes volumes');
  assert.ok(
    !/docker volume rm[^\n]*$/m.test(script.replace(/^echo.*$/gm, '')),
    'compose-down deletes a volume outside an echo',
  );
  assert.match(script, /down --remove-orphans/);

  const devCompose = read('infra/compose/compose.development.yaml');
  assert.match(devCompose, /garazo-postgres-data:/);
});

test('test_L_PROCESS_005_required_config_is_present_in_all_launchers', () => {
  // A key that exists in code but not in .env.example, Compose or the docs is a
  // key the next operator discovers at 03:00.
  const example = read('.env.example');
  const devCompose = read('infra/compose/compose.development.yaml');
  const prodCompose = read('infra/compose/compose.production.yaml');
  const configDoc = read('docs/operations/configuration.md');

  for (const key of [
    'APP_ENV',
    'LOG_LEVEL',
    'API_PORT',
    'DATABASE_URL',
    'WALKING_SKELETON_ENABLED',
  ]) {
    assert.ok(example.includes(key), `.env.example is missing ${key}`);
    assert.ok(configDoc.includes(key), `configuration.md is missing ${key}`);
  }

  for (const key of ['APP_ENV', 'LOG_LEVEL', 'DATABASE_URL']) {
    assert.ok(devCompose.includes(key), `development Compose is missing ${key}`);
    assert.ok(prodCompose.includes(key), `production Compose is missing ${key}`);
  }

  assert.ok(read('.env.example').includes('WORKER_CONCURRENCY'));
  assert.ok(read('.env.example').includes('API_BASE_URL'));
});

test('test_NFR_SEC_01_no_real_secret_or_endpoint_is_committed', () => {
  // Runs the actual scanner, so the test and CI cannot disagree.
  const output = execFileSync('bash', ['scripts/scan-secrets.sh'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  assert.match(output, /no credential patterns found/);

  // The only committed credential-shaped strings are the documented local
  // placeholders, and they must stay local-only.
  const devCompose = read('infra/compose/compose.development.yaml');
  assert.match(devCompose, /garazo-local-dev/);
  assert.ok(
    !read('infra/compose/compose.production.yaml').includes('garazo-local-dev'),
    'a local placeholder credential reached the production topology',
  );

  assert.ok(!existsSync(join(repositoryRoot, '.env')), 'a real .env exists in the repository');
});

test('test_ADR_0006_open_items_are_recorded_rather_than_guessed', () => {
  // The runbooks are only trustworthy if they are honest about what is not yet
  // decided. A runbook that reads as complete but silently assumes a supplier
  // fails on the day it is needed.
  const openItems = read('infra/vm/recovery-open-items.md');
  for (const decision of ['registry', 'secret manager', 'RPO', 'RTO', 'Backup', 'digest']) {
    assert.ok(
      openItems.toLowerCase().includes(decision.toLowerCase()),
      `open items do not record the ${decision} decision`,
    );
  }

  for (const runbook of ['deploy-runbook.md', 'rollback-runbook.md', 'rebuild-runbook.md']) {
    assert.match(
      read(`infra/vm/${runbook}`),
      /BLOCKED/,
      `${runbook} claims to be executable despite unresolved production decisions`,
    );
  }
});

test('test_NFR_SEC_01_ci_verifies_but_cannot_deploy', () => {
  const ci = read('.github/workflows/ci.yml');

  // A pipeline that can reach production can be made to reach production by
  // anyone who can open a pull request.
  assert.match(ci, /permissions:\s*\n\s*contents: read/);
  for (const term of ['deploy', 'ssh', 'scp', 'kubectl']) {
    assert.ok(
      !new RegExp(`^\\s*(run|uses):.*\\b${term}\\b`, 'im').test(ci),
      `CI appears to perform a ${term} step; CI verifies, it does not deploy`,
    );
  }

  assert.match(ci, /scan-secrets\.sh/);
  assert.match(ci, /check:api/);
  assert.match(ci, /check:tokens/);

  // Since E00-T05 the Compose smoke runs INSIDE the clean-clone gate rather
  // than as its own CI step, so asserting the literal script name here would
  // fail for a change that improved coverage. What matters is that the runtime
  // check still happens: the gate must run, and the gate must include it.
  assert.match(ci, /verify-clean-clone\.sh/);
  assert.match(
    readFileSync(join(repositoryRoot, 'scripts/verify-clean-clone.sh'), 'utf8'),
    /verify-compose\.sh/,
    'the clean-clone gate no longer runs the Compose smoke',
  );
});
