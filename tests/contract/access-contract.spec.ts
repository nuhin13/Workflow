// E01-T01 · access contract shape assertions (ADR-0007, ADR-0008, NFR-SEC-01,
// NFR-SEC-02, Q-005, Q-008, Q-009).
//
// These read the canonical OpenAPI source (and the drift gate script) rather
// than booting the API: T01 ships no route implementation, so there is
// nothing to boot yet. Static text scanning mirrors the style already
// established by tests/contract/generated-client-drift.spec.ts.

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

function repositoryPath(path: string): string {
  return join(repositoryRoot, path);
}

const contractSource = readFileSync(repositoryPath('contracts/openapi/garazo.v1.yaml'), 'utf8');

/** Splits the contract into top-level YAML blocks keyed by their heading line. */
function extractBlock(source: string, headingPattern: RegExp): string {
  const lines = source.split('\n');
  const startIndex = lines.findIndex((line) => headingPattern.test(line));
  assert.ok(startIndex >= 0, `block matching ${headingPattern} not found`);

  const startIndent = lines[startIndex]!.match(/^(\s*)/)![1]!.length;
  const blockLines: string[] = [lines[startIndex]!];

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index]!;
    if (line.trim().length === 0) {
      blockLines.push(line);
      continue;
    }
    const indent = line.match(/^(\s*)/)![1]!.length;
    if (indent <= startIndent) {
      break;
    }
    blockLines.push(line);
  }

  return blockLines.join('\n');
}

test('test_EARS_E01_1_pre_session_failures_are_indistinguishable', () => {
  // POST /api/v1/access/sessions is the ONLY pre-session identity exchange.
  // Its 401 response block must reference exactly one access error code.
  const sessionsPath = extractBlock(contractSource, /^ {2}\/api\/v1\/access\/sessions:/);
  const authCodes = [...sessionsPath.matchAll(/AUTH\.[A-Z_]+/g)].map((match) => match[0]);
  const distinctCodes = [...new Set(authCodes)];

  assert.deepEqual(
    distinctCodes,
    ['AUTH.INVALID_CREDENTIALS'],
    'the identity-exchange path must mention exactly one AUTH.* code',
  );

  // And every reachable failure of that operation is 401 or 400 (validation),
  // never a status/message that could distinguish "unknown number" from
  // "wrong code" from "expired assertion".
  const statusCodes = [...sessionsPath.matchAll(/^ {8}"(\d{3})":/gm)].map((match) => match[1]);
  assert.deepEqual([...statusCodes].sort(), ['200', '400', '401']);
});

test('test_NFR_SEC_01_no_route_accepts_a_client_supplied_workshop_id', () => {
  // Split the contract at `components:` — everything above is the paths
  // section (requests + parameters); everything below also defines RESPONSE
  // schemas like WorkshopSummary, which legitimately return workshopId. Only
  // the paths section may never accept one as input.
  const componentsIndex = contractSource.indexOf('\ncomponents:');
  assert.ok(componentsIndex > 0, 'components: section not found');
  const pathsSection = contractSource.slice(0, componentsIndex);

  // No path template parameter names a workshop.
  assert.doesNotMatch(pathsSection, /\{workshopId\}/);
  assert.doesNotMatch(pathsSection, /\{workshop_id\}/);

  // No request-body schema referenced from a path operation may declare a
  // workshopId property. All nine request schemas are inline enough that a
  // direct property scan on the full component schemas used as REQUESTS is
  // reliable: assert none of the request schemas below carries the field.
  const requestSchemaNames = [
    'IdentityAssertionRequest',
    'WorkshopSetupRequest',
    'LocalePreference',
    'OwnerPinSetRequest',
    'OwnerPinVerifyRequest',
    'OwnerPinRecoveryRequest',
  ];
  for (const schemaName of requestSchemaNames) {
    const schemaBlock = extractBlock(contractSource, new RegExp(`^ {4}${schemaName}:`));
    assert.doesNotMatch(
      schemaBlock,
      /workshopId/,
      `${schemaName} must not accept a client-supplied workshopId`,
    );
  }

  // No query parameter anywhere in the new access/workshop paths is named
  // workshopId either.
  assert.doesNotMatch(pathsSection, /name:\s*workshopId/);
});

