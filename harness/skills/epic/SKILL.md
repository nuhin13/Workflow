---
name: epic
description: Spec one epic via the team-lead agent — epic spec plus complete task-spec prompts (what/where/how/what-not/ACs/test cases/checklist), parallel lanes with no shared files. Usage - /epic E01
---

# /epic — spec an epic

Argument: epic ID from the dev plan (default: first `todo` epic).

1. Preconditions: E00 checkpoint approved (for E≥01); prior epic's checkpoint decision
   applied (remaps may have changed this epic — check dev-plan remap log). Read lessons.
2. Delegate to the **team-lead** agent, producing under `workspace/epics/E<NN>-<slug>/`:
   - `epic.md` from `harness/templates/epic/epic.template.md` — runnable flow, scope, Mermaid flow diagram,
     task table with dependencies + parallel lanes, integration task last.
   - `tasks/E<NN>-T<MM>-<slug>.md` from `harness/templates/epic/task.template.md` (slug = the
     deliverable, lowercase-hyphenated ≤4 words; ID inside stays stable), EVERY section filled to the spec test
     ("could a stranger execute this from the file alone?"). Lanes share no files.
3. Cross-check: epic covers its FTs fully (vs matrix); screens it touches are `approved`
   (else `/design SCR-###` first or D-###); no task requires an undecided ADR.
4. Present: runnable flow sentence, task table, lane plan, batched open questions.
5. On approval: epic `specced` in state.yaml (with task list), matrix rows updated,
   Handoff, commit `E<NN>: specced`.
6. Next: `/build`.
