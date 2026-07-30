# ADR-0002 — Architecture style

- status: accepted
- date: 2026-07-29 | proposed_by: architect | decided_by: project owner on 2026-07-30
- traces_to: [FR-JOB-14, FR-BILLING-10, FR-PLAN-11, NFR-SEC-01,
  NFR-REL-01, FT-002, FT-003, FT-007, FT-011, FT-012, FC-011, FC-020,
  FC-021]

## Context

Garazo has several related domain modules but strict cross-record money,
credit, audit, and idempotency invariants. Expected traffic is 45
requests/second and aggressive M+12 concurrency is 68 accounts
(`FC-011`, `FC-021`). Architecture should make correctness easy now and retain
an extraction path if measured pressure appears.

Official reference checked 2026-07-29:
[Microsoft architecture styles](https://learn.microsoft.com/en-gb/azure/architecture/guide/architecture-styles/)
and
[microservices trade-offs](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/microservices).

## Options considered

1. **Modular monolith plus separately runnable worker** — pros: one
   transactional boundary, one contract surface, simplest operations, modules
   can be extracted later; cons: module discipline is essential and one API
   deployment has a wider blast radius; exit cost: medium if ownership and
   interfaces stay explicit.
2. **Domain microservices** — pros: independent deployment/scaling and
   potential fault isolation; cons: distributed transactions, eventual
   consistency, versioned service calls, tracing, and higher operational
   burden before forecast need; exit cost: high.
3. **Function-per-capability serverless** — pros: fine-grained scaling and low
   idle compute; cons: fragmented transactions/workflows, local integration
   complexity, platform coupling, and harder end-to-end debugging; exit cost:
   high.

Relative run-cost judgments are scoped to `FC-011`, `FC-016`, `FC-020`, and
`FC-021`; no supplier price is assumed.

## Comparison matrix

| Criterion (weight) | Modular monolith | Microservices | Functions |
|---|---:|---:|---:|
| Financial/invariant integrity (25) | 5 (125) | 3 (75) | 3 (75) |
| Operational simplicity (20) | 5 (100) | 2 (40) | 3 (60) |
| Expected-scale fit (15) | 5 (75) | 2 (30) | 4 (60) |
| Evolvability (15) | 4 (60) | 5 (75) | 3 (45) |
| Team/agent buildability (15) | 5 (75) | 2 (30) | 3 (45) |
| Fault isolation (10) | 3 (30) | 5 (50) | 3 (30) |
| **Weighted total / 500** | **465** | **300** | **315** |

## Agent recommendation (advisory — NOT the decision)

Recommend Option 1, organized by the domain contexts in
`domain/domain-model.md`, with API and worker as separately runnable entry
points over the same module code. Extraction must require measured queue,
database, or deployment pressure rather than hypothetical scale. Final call is
yours.

## Decision

Option 1 — Modular monolith plus separately runnable worker.

Confirmed by the project owner on 2026-07-30.

## Consequences

- Garazo begins as one modular application codebase organized by the approved
  domain contexts, with API and worker as separately runnable entry points.
- Cross-record money, credit, audit, and idempotency work can use one logical
  transaction boundary. The physical datastore remains subject to ADR-0005.
- Module ownership, public interfaces, and allowed imports must be enforced by
  architecture tests. An unstructured layered monolith does not satisfy this
  decision.
- API deployment has a broader blast radius than independently deployed
  services. This is accepted in exchange for simpler delivery and operations.
- A module may be extracted only after measured database, queue, fault, team,
  or deployment pressure justifies it. Extraction requires a new ADR.
- Domain microservices and function-per-capability serverless are rejected for
  the initial architecture.
