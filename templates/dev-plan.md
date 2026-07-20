# Development Plan — <Project Name>

- Traces from: Feature list, Tech plan, Design
- Traces to: Epics (`E<NN>`)
- Last updated: YYYY-MM-DD

## 1. Epic map
E00 is always the skeleton. Every later epic is a runnable user flow — "runnable flow"
must name what a human can DO when the epic is done, not what code exists.

| ID | Epic | Runnable flow when done | Features | Depends on | Size | Status |
|---|---|---|---|---|---|---|
| E00 | Skeleton | App runs end-to-end: boot, health, CI green, one walking-skeleton request | — | — | M | pending |
| E01 | | "A user can …" | FT-### | E00 | | pending |

```mermaid
graph LR
  EP00[E00 Skeleton] --> EP01[E01 …]
```

## 2. Sequencing rationale
Why this order: risk-first, dependency-driven, demo value. 3–6 bullets.

## 3. Parallelization map
Which epics/tasks can run in parallel and where the merge points are.

## 4. Checkpoint plan
What the human reviews at each epic checkpoint (runnable flow + QA report + remap proposal).

## 5. Remap log
Filled over time by `/checkpoint` when epics are re-scoped.

| Date | Change | Reason | Checkpoint |
|---|---|---|---|

## Handoff
