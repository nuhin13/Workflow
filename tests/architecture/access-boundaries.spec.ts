// E01-T01 · access boundary architecture tests (ADR-0004, ADR-0007,
// NFR-SEC-01).
//
// These protect two boundaries that are cheap to hold now and expensive to
// recover later: a session token being usable where a grant token is
// required, and a Firebase (or any provider) type reaching domain code.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

function read(path: string): string {
  return readFileSync(join(repositoryRoot, path), 'utf8');
}

test('test_ADR_0007_session_and_grant_tokens_are_not_substitutable', () => {
  const source = read('packages/server-core/src/access/session-token.ts');

  assert.match(source, /export type SessionToken = string & \{ readonly __sessionToken/);
  assert.match(source, /export type OwnerGrantToken = string & \{ readonly __ownerGrantToken/);

  // Two DIFFERENT brand symbol names is what makes SessionToken not
  // assignable to OwnerGrantToken (and vice versa) at the type level: a
  // structurally-identical `{ readonly __brand: unique symbol }` on both
  // would make them mutually assignable and defeat the whole point.
  const sessionBrand = source.match(/SessionToken = string & \{ readonly (\w+):/)?.[1];
  const grantBrand = source.match(/OwnerGrantToken = string & \{ readonly (\w+):/)?.[1];
  assert.ok(sessionBrand && grantBrand, 'both branded types must declare a brand field');
  assert.notEqual(sessionBrand, grantBrand);

  // The two constructors are independent — neither derives from the other —
  // so nothing in this module can accidentally produce one from the other.
  assert.match(source, /export function asSessionToken\(value: string\): SessionToken/);
  assert.match(source, /export function asOwnerGrantToken\(value: string\): OwnerGrantToken/);

  // Non-substitutability must also hold in the generated OpenAPI clients: the
  // wire types are separate schemas (SessionEnvelope vs GrantEnvelope), not
  // one schema reused under two names. Each generated model file exports its
  // own distinctly-named interface (checked for the exported symbol, not
  // whole-file text, since the doc comment on each legitimately names its
  // structural sibling).
  const sessionModel = read(
    'packages/api-client-typescript/src/generated/src/models/SessionEnvelope.ts',
  );
  const grantModel = read(
    'packages/api-client-typescript/src/generated/src/models/GrantEnvelope.ts',
  );
  assert.match(sessionModel, /export interface SessionEnvelope \{/);
  assert.match(grantModel, /export interface GrantEnvelope \{/);
  assert.doesNotMatch(sessionModel, /export interface GrantEnvelope/);
  assert.doesNotMatch(grantModel, /export interface SessionEnvelope/);
});

function importedModules(source: string): string[] {
  const specifiers: string[] = [];
  const pattern = /(?:from|import\(|require\()\s*['"]([^'"]+)['"]/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(source)) !== null) {
    specifiers.push(match[1]!);
  }
  return specifiers;
}

test('test_ADR_0007_no_firebase_type_reaches_domain_code', () => {
  // Checks actual IMPORTS, not prose: these files' doc comments legitimately
  // discuss what a Firebase uid is NOT (to explain the boundary), which a
  // whole-text scan would misfire on. What must never happen is an import of
  // the Firebase SDK reaching this domain code (ADR-0004).
  for (const path of [
    'packages/server-core/src/access/session-token.ts',
    'packages/server-core/src/access/access-errors.ts',
    'packages/server-core/src/access/access-context.ts',
  ]) {
    const imports = importedModules(read(path));
    for (const specifier of imports) {
      assert.ok(
        !specifier.toLowerCase().includes('firebase'),
        `${path} imports ${specifier}; provider SDKs stop at the adapter (ADR-0004)`,
      );
    }
  }
});

test('test_NFR_SEC_01_no_route_accepts_a_client_supplied_workshop_id', () => {
  // Complements the contract-level scan in tests/contract/access-contract.spec.ts
  // by asserting the same rule against the domain types T02-T05 will actually
  // build against: WorkshopScope only ever carries a SERVER-resolved id, and
  // AuthenticatedActor never carries a client-suppliable workshop field.
  const accessContext = read('packages/server-core/src/access/access-context.ts');

  assert.match(accessContext, /export type WorkshopScope/);
  assert.match(accessContext, /kind: 'none'/);
  // The only place `workshopId` is declared is inside the server-resolved
  // `workshop` branch of WorkshopScope, never as a request input.
  const workshopIdDeclarations = [...accessContext.matchAll(/workshopId\??:\s*OpaqueId/g)];
  assert.equal(
    workshopIdDeclarations.length,
    1,
    'workshopId must be declared exactly once, inside the server-resolved WorkshopScope branch',
  );
});
