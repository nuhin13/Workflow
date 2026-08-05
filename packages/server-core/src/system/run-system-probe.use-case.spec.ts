// E00-T04 · use-case behaviour, independent of PostgreSQL.

import assert from 'node:assert/strict';
import test from 'node:test';
import { anonymousContext } from '../access/access-context.ts';
import { RunSystemProbeUseCase } from './run-system-probe.use-case.ts';
import type { SystemProbeRecord, SystemProbeRepository } from './system-probe.ts';

function repositoryReturning(record: SystemProbeRecord): SystemProbeRepository {
  return { increment: async () => record };
}

test('test_EARS_E00_9_use_case_returns_the_retained_count', async () => {
  const useCase = new RunSystemProbeUseCase(
    repositoryReturning({ visitCount: 7, updatedAt: new Date('2026-08-05T00:00:00Z') }),
  );

  const result = await useCase.execute(anonymousContext('corr-1', Date.now()));

  assert.equal(result.status, 'persisted');
  assert.equal(result.visitCount, 7);
  assert.equal(result.correlationId, 'corr-1');
});

test('test_EARS_E00_10_repository_failure_propagates_rather_than_faking_success', async () => {
  // The transport turns this into a redacted 503. What matters here is that the
  // use case does NOT invent a count or swallow the failure — a probe that
  // reports success without persisting is worse than one that errors, because
  // it makes the whole skeleton a lie.
  const useCase = new RunSystemProbeUseCase({
    increment: async () => {
      throw new Error('connection refused 10.0.0.5:5432');
    },
  });

  await assert.rejects(() => useCase.execute(anonymousContext('corr-2', Date.now())));
});

test('test_EARS_E00_9_non_positive_count_is_rejected_as_a_broken_round_trip', async () => {
  // A successful persist must yield at least 1. Zero or negative means the
  // upsert did not do what the migration's CHECK promises, and returning it
  // would report a healthy skeleton over a broken one.
  for (const visitCount of [0, -1]) {
    const useCase = new RunSystemProbeUseCase(
      repositoryReturning({ visitCount, updatedAt: new Date() }),
    );
    await assert.rejects(
      () => useCase.execute(anonymousContext('corr-3', Date.now())),
      /visit count/i,
    );
  }
});

test('test_EARS_E00_9_unsafe_integer_count_is_rejected', async () => {
  // bigint in PostgreSQL exceeds what JSON and JavaScript numbers represent
  // exactly. Returning an imprecise number over the wire would be a silent
  // correctness bug, so it fails loudly instead.
  const useCase = new RunSystemProbeUseCase(
    repositoryReturning({ visitCount: Number.MAX_SAFE_INTEGER + 2, updatedAt: new Date() }),
  );

  await assert.rejects(() => useCase.execute(anonymousContext('corr-4', Date.now())), /safe/i);
});

test('test_NFR_SEC_01_use_case_requires_no_actor_or_workshop_authority', async () => {
  // The diagnostic is unauthenticated by design. This pins that it never reads
  // authority off the context, so it cannot later grow an authorization check
  // that silently depends on E00's always-anonymous state.
  const context = anonymousContext('corr-5', Date.now());
  assert.equal(context.actor.kind, 'anonymous');
  assert.equal(context.workshopScope.kind, 'none');

  const useCase = new RunSystemProbeUseCase(
    repositoryReturning({ visitCount: 1, updatedAt: new Date() }),
  );
  const result = await useCase.execute(context);
  assert.equal(result.visitCount, 1);
});
