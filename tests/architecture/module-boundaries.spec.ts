// E00-T02 · architecture gates (ADR-0002, ADR-0004, ADR-0007).
//
// These tests protect boundaries that are cheap to hold now and expensive to
// recover later: once a provider SDK type reaches domain code, or one app
// imports another's internals, every subsequent epic inherits the coupling.

import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

function sourceFiles(directory: string, extensions = ['.ts']): string[] {
  const absolute = join(repositoryRoot, directory);
  const entries = readdirSync(absolute, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const child = join(absolute, entry.name);
    const relativePath = relative(repositoryRoot, child);

    if (entry.isDirectory()) {
      // Generated trees are excluded: they are derived from the contract and
      // their style is not ours to police.
      if (entry.name === 'generated' || entry.name === 'node_modules' || entry.name === 'dist') {
        return [];
      }
      return sourceFiles(relativePath, extensions);
    }
    return extensions.some((extension) => entry.name.endsWith(extension)) ? [relativePath] : [];
  });
}

function read(path: string): string {
  return readFileSync(join(repositoryRoot, path), 'utf8');
}

function importedModules(source: string): string[] {
  const specifiers: string[] = [];
  const pattern = /(?:from|import\(|require\()\s*['"]([^'"]+)['"]/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(source)) !== null) {
    specifiers.push(match[1]!);
  }
  return specifiers;
}

test('test_ADR_0002_forbidden_module_import_fails', () => {
  // The API and the worker are separate composition roots. Neither may reach
  // into the other; shared behaviour belongs in @garazo/server-core.
  for (const path of [...sourceFiles('apps/api/src'), ...sourceFiles('apps/worker/src')]) {
    const isApi = path.startsWith('apps/api/');
    const forbidden = isApi ? ['apps/worker', '@garazo/worker'] : ['apps/api', '@garazo/api'];

    for (const specifier of importedModules(read(path))) {
      for (const needle of forbidden) {
        assert.ok(
          !specifier.includes(needle),
          `${path} imports ${specifier}, crossing the API/worker boundary`,
        );
      }
    }
  }

  // Consumers may only use the package's public surface, never a deep path
  // into its internals.
  for (const path of [...sourceFiles('apps/api/src'), ...sourceFiles('apps/worker/src')]) {
    for (const specifier of importedModules(read(path))) {
      assert.ok(
        !/^@garazo\/server-core\/.+/.test(specifier),
        `${path} imports ${specifier}; use the @garazo/server-core public surface`,
      );
    }
  }
});

test('test_ADR_0004_domain_code_has_no_provider_sdk_import', () => {
  // Providers are reached through ports. A direct SDK import in server-core or
  // an app would make the adapter boundary decorative.
  const providerSdks = [
    'firebase',
    'firebase-admin',
    '@aws-sdk',
    'aws-sdk',
    '@google-cloud',
    'twilio',
    'stripe',
    'pg',
    'postgres',
    'typeorm',
    'prisma',
    '@prisma/client',
  ];

  const guarded = [
    ...sourceFiles('packages/server-core/src'),
    ...sourceFiles('apps/api/src'),
    ...sourceFiles('apps/worker/src'),
  ];

  /**
   * Adapter edges MAY import their own provider driver — that is the entire
   * point of ADR-0004's ports-and-adapters boundary. What must never happen is
   * a driver type reaching domain code, because then swapping the provider
   * stops being a one-file change.
   *
   * Recognised by filename, so an adapter is visible as an adapter in a
   * directory listing and in a diff.
   */
  const isAdapterEdge = (path: string): boolean =>
    /\/postgres-[^/]+\.ts$/.test(path) ||
    /\.check\.ts$/.test(path) ||
    // A composition root is BY DEFINITION where concrete implementations are
    // chosen and wired (ADR-0002). Forbidding a driver import here would only
    // push the wiring into a differently named file without changing what
    // depends on what.
    /\/app\.module\.ts$/.test(path);

  const adapters: string[] = [];

  for (const path of guarded) {
    const imports = importedModules(read(path));
    const providerImports = imports.filter((specifier) =>
      providerSdks.some((sdk) => specifier === sdk || specifier.startsWith(`${sdk}/`)),
    );

    if (providerImports.length === 0) {
      continue;
    }

    assert.ok(
      isAdapterEdge(path),
      `${path} imports the provider SDK ${providerImports.join(', ')}; only an adapter edge may (ADR-0004)`,
    );
    adapters.push(path);
  }

  // The exemption must stay narrow. If this list grows, provider coupling is
  // spreading and the boundary is eroding one "just this once" at a time.
  assert.deepEqual(
    adapters.sort(),
    [
      'apps/api/src/app.module.ts',
      'apps/api/src/system/postgres-readiness.check.ts',
      'packages/server-core/src/system/postgres-system-probe.repository.ts',
    ],
    'the set of files importing a provider driver changed; confirm each is a genuine adapter edge',
  );
});

test('test_ADR_0007_identity_session_owner_grant_admin_scope_are_distinct', () => {
  // Substitutability is the risk: if these were one shape, "signed in" could
  // silently satisfy "owner unlocked money" or "is a Garazo admin".
  const accessContext = read('packages/server-core/src/access/access-context.ts');
  const ownerGrant = read('packages/server-core/src/access/owner-money-grant.ts');
  const adminScope = read('packages/server-core/src/access/admin-scope.ts');

  assert.match(accessContext, /export type AuthenticatedActor/);
  assert.match(accessContext, /export type WorkshopScope/);
  assert.match(ownerGrant, /export type OwnerMoneyGrant/);
  assert.match(adminScope, /export type AdminScope/);

  // Each carries a discriminator, so one cannot be passed where another is
  // expected without the compiler noticing.
  assert.match(ownerGrant, /kind: 'locked'/);
  assert.match(adminScope, /kind: 'none'/);

  // A grant is scoped to one workshop and expires; a global or eternal grant
  // would defeat the shared-phone privacy rule (BRD Law 2).
  assert.match(ownerGrant, /workshopId: OpaqueId/);
  assert.match(ownerGrant, /expiresAt: EpochMillis/);
});

test('test_NFR_SEC_01_context_never_authorizes_client_scope', () => {
  const requestContext = read('apps/api/src/common/request/request-context.ts');

  // The only thing taken from headers is the correlation id. If this file ever
  // learns to read a workshop or actor id from input, authorization becomes
  // client-controlled.
  const headerReads = requestContext.match(/headers\[[^\]]+\]/g) ?? [];
  assert.deepEqual(
    headerReads,
    ['headers[CORRELATION_ID_HEADER]'],
    'request context reads a header other than the correlation id',
  );

  // Every E00 context is anonymous and unscoped, by construction.
  assert.match(requestContext, /anonymousContext\(/);
  assert.doesNotMatch(requestContext, /workshopId/);

  const accessContext = read('packages/server-core/src/access/access-context.ts');
  assert.match(accessContext, /kind: 'anonymous'/);
  assert.match(accessContext, /kind: 'none'/);
});
