// E01-T01 · access error vocabulary (ADR-0007, Q-005, Q-009, L-auth-003).

import assert from 'node:assert/strict';
import test from 'node:test';
import { ACCESS_ERROR_CODES, isPreSessionFailure } from './access-errors.ts';
import type { AccessErrorCode } from './access-errors.ts';

test('test_EARS_E01_1_error_codes_are_complete_and_named', () => {
  const expected: AccessErrorCode[] = [
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

  assert.deepEqual([...ACCESS_ERROR_CODES].sort(), [...expected].sort());
});

test('test_EARS_E01_1_only_invalid_credentials_is_a_pre_session_failure', () => {
  for (const code of ACCESS_ERROR_CODES) {
    const expected = code === 'AUTH.INVALID_CREDENTIALS';
    assert.equal(
      isPreSessionFailure(code),
      expected,
      `isPreSessionFailure(${code}) should be ${expected}`,
    );
  }
});