test('test_ADR_0007_no_firebase_type_reaches_domain_code', () => {
  for (const path of [
    'packages/server-core/src/access/session-token.ts',
    'packages/server-core/src/access/access-errors.ts',
  ]) {
    const source = readFileSync(repositoryPath(path), 'utf8');
    assert.doesNotMatch(
      source,
      /firebase/i,
      `${path} must not reference Firebase; it is contract-only`,
    );
  }
});

test('test_ADR_0008_access_contract_generates_both_clients_with_zero_drift', () => {
  const output = execFileSync('bash', ['scripts/check-api-contract.sh'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    env: { ...process.env, CI: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  assert.match(output, /contract valid and both generated clients are clean/);
});

test('test_NFR_SEC_02_no_schema_exposes_a_secret_or_money_value', () => {
  // Only RESPONSE-carrying schemas matter here: SessionEnvelope, GrantEnvelope,
  // WorkshopSummary, SessionExchangeResponse, LocalePreference (also used as a
  // response), OwnerPinVerifyResponse. None of them may declare a raw secret
  // or a money-shaped PROPERTY. Scanning only declared property names (not
  // prose in `description:` blocks) avoids false positives from doc text that
  // legitimately discusses the sibling schema or the word "money" in
  // explanatory comments.
  const responseSchemaNames = [
    'SessionEnvelope',
    'GrantEnvelope',
    'WorkshopSummary',
    'SessionExchangeResponse',
    'LocalePreference',
    'OwnerPinVerifyResponse',
  ];
  const forbiddenProperties = [
    'identityAssertion',
    'recoveryAssertion',
    'pin',
    'newPin',
    'otp',
    'passwordHash',
    'due',
    'amount',
    'balance',
    'money',
  ];

  for (const schemaName of responseSchemaNames) {
    const schemaBlock = extractBlock(contractSource, new RegExp(`^ {4}${schemaName}:`));
    const propertiesIndex = schemaBlock.indexOf('\n      properties:');
    assert.ok(propertiesIndex >= 0, `${schemaName} declares no properties block`);
    const propertiesSection = schemaBlock.slice(propertiesIndex);
    const propertyNames = [...propertiesSection.matchAll(/^ {8}(\w+):/gm)].map(
      (match) => match[1]!,
    );

    for (const needle of forbiddenProperties) {
      assert.ok(
        !propertyNames.includes(needle),
        `${schemaName} must not declare a "${needle}" property (found in: ${propertyNames.join(', ')})`,
      );
    }
  }
});

test('test_EARS_E01_1_error_codes_are_complete_and_named', () => {
  const errorCodeBlock = extractBlock(contractSource, /^ {4}ErrorCode:/);
  const expected = [
    'AUTH.INVALID_CREDENTIALS',
    'AUTH.SESSION_INVALID',
    'AUTH.PIN_INVALID',
    'AUTH.PIN_COOLDOWN',
    'AUTH.PIN_NOT_SET',
    'AUTH.RECOVERY_INVALID',
    'AUTH.RECOVERY_COOLDOWN',
    'AUTH.GRANT_REQUIRED',
    'WORKSHOP.NOT_SET_UP',
    'WORKSHOP.ALREADY_SET_UP',
  ];

  for (const code of expected) {
    assert.ok(errorCodeBlock.includes(`- ${code}`), `ErrorCode enum is missing ${code}`);
  }

  const varnamesBlock = errorCodeBlock.slice(errorCodeBlock.indexOf('x-enum-varnames:'));
  const expectedVarnames = [
    'AuthInvalidCredentials',
    'AuthSessionInvalid',
    'AuthPinInvalid',
    'AuthPinCooldown',
    'AuthPinNotSet',
    'AuthRecoveryInvalid',
    'AuthRecoveryCooldown',
    'AuthGrantRequired',
    'WorkshopNotSetUp',
    'WorkshopAlreadySetUp',
  ];
  for (const varname of expectedVarnames) {
    assert.ok(
      varnamesBlock.includes(`- ${varname}`),
      `x-enum-varnames is missing ${varname} (needed for a readable generated identifier)`,
    );
  }

  // Every generated enum value must actually exist in the generated TS client.
  const generatedErrorCode = readFileSync(
    repositoryPath('packages/api-client-typescript/src/generated/src/models/ErrorCode.ts'),
    'utf8',
  );
  for (let index = 0; index < expected.length; index += 1) {
    assert.match(
      generatedErrorCode,
      new RegExp(`${expectedVarnames[index]}:\\s*'${expected[index]!.replace('.', '\\.')}'`),
    );
  }
});
