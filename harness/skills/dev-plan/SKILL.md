---
name: dev-plan
description: Run Phase 4 via the team-lead agent — epic map with E00 skeleton first, every epic a runnable flow, dependency graph, parallel lanes, checkpoint plan; then spec E00 fully.
---

# /dev-plan — development plan + Epic 00

1. Preconditions: decided tech plan. Read Handoffs + ALL lessons (`harness/memory/lessons/`).
2. Delegate to the **team-lead** agent:
   - `project/04-plan/dev-plan.md` from `templates/dev-plan.md`: epic map (every epic's
     "runnable flow" names what a human can DO), Mermaid dependency graph, risk-first
     sequencing rationale, parallelization map, checkpoint plan. Every FT lands in exactly
     one epic.
   - `epics/E00-genesis/epic.md` from `templates/epic-00-skeleton.md`, with
     §3 extracted to `conventions.md` and task specs in `tasks/` from `epics/_templates/task.template.md`.
3. Present: the epic map + graph, E00's structure/conventions summary, open questions
   batched. Feature-list coverage check (unmapped FTs = defect).
4. On approval: Handoffs, seed `state.yaml` epics list (E00 `specced`, rest `pending`),
   `phase: build`, `current_epic: E00`, commit `dev-plan: epic map + E00 spec`.
5. Next: `/build` (E00), then the loop: `/qa E00` → `/checkpoint E00` →
   `/epic E01` → …
