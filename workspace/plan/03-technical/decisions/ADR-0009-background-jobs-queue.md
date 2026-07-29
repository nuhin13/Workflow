# ADR-0009 — Background jobs and queue

- status: proposed
- date: 2026-07-29 | proposed_by: architect | decided_by: ⏳ human pending
- traces_to: [FR-REMINDER-02–FR-REMINDER-05, FR-BILLING-09,
  FR-PLAN-11–FR-PLAN-12, FR-ANALYTICS-02, NFR-REL-01,
  FC-010, FC-012, FC-015, FC-016, FC-020]

## Context

Garazo needs scheduled reminders, retryable provider calls, delivery evidence,
and exactly-once SMS-credit effects. Expected M+12 SMS volume is 5,600
sends/month (`FC-012`, `FC-020`). A domain write and its asynchronous intent
must not split silently; jobs must be replay-safe.

Official references checked 2026-07-29:
[pg-boss](https://github.com/timgit/pg-boss),
[PostgreSQL locking](https://www.postgresql.org/docs/current/explicit-locking.html),
[BullMQ queues](https://docs.bullmq.io/guide/queues),
[BullMQ idempotent jobs](https://docs.bullmq.io/patterns/idempotent-jobs),
and [Cloud Tasks retries](https://cloud.google.com/tasks/docs/configure-retry-task).

## Options considered

1. **Database-backed durable queue in the selected relational store, using a
   maintained stack-compatible worker library** — pros: enqueue with domain
   state in one transaction, one fewer service, easy audit/query; cons:
   workers share database capacity and library choice depends on stack; exit
   cost: medium behind a queue port.
2. **Redis-backed BullMQ** — pros: mature delay/retry/concurrency, horizontal
   workers, strong Node tooling; cons: added Redis, cross-store atomicity
   requires a transactional outbox/relay, not suitable if the selected runtime
   is not Node; exit cost: medium.
3. **Managed HTTP task queue such as Cloud Tasks** — pros: managed retry/rate
   controls and low queue operations; cons: provider coupling and domain
   transaction/task creation still need durable reconciliation; exit cost:
   medium to high.

Added infrastructure must be quoted under `FC-016`. Throughput beyond
`FC-012` is not invented.

## Comparison matrix

| Criterion (weight) | DB-backed | Redis/BullMQ | Managed tasks |
|---|---:|---:|---:|
| Domain-intent atomicity (25) | 5 (125) | 3 (75) | 3 (75) |
| Retry/delivery reliability (20) | 4 (80) | 5 (100) | 5 (100) |
| Operational simplicity (20) | 5 (100) | 3 (60) | 5 (100) |
| Forecast fit (15) | 5 (75) | 4 (60) | 4 (60) |
| Scale-up headroom (10) | 3 (30) | 5 (50) | 5 (50) |
| Testability (5) | 4 (20) | 5 (25) | 4 (20) |
| Exit cost (5) | 3 (15) | 3 (15) | 2 (10) |
| **Weighted total / 500** | **445** | **385** | **415** |

## Agent recommendation (advisory — NOT the decision)

Recommend Option 1 for the approved envelope, provided ADR-0005 selects a
relational store and the accepted stack has a maintained queue library. Claim
jobs with bounded concurrency, record every normalized attempt/result, and
make handlers idempotent. Revisit when queue lag or database contention is
measured, not merely forecast. Final call is yours.

## Decision

⏳ AWAITING HUMAN

## Consequences

N/A — pending human choice. Library, job payload, retry/backoff, retention,
dead-letter/replay operation, scheduling time zone, concurrency, and extraction
thresholds need later accepted contracts.

