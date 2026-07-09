---
name: dev-plan
description: Run Phase 4 via the planner agent — epic map with EP-00 skeleton first, every epic a runnable flow, dependency graph, parallel lanes, checkpoint plan; then spec EP-00 fully.
---

# /dev-plan — development plan + Epic 00

1. Preconditions: decided tech plan. Read Handoffs + ALL lessons (`memory/lessons.md`).
2. Delegate to the **planner** agent:
   - `project/04-plan/dev-plan.md` from `templates/dev-plan.md`: epic map (every epic's
     "runnable flow" names what a human can DO), Mermaid dependency graph, risk-first
     sequencing rationale, parallelization map, checkpoint plan. Every FT lands in exactly
     one epic.
   - `project/05-epics/EP-00-skeleton/epic.md` from `templates/epic-00-skeleton.md`, with
     §3 extracted to `conventions.md` and task specs in `tasks/` from `templates/task.md`.
3. Present: the epic map + graph, EP-00's structure/conventions summary, open questions
   batched. Feature-list coverage check (unmapped FTs = defect).
4. On approval: Handoffs, seed `state.yaml` epics list (EP-00 `specced`, rest `pending`),
   `phase: build`, `current_epic: EP-00`, commit `dev-plan: epic map + EP-00 spec`.
5. Next: `/build` (EP-00), then the loop: `/qa EP-00` → `/checkpoint EP-00` →
   `/epic EP-01` → …
