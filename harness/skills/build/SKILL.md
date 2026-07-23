---
name: build
description: Execute the current epic's task specs — pick unblocked tasks via the scheduler, dispatch developer agents (one task = one branch = one worktree), respect lanes and WIP limits, drive each task to review-requested. Usage - /build [E<NN> | E<NN>-T<MM>]
---

# /build — execute task specs

Argument: an epic (`E<NN>`, default: `current_epic` from `memory/state.yaml`)
or a single task (`E<NN>-T<MM>`).

1. **Pick.** `make next` (scheduler) lists unblocked tasks in pick order;
   `make next LAYER=frontend` for one lane. Respect the WIP limit
   (`harness.yaml: scheduler.wip_limit_parallel_agents`). Parallel tasks must
   not share files.
2. **Dispatch.** For each picked task, follow
   `harness/workflows/implement-task.md`: branch `epic_<NN>_task_<MM>`, one
   worktree, the task spec is the complete prompt. Route by frontmatter:
   `owner_agent` (developer-backend / developer-frontend / devops),
   `model` tier, `preferred_agent` platform — headless via
   `harness/adapters/run-<platform>.sh` so cost + session land in `runs/` and
   `metrics.csv`.
3. **Statuses.** `todo → in-progress` on start; the implementer finishes at
   `review-requested` (never `done` — QA is the gate). Blocked → `blocked`
   with a Q-### in the spec and `state.yaml` blockers.
4. **Peer review gates the task PR.** `reviewed_by` ≠ `executed_by`
   (`harness/workflows/_handoff_protocol.md` §2); merge into the epic branch on
   approval → `done`. High-risk tasks (auth, payments, migrations, security)
   additionally get `/qa E<NN>-T<MM>` before merging (constitution rule 3).
5. **Track.** Update `memory/state.yaml` (task statuses, history) and the
   epic tracker. When all tasks are `done`: `/qa E<NN>` (epic sweep) →
   `/checkpoint E<NN>`.

Rate-limit discipline: if the platform window is near its freeze threshold,
follow skills/rate-limit-handoff (freeze → handoff file → resume on the next
platform in `harness.yaml: platforms`).
