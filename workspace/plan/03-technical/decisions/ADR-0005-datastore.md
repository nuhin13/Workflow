# ADR-0005 — Datastore

- status: proposed
- date: 2026-07-29 | proposed_by: architect | decided_by: ⏳ human pending
- traces_to: [FR-ACCESS-05, FR-JOB-14, FR-BILLING-01–FR-BILLING-10,
  FR-CASH-01–FR-CASH-05, FR-PLAN-11, NFR-SEC-01, NFR-REL-01,
  FC-009, FC-010, FC-020]

## Context

The model has strong relationships among workshop, vehicle, job, bill,
payment, due, ledger, reminder, entitlement, credit, and audit records.
Multiple paths require atomic and idempotent financial effects. Expected M+12
is 16,000 jobs/month and 180 GB cumulative data, with media as the largest
uncertainty (`FC-009`, `FC-010`, `FC-020`). Media should not inflate the
structured transactional store.

Official references checked 2026-07-29:
[PostgreSQL row-security policies](https://www.postgresql.org/docs/current/sql-createpolicy.html),
[MySQL InnoDB transactions](https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-model.html),
and
[Firestore data model](https://firebase.google.com/docs/firestore/data-model).

## Options considered

1. **Managed PostgreSQL for structured records plus private object storage for
   media** — pros: transactions, constraints, flexible SQL/reporting, and
   database row-level security as defense in depth; cons: migrations,
   connection management, and row-security policy testing; exit cost: medium.
2. **Managed MySQL/InnoDB plus private object storage** — pros: mature
   transactions/constraints, broad managed availability, conventional SQL;
   cons: tenant defense relies more on application/query discipline and some
   PostgreSQL-specific queue/security options are unavailable; exit cost:
   medium.
3. **Firestore plus object storage** — pros: managed document model and mobile
   ecosystem with offline capabilities; cons: relational money/reporting
   invariants shift into application design, query/transaction shape is
   provider-specific, and migration is harder; exit cost: high.

Managed-store quotes must fit `FC-016`; no price is inferred.

## Comparison matrix

| Criterion (weight) | PostgreSQL | MySQL/InnoDB | Firestore |
|---|---:|---:|---:|
| Financial/invariant integrity (25) | 5 (125) | 5 (125) | 3 (75) |
| Tenant defense in depth (20) | 5 (100) | 3 (60) | 4 (80) |
| Query/report fit (15) | 5 (75) | 5 (75) | 3 (45) |
| Future offline compatibility (10) | 4 (40) | 4 (40) | 5 (50) |
| Operational fit (15) | 4 (60) | 4 (60) | 4 (60) |
| Team/agent buildability (10) | 5 (50) | 5 (50) | 4 (40) |
| Exit cost (5) | 3 (15) | 3 (15) | 2 (10) |
| **Weighted total / 500** | **465** | **425** | **360** |

## Agent recommendation (advisory — NOT the decision)

Recommend Option 1. It best expresses Garazo's relational constraints,
transaction boundaries, tenant isolation, audit, and reporting needs.
PostgreSQL row security is defense in depth, not a replacement for server
authorization. Put binary media in private object storage. Final call is
yours.

## Decision

⏳ AWAITING HUMAN

## Consequences

N/A — pending human choice. Physical tables, keys, columns, indexes, retention,
migrations, ORM/query layer, and object-store vendor remain unapproved.

