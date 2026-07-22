---
name: task-sharding
description: Shard an approved epic into nitty-gritty task files using the perfect-task template - files to touch, API contracts, function signatures, do/don't, estimates, DoD. Use whenever creating tasks, when an epic is approved, or when a task proves too big/vague mid-flight.
---
# Task Sharding (the "perfect task")

Goal: a task so specified that a FRESH agent with zero chat history can
execute it without improvising — and a human can read it in 2 minutes.

## Procedure
1. Walk the epic's EARS criteria. Group into vertical slices; each task =
   one mergeable unit of value, ~½–1 agent-session of work
   (token_estimate tier S ≈5–15k, M ≈50–150k, L ≈150–500k; L tasks should
   usually be split).
2. For each task, fill EVERY section of `epics/_templates/task.template.md`:
   - `files: create/update` — exact paths. The diff may not exceed this list.
   - `api_contracts:` — per skills/api-contract-design (method, request &
     response schemas, status codes, pagination, required fields, validation).
   - `functions:` — signature, params, returns, purpose for each function the
     agent must write. Name things per the genesis naming conventions.
   - `do / dont` — dont is the scope fence; include the tempting-but-wrong
     moves ("don't add a new crypto lib").
   - challenges, model tier, depends, MoSCoW, ui_reference, checklist,
     EARS ids, DoD.
3. **Anti-collision pass**: re-shard until no two parallelizable tasks write
   the same file (the #1 source of agent merge conflicts).
4. MANDATORY frontmatter mirror `files: {create: [...], update: [...]}` on
   parallel-risk tasks — the scheduler uses it for anti-collision checks.
5. Update `tracker.md` (state machine + mermaid dependency graph) and run the
   scheduler to sanity-check the DAG has no cycles:
   `python3 harness/orchestrator/scheduler.py --validate`
6. Hand to `harness/workflows/analyze.md` before any implementation starts.

## Hard rules
- A task with an empty `files:` or `api_contracts:`/`functions:` section
  (when applicable) is NOT ready — the developer agent must bounce it back.
- Bugs use the same template with `type: bug` + `severity:`.
