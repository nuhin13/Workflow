---
name: kickoff
description: Start a new project in the harness — capture the idea, initialize project structure and pipeline state, then launch Phase 0 (BRD). Use once per project, at the very beginning.
---

# /kickoff — start a new project

1. **Guard:** read `memory/state.yaml`. If a project is already set, stop and ask — kickoff
   on a live project is destructive.
2. **Capture the idea.** From `$ARGUMENTS` or by asking: working name, one-liner, target
   users, the problem, any known constraints (budget, deadline, platform), what "success in
   6 months" looks like. Ask in ONE batched round of questions.
3. **Initialize:**
   - Create `project/00-business/ … 04-plan/` (epics live in `epics/`),
     `project/assets/design-imports/`,
     `project/open-questions.md` (from `templates/open-questions.md`).
   - Fill `memory/state.yaml`: project name/one-liner/started, `phase: business`,
     business `in-progress`, history entry "kickoff".
   - Write `project/00-business/idea.md` — the raw captured idea, verbatim-ish. This is the
     analyst's primary input and stays as the origin record.
4. **Commit** (`kickoff: <project name>`), then immediately run `/brd`.
