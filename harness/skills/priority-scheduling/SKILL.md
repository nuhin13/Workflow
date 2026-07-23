---
name: priority-scheduling
description: Score epics with WSJF, tag tasks with MoSCoW, keep the dependency DAG, and pick what runs next (topological order, priority tie-breaks, critical path). Use when prioritizing anything, when work is injected mid-stream, or when an agent asks "what next".
---
# Priority & Scheduling

## Epic scoring — WSJF
`wsjf = (business_value + time_criticality + risk_reduction) / job_size`,
each 1–10 (relative, fibonacci-ish). Re-score at injection or retro, not daily.

## Task tagging — MoSCoW + depends
Every task: `moscow: must|should|could|wont` and a correct `depends:` list.
MoSCoW inflation check at /analyze: if >60% of an epic is "must", the Team
Lead re-grades.

## Picking the next task (what the scheduler implements)
1. Build the DAG from all `depends:`; reject cycles.
2. READY set = status `todo` with all dependencies `done`/`verified`.
3. Order READY by: P1 bugs first → moscow (must>should>could) → parent epic
   WSJF (desc) → critical-path membership (longest dependent chain) →
   smallest token_estimate when the platform window is tight (<30% left).
4. Respect `wip_limit_parallel_agents` (2–4) and the anti-collision rule
   (no two running tasks share files).
Run it, don't hand-compute:
`python3 harness/orchestrator/scheduler.py --next [--limit N]`

## Mid-stream injection (humans can always add work)
New bug/feature = NEW task via workflows/inject-work.md, scored, slotted by
the same rules. In-progress tasks are never edited mid-flight; P1 may preempt
via a rate-limit-style freeze packet.
