# ADR-0003 — Delivery methodology

- status: proposed
- date: 2026-07-29 | proposed_by: architect | decided_by: ⏳ human pending
- traces_to: [NFR-PERF-01, NFR-SEC-01–NFR-SEC-04, FT-001–FT-019,
  FC-002, FC-004–FC-012]

## Context

The repository already requires one task/branch/worktree, peer review, QA,
checkpoints, and traceability. Forecast assumptions remain low-confidence
until pilot use (`FC-004`–`FC-012`), and the business checkpoint requires
runnable behavior by M+4 (`FC-002`). The methodology must expose end-to-end
risk early rather than optimize incomplete layers.

Official references checked 2026-07-29:
[Kanban Guide](https://kanbanguides.org/the-kanban-guide/),
[Scrum Guide](https://scrumguides.org/download.html), and
[Shape Up](https://basecamp.com/shapeup).

## Options considered

1. **Flow-based Kanban with thin vertical slices and WIP limits** — pros:
   matches task lanes/gates, adapts to pilot learning, yields runnable journeys
   continuously; cons: needs disciplined prioritization, WIP enforcement, and
   active aging review; exit cost: low.
2. **Two-week Scrum increments** — pros: explicit sprint goal, review, and
   predictable events; cons: ceremony and spillover risk where security,
   money, or integration tasks cross a timebox; exit cost: low to medium.
3. **Layer-first milestones** — pros: concentrated expertise and simple local
   sequencing; cons: late integration, late mobile-speed/privacy feedback, and
   long periods without runnable value; exit cost: medium.

Method choice changes delivery risk, not the infrastructure envelope
`FC-016`.

## Comparison matrix

| Criterion (weight) | Vertical-flow Kanban | Two-week Scrum | Layer-first |
|---|---:|---:|---:|
| Pilot feedback speed (25) | 5 (125) | 4 (100) | 2 (50) |
| Harness fit (25) | 5 (125) | 4 (100) | 3 (75) |
| Early risk retirement (20) | 5 (100) | 4 (80) | 2 (40) |
| Coordination overhead (15) | 4 (60) | 3 (45) | 4 (60) |
| Predictable cadence (15) | 4 (60) | 5 (75) | 4 (60) |
| **Weighted total / 500** | **470** | **400** | **285** |

## Agent recommendation (advisory — NOT the decision)

Recommend Option 1. Pull one thin, testable user journey at a time through
build, peer review, QA, and checkpoint, with explicit WIP and aging limits.
Use forecast checkpoints for review cadence, not as invented sprint capacity.
Final call is yours.

## Decision

⏳ AWAITING HUMAN

## Consequences

N/A — pending human choice. The accepted method must be expressed through the
existing profile, branch, review, QA, and human-gate rules rather than replacing
them.

