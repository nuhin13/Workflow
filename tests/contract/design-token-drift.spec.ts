import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

function repositoryPath(path: string): string {
  return join(repositoryRoot, path);
}

function requirePaths(paths: readonly string[]): void {
  const missing = paths.filter((path) => !existsSync(repositoryPath(path)));
  assert.deepEqual(missing, [], `required scaffold paths are missing: ${missing.join(', ')}`);
}

function run(command: string, args: readonly string[], cwd = repositoryRoot): string {
  return execFileSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, CI: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function listFiles(path: string): string[] {
  const absolutePath = repositoryPath(path);
  return readdirSync(absolutePath).flatMap((entry) => {
    const child = join(absolutePath, entry);
    if (statSync(child).isDirectory()) {
      return listFiles(relative(repositoryRoot, child));
    }
    return [relative(repositoryRoot, child)];
  });
}

/**
 * Ensures the Flutter app's generated sources exist.
 *
 * AppLocalizations is generated from lib/l10n/*.arb by `flutter pub get` and is
 * deliberately not versioned. On a fresh clone it does not exist yet, so
 * `flutter analyze` fails for a reason that has nothing to do with the change
 * under test. Generating it here makes the suite honest on a clean checkout.
 */
function ensureFlutterGeneratedSources(): void {
  run('flutter', ['pub', 'get'], repositoryPath('apps/mobile'));
}

test('test_EARS_E00_1_each_entry_point_builds', () => {
  ensureFlutterGeneratedSources();
  requirePaths([
    'apps/mobile/pubspec.yaml',
    'apps/mobile/lib/main.dart',
    'apps/admin/package.json',
    'apps/admin/src/app/page.tsx',
    'apps/api/package.json',
    'apps/api/src/main.ts',
    'apps/worker/package.json',
    'apps/worker/src/main.ts',
  ]);

  run('corepack', ['pnpm', '--recursive', '--if-present', 'run', 'build']);
  run('flutter', ['analyze'], repositoryPath('apps/mobile'));
});

test('test_EARS_E00_1_android_owner_shell_builds', () => {
  ensureFlutterGeneratedSources();
  requirePaths([
    'apps/mobile/.metadata',
    'apps/mobile/android/app/build.gradle.kts',
    'apps/mobile/android/app/src/main/AndroidManifest.xml',
    'apps/mobile/android/app/src/main/kotlin/com/garazo/owner/MainActivity.kt',
    'apps/mobile/android/build.gradle.kts',
    'apps/mobile/android/gradle.properties',
    'apps/mobile/android/gradle/wrapper/gradle-wrapper.properties',
    'apps/mobile/android/settings.gradle.kts',
  ]);

  run('flutter', ['analyze'], repositoryPath('apps/mobile'));
  run('flutter', ['test'], repositoryPath('apps/mobile'));
});

test('test_EARS_E00_1_design_token_targets_have_zero_drift', () => {
  requirePaths([
    'scripts/generate-design-tokens.mjs',
    'scripts/check-design-tokens.mjs',
    'packages/design-tokens/src/tokens.ts',
    'apps/mobile/lib/core/design/generated/design_tokens.dart',
  ]);

  run('node', ['scripts/check-design-tokens.mjs']);
});

test('test_EARS_E00_2_api_worker_have_separate_composition_roots', () => {
  requirePaths([
    'apps/api/src/main.ts',
    'apps/api/src/app.module.ts',
    'apps/worker/src/main.ts',
    'apps/worker/src/worker.module.ts',
  ]);

  const apiMain = readFileSync(repositoryPath('apps/api/src/main.ts'), 'utf8');
  const workerMain = readFileSync(repositoryPath('apps/worker/src/main.ts'), 'utf8');
  assert.match(apiMain, /export async function bootstrapApi\(\): Promise<void>/);
  assert.match(workerMain, /export async function bootstrapWorker\(\): Promise<void>/);

  for (const path of listFiles('apps/api/src')) {
    assert.doesNotMatch(
      readFileSync(repositoryPath(path), 'utf8'),
      /(?:from|import\()\s*['"][^'"]*(?:apps\/worker|@garazo\/worker)/,
      `${path} imports the worker composition root`,
    );
  }
  for (const path of listFiles('apps/worker/src')) {
    assert.doesNotMatch(
      readFileSync(repositoryPath(path), 'utf8'),
      /(?:from|import\()\s*['"][^'"]*(?:apps\/api|@garazo\/api)/,
      `${path} imports the API composition root`,
    );
  }
});

test('test_NFR_I18N_01_shell_uses_localization_boundary', () => {
  requirePaths([
    'apps/mobile/l10n.yaml',
    'apps/mobile/lib/l10n/app_bn.arb',
    'apps/mobile/lib/l10n/app_en.arb',
    'apps/mobile/lib/app/app.dart',
  ]);

  const bangla = JSON.parse(
    readFileSync(repositoryPath('apps/mobile/lib/l10n/app_bn.arb'), 'utf8'),
  ) as Record<string, string>;
  const english = JSON.parse(
    readFileSync(repositoryPath('apps/mobile/lib/l10n/app_en.arb'), 'utf8'),
  ) as Record<string, string>;
  assert.equal(typeof bangla.shellNotConfigured, 'string');
  assert.equal(typeof english.shellNotConfigured, 'string');
  assert.notEqual(bangla.shellNotConfigured, english.shellNotConfigured);

  const appSource = readFileSync(repositoryPath('apps/mobile/lib/app/app.dart'), 'utf8');
  assert.match(appSource, /AppLocalizations\.localizationsDelegates/);
  assert.match(appSource, /AppLocalizations\.supportedLocales/);
  assert.match(appSource, /shellNotConfigured/);
});

test('test_NFR_A11Y_01_shell_has_named_root', () => {
  requirePaths(['apps/mobile/lib/app/app.dart', 'apps/admin/src/app/page.tsx']);

  const mobileShell = readFileSync(repositoryPath('apps/mobile/lib/app/app.dart'), 'utf8');
  assert.match(mobileShell, /Semantics\s*\(/);
  assert.match(mobileShell, /label:\s*localizations\.shellRootLabel/);
  assert.match(mobileShell, /focusable:\s*true/);

  const adminShell = readFileSync(repositoryPath('apps/admin/src/app/page.tsx'), 'utf8');
  assert.match(adminShell, /<main[^>]+aria-label=/);
  assert.match(adminShell, /<main[^>]+tabIndex=\{0\}/);
});

/**
 * Boots a built entry point and reports whether it was still resident after
 * `settleMs`, then stops it.
 *
 * This exists because a composition root that boots and exits immediately is
 * indistinguishable from a healthy one in a build log — the worker did exactly
 * that until its event loop was held open explicitly.
 */
async function bootsAndStaysAlive(
  entryPoint: string,
  env: NodeJS.ProcessEnv,
  settleMs = 4000,
): Promise<boolean> {
  const child = spawn(process.execPath, [entryPoint], {
    cwd: repositoryRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, ...env },
  });

  let exitedEarly = false;
  child.once('exit', () => {
    exitedEarly = true;
  });

  try {
    await delay(settleMs);
    return !exitedEarly;
  } finally {
    if (!exitedEarly) {
      child.kill('SIGTERM');
    }
  }
}

test('test_EARS_E00_2_api_and_worker_stay_resident_as_separate_processes', async () => {
  run('corepack', ['pnpm', '--recursive', '--if-present', 'run', 'build']);

  requirePaths(['apps/api/dist/main.js', 'apps/worker/dist/main.js']);

  // Since E00-T03 both processes validate their whole environment before
  // bootstrap, so a residency check must supply valid configuration. The
  // fail-closed path is asserted separately below.
  const baseEnv = {
    APP_ENV: 'test',
    LOG_LEVEL: 'error',
    DATABASE_URL: 'postgres://garazo:local@127.0.0.1:5432/garazo',
  };

  assert.equal(
    await bootsAndStaysAlive('apps/api/dist/main.js', {
      ...baseEnv,
      API_PORT: '3999',
      WALKING_SKELETON_ENABLED: 'false',
    }),
    true,
    'the API exited instead of staying resident',
  );
  assert.equal(
    await bootsAndStaysAlive('apps/worker/dist/main.js', {
      ...baseEnv,
      WORKER_CONCURRENCY: '1',
    }),
    true,
    'the worker exited instead of staying resident — its event loop is not held open',
  );
});

test('test_L_PROCESS_005_entry_points_refuse_to_start_without_configuration', async () => {
  // The counterpart to the residency test: a process with no configuration must
  // die immediately and name only the KEYS, never the values. Booting half
  // configured is how a service fails later, in production, under load.
  for (const entryPoint of ['apps/api/dist/main.js', 'apps/worker/dist/main.js']) {
    const child = spawn(process.execPath, [entryPoint], {
      cwd: repositoryRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
      // A bare environment: PATH only, so no ambient config leaks in.
      env: { PATH: process.env.PATH ?? '' },
    });

    let output = '';
    child.stdout.on('data', (chunk: Buffer) => {
      output += chunk.toString();
    });

    const code = await new Promise<number | null>((resolve) => {
      child.once('exit', (exitCode) => resolve(exitCode));
    });

    assert.notEqual(code, 0, `${entryPoint} started without configuration`);
    assert.match(output, /invalid configuration/, `${entryPoint} did not report a config failure`);
    assert.match(output, /APP_ENV/, `${entryPoint} did not name the missing key`);
    assert.ok(!output.includes('postgres://'), 'a configuration value leaked into the output');
  }
});
