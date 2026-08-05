// E00-T02 · generated-client drift gate (EARS-E00-3, ADR-0008).
//
// The contract is only authoritative if the committed clients actually match
// it. Two ways that breaks silently: someone edits generated code by hand, or
// someone edits the contract and forgets to regenerate. Both leave the wire
// format and the client disagreeing, which surfaces as a runtime bug in
// whichever epic touches it next.

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

function repositoryPath(path: string): string {
  return join(repositoryRoot, path);
}

function run(command: string, args: readonly string[]): string {
  return execFileSync(command, args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    env: { ...process.env, CI: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

test('test_ADR_0008_contract_is_the_single_source_of_truth', () => {
  const contract = repositoryPath('contracts/openapi/garazo.v1.yaml');
  assert.ok(existsSync(contract), 'the canonical contract is missing');

  const source = readFileSync(contract, 'utf8');

  // Only ONE error shape is permitted, and every failure response must use it.
  assert.match(source, /ErrorEnvelope:/);
  const errorResponses = source.match(/\$ref: "#\/components\/schemas\/ErrorEnvelope"/g) ?? [];
  assert.ok(
    errorResponses.length >= 4,
    `expected every error response to reference ErrorEnvelope, found ${errorResponses.length}`,
  );

  // No product surface may be smuggled into the E00 contract.
  for (const forbidden of ['/job', '/customer', '/vehicle', '/bill', '/workshop', '/admin']) {
    assert.ok(
      !source.includes(`${forbidden}:`),
      `the E00 contract declares a product path ${forbidden}, which no epic has authorized yet`,
    );
  }
});

test('test_ADR_0008_generated_tree_has_zero_drift', () => {
  // Runs the real gate rather than reimplementing it, so the test and CI can
  // never disagree about what "clean" means.
  const output = run('bash', ['scripts/check-api-contract.sh']);
  assert.match(output, /contract valid and both generated clients are clean/);
});

test('test_EARS_E00_3_generated_clients_exist_and_are_committed', () => {
  const required = [
    'packages/api-client-typescript/src/generated/src/index.ts',
    'packages/api-client-typescript/src/generated/src/apis/SystemApi.ts',
    'packages/api-client-typescript/src/generated/src/models/ErrorEnvelope.ts',
    'apps/mobile/lib/core/api/generated/lib/api.dart',
    'apps/mobile/lib/core/api/generated/lib/api/system_api.dart',
    'apps/mobile/lib/core/api/generated/lib/model/error_envelope.dart',
  ];

  const missing = required.filter((path) => !existsSync(repositoryPath(path)));
  assert.deepEqual(missing, [], `generated client files are missing: ${missing.join(', ')}`);

  // The generator emits its own .gitignore, which would quietly exclude the
  // generated client from version control and make the drift gate vacuous on a
  // fresh clone.
  for (const stray of [
    'packages/api-client-typescript/src/generated/.gitignore',
    'apps/mobile/lib/core/api/generated/.gitignore',
    'apps/mobile/lib/core/api/generated/pubspec.yaml',
  ]) {
    assert.ok(!existsSync(repositoryPath(stray)), `${stray} should have been stripped`);
  }

  const tracked = run('git', ['ls-files', 'packages/api-client-typescript/src/generated']);
  assert.ok(tracked.trim().length > 0, 'the generated TypeScript client is not tracked by git');
});

test('test_EARS_E00_3_generated_clients_are_never_hand_edited', () => {
  // Every generated file carries the generator's warning banner. Its absence
  // means someone wrote the file themselves.
  for (const path of [
    'apps/mobile/lib/core/api/generated/lib/model/error_envelope.dart',
    'packages/api-client-typescript/src/generated/src/models/ErrorEnvelope.ts',
  ]) {
    const source = readFileSync(repositoryPath(path), 'utf8');
    assert.match(
      source,
      /AUTO-GENERATED FILE, DO NOT MODIFY|tslint:disable/,
      `${path} has lost its generated-file banner`,
    );
  }
});
