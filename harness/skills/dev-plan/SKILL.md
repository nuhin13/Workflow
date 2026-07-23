---
name: dev-plan
description: Run Phase 4 via the team-lead agent — epic map with E00 skeleton first, every epic a runnable flow, dependency graph, parallel lanes, checkpoint plan; then spec E00 fully.
---

# /dev-plan — development plan + Epic 00

1. Preconditions: `workspace/state.yaml: artifacts.srs.approved` is set,
   traceability is complete, and the tech plan is decided. Verify
   `workspace/spec/srs.md` exists and its approval/version matches state. If
   any check fails, STOP; do not generate epics or tasks from draft inputs.
   Read Handoffs + ALL lessons (`harness/memory/lessons/`).
2. Delegate to the **team-lead** agent:
   - `workspace/plan/04-dev/dev-plan.md` from `harness/templates/plan/dev-plan.md`: epic map (every epic's
     "runnable flow" names what a human can DO), Mermaid dependency graph, risk-first
     sequencing rationale, parallelization map, checkpoint plan. Every FT lands in exactly
     one epic.
   - `workspace/epics/E00-genesis/epic.md` from `harness/templates/epic/epic-00-skeleton.md`, with
     §3 extracted to `conventions.md` and task specs in `tasks/` from `harness/templates/epic/task.template.md`.
3. Present: the epic map + graph, E00's structure/conventions summary, open questions
   batched. Feature-list coverage check (unmapped FTs = defect).
4. On approval: Handoffs, seed `state.yaml` epics list (E00 `specced`, rest `pending`),
   `phase: build`, `current_epic: E00`, commit `dev-plan: epic map + E00 spec`.
5. Next: `/build` (E00), then the loop: `/qa E00` → `/checkpoint E00` →
   `/epic E01` → …
