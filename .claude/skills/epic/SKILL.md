---
name: epic
description: Spec one epic via the planner agent — epic spec plus complete task-spec prompts (what/where/how/what-not/ACs/test cases/checklist), parallel lanes with no shared files. Usage - /epic EP-01
---

# /epic — spec an epic

Argument: epic ID from the dev plan (default: first `pending` epic).

1. Preconditions: EP-00 checkpoint approved (for EP≥01); prior epic's checkpoint decision
   applied (remaps may have changed this epic — check dev-plan remap log). Read lessons.
2. Delegate to the **planner** agent, producing under `project/05-epics/EP-##-<slug>/`:
   - `epic.md` from `templates/epic.md` — runnable flow, scope, Mermaid flow diagram,
     task table with dependencies + parallel lanes, integration task last.
   - `tasks/T-##.##.md` from `templates/task.md`, EVERY section filled to the spec test
     ("could a stranger execute this from the file alone?"). Lanes share no files.
3. Cross-check: epic covers its FTs fully (vs matrix); screens it touches are `approved`
   (else `/design SCR-###` first or D-###); no task requires an undecided ADR.
4. Present: runnable flow sentence, task table, lane plan, batched open questions.
5. On approval: epic `specced` in state.yaml (with task list), matrix rows updated,
   Handoff, commit `EP-##: specced`.
6. Next: `/build`.
