// E01-T01 · session/grant token branding (ADR-0007, EARS-E01-T01-4).

import assert from 'node:assert/strict';
import test from 'node:test';
import { asOwnerGrantToken, asSessionToken } from './session-token.ts';

test('test_ADR_0007_session_and_grant_token_constructors_return_distinct_brands', () => {
  const session = asSessionToken('a'.repeat(32));
  const grant = asOwnerGrantToken('b'.repeat(32));

  // Runtime values are plain strings (branding is a compile-time-only
  // construct), so the behavioural guarantee we can assert here is that the
  // constructors are independent functions producing independently-branded
  // values, not that one rejects the other's input at runtime. The
  // architecture test proves non-substitutability at the type level.
  assert.equal(typeof session, 'string');
  assert.equal(typeof grant, 'string');
  assert.notEqual(session, grant);
});

test('test_ADR_0007_token_constructors_do_not_mutate_or_truncate_the_value', () => {
  const raw = 'x'.repeat(40);
  assert.equal(asSessionToken(raw), raw);
  assert.equal(asOwnerGrantToken(raw), raw);
});
