---
name: retro
description: Run the post-epic retrospective and the lesson->rule->hook promotion ladder that makes agents improve. Use after every epic, after any rollback/incident, and when the same mistake appears twice.
---
# Retro & Self-Improvement Ladder

## When
After every epic (mandatory), after any rollback/incident, or on demand.

## Procedure (workflows/retro.md drives it)
1. Evidence pass over the epic: tracker history, QA verdicts
   (changes-requested reasons!), bug list, metrics.csv (estimate vs actual
   tokens/cost), handoff packets, human feedback notes.
2. For each mistake/rework item write a lesson to
   `harness/memory/lessons/<area>.md` using the template: situation, root
   cause, fix, source task, recurrence count (increment if it exists!).
3. **Promotion ladder** (the core mechanism):
   - 1st occurrence → lesson (suggestion; agents read area lessons pre-task)
   - recurring → RULE: fold into the relevant SKILL.md or agent file —
     **diff the skill like code; human approves the PR** (skills are
     versioned software; a bad "lesson" can make agents worse)
   - must-be-enforced → HOOK: deterministic check in `harness/hooks/`
     (e.g. commit-msg format, protected-path guard)
4. Estimation calibration: if actual tokens >1.5× estimate on a tier twice,
   adjust the tier guidance in task-sharding.
5. Write the retro summary into `epics/E<NN>/retro.md`; add Lesson nodes to
   Graphiti (`LEARNED_FROM` → tasks/bugs); post RETRO digest to Slack.

## Rules
- Lessons are about THE SYSTEM (spec gaps, skill gaps, gate misses) — blame
  fixes nothing; a missing rule does.
- Never auto-merge skill edits. Human gate on every promotion.
