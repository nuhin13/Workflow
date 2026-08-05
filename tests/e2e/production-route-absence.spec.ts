// E00-T05 · the diagnostic must be unreachable in production (EARS-E00-13).
//
// The walking-skeleton route writes to the database without authentication. In
// development that is the point; in production it would be an unauthenticated
// write endpoint on a customer's system. One guard is a single point of
// failure, so there are four, and this asserts each independently.
//
// The API is booted with production configuration in a child process rather
// than asserted from source alone, because "the code looks right" is exactly
// the confidence that ships an exposed endpoint.

import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import test, { after, before } from 'node:test';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const PORT = 3987;
const BASE = `http://127.0.0.1:${PORT}`;

function read(path: string): string {
  return readFileSync(join(repositoryRoot, path), 'utf8');
}

let api: ReturnType<typeof spawn> | undefined;

before(async () => {
  if (!existsSync(join(repositoryRoot, 'apps/api/dist/main.js'))) {
    execFileSync('corepack', ['pnpm', '--filter', '@garazo/api', 'run', 'build'], {
      cwd: repositoryRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  }

  // A genuine production configuration. The flag is left OFF here because the
  // config layer refuses to boot with it on — that refusal is asserted
  // separately below, in its own process.
  api = spawn(process.execPath, ['apps/api/dist/main.js'], {
    cwd: repositoryRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      PATH: process.env.PATH ?? '',
      APP_ENV: 'production',
      LOG_LEVEL: 'error',
      API_PORT: String(PORT),
      // Unreachable on purpose: this suite must not touch a real database, and
      // route absence has nothing to do with database health.
      DATABASE_URL: 'postgres://garazo:unused@127.0.0.1:1/garazo',
      WALKING_SKELETON_ENABLED: 'false',
    },
  });

  // Wait for the port to answer rather than sleeping a fixed time.
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      await fetch(`${BASE}/api/v1/system/live`);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error('the production-mode API never became reachable');
});

after(() => {
  api?.kill('SIGTERM');
});

test('test_EARS_E00_13_production_route_and_page_are_absent', async () => {
  const response = await fetch(`${BASE}/api/v1/system/walking-skeleton`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  assert.equal(response.status, 404);

  const body = (await response.json()) as { error: { code: string } };
  assert.equal(body.error.code, 'SYSTEM.NOT_FOUND');

  // Must be indistinguishable from any unknown path. A distinct code or message
  // would confirm the route exists and is merely disabled, which is the hint an
  // attacker needs to start looking for a way to enable it.
  const unknown = await fetch(`${BASE}/api/v1/system/definitely-not-a-route`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const unknownBody = (await unknown.json()) as { error: { code: string; messageKey: string } };

  assert.equal(unknown.status, response.status);
  assert.equal(unknownBody.error.code, body.error.code);
  assert.equal(
    unknownBody.error.messageKey,
    (body as { error: { messageKey: string } }).error.messageKey,
  );
});

test('test_EARS_E00_13_production_refuses_to_boot_with_the_flag_enabled', async () => {
  // The second guard, in its own process: even a deliberate misconfiguration
  // cannot produce a running production API with the diagnostic armed.
  const child = spawn(process.execPath, ['apps/api/dist/main.js'], {
    cwd: repositoryRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      PATH: process.env.PATH ?? '',
      APP_ENV: 'production',
      LOG_LEVEL: 'error',
      API_PORT: '3988',
      DATABASE_URL: 'postgres://garazo:unused@127.0.0.1:1/garazo',
      WALKING_SKELETON_ENABLED: 'true',
    },
  });

  let output = '';
  child.stdout?.on('data', (chunk: Buffer) => {
    output += chunk.toString();
  });

  const code = await new Promise<number | null>((resolve) => {
    child.once('exit', (exitCode) => resolve(exitCode));
  });

  assert.notEqual(code, 0, 'production booted with the diagnostic flag enabled');
  assert.match(output, /invalid configuration/);
  assert.match(output, /WALKING_SKELETON_ENABLED/);
});

test('test_EARS_E00_13_flutter_route_is_compiled_out_of_release_builds', () => {
  // The third guard. `bool.fromEnvironment('dart.vm.product')` is a COMPILE-TIME
  // constant, so the route map is const-folded and the diagnostic page is
  // tree-shaken out of a release binary. There is nothing to reach even with a
  // debugger attached — stronger than any runtime check.
  const app = read('apps/mobile/lib/app/app.dart');

  assert.match(
    app,
    /const bool systemProbeRouteEnabled = !bool\.fromEnvironment\('dart\.vm\.product'\)/,
  );
  assert.match(app, /if \(systemProbeRouteEnabled\)/);

  // The page must not be reachable from anywhere else in the app.
  const shellSources = ['apps/mobile/lib/main.dart', 'apps/mobile/lib/app/app.dart'];
  for (const path of shellSources) {
    const source = read(path);
    assert.ok(
      !/Navigator\.[a-zA-Z]+\([^)]*SystemProbePage/.test(source),
      `${path} navigates to the diagnostic page outside the guarded route table`,
    );
  }
});

test('test_EARS_E00_13_production_topology_hardwires_the_flag_off', () => {
  // The fourth guard: even a correct image with a mis-set host environment is
  // overridden by the topology itself.
  const compose = read('infra/compose/compose.production.yaml');
  assert.match(compose, /WALKING_SKELETON_ENABLED: "false"/);
  assert.ok(
    !/WALKING_SKELETON_ENABLED:\s*\$\{/.test(compose),
    'production makes the diagnostic flag overridable from the environment',
  );
});

test('test_EARS_E00_13_sensitive_fixture_absent_from_logs_errors_evidence', () => {
  // Evidence documents are written for humans and get pasted into chats and
  // tickets. Anything credential-shaped in them is a leak with a long life.
  const fixtures = [
    'sk_live_',
    'AKIA',
    'BEGIN RSA PRIVATE KEY',
    'eyJhbGciOi',
    // A real Bangladeshi phone number shape — the product's core PII.
    '+8801712345678',
  ];

  const evidenceFiles = [
    'docs/evidence/walking-skeleton.md',
    'docs/evidence/vm-recovery-rehearsal.md',
    'docs/security/baseline.md',
    'docs/architecture/system-map.md',
    'docs/architecture/adr-consequence-audit.md',
    'docs/operations/local-development.md',
  ];

  for (const path of evidenceFiles) {
    assert.ok(existsSync(join(repositoryRoot, path)), `${path} is missing`);
    const source = read(path);

    for (const fixture of fixtures) {
      assert.ok(!source.includes(fixture), `${path} contains a sensitive fixture: ${fixture}`);
    }

    // The local development placeholder is the ONE credential-shaped string
    // allowed to appear, and only where it is labelled as local-only.
    if (source.includes('garazo-local-dev')) {
      assert.match(
        source,
        /local|development|placeholder/i,
        `${path} shows the local credential without saying it is local-only`,
      );
    }
  }
});
