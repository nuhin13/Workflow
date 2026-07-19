---
name: lesson
description: Append a lesson learned (LSN-###) to memory/lessons.md — after QA failures, checkpoint surprises, rework, or any "we should never do that again" moment. Lessons bind future planning and building.
---

# /lesson — record a lesson

1. Take the lesson from `$ARGUMENTS` or the current situation (a QA report's proposals, a
   remap's cause).
2. Next LSN-### ID; append to `memory/lessons.md` in its format. The critical field is
   **"Rule going forward"** — it must be an actionable instruction a future agent can obey
   mechanically, not a reflection ("Rule: every task spec that touches auth must list the
   session-refresh edge case in §8", not "we should think more about auth").
3. If the rule is universal (would apply to every future project), ALSO propose the
   corresponding one-line edit to the harness itself (template, agent, or skill file) —
   that's how the harness compounds. Apply it if the human approves or it's unambiguous.
4. Commit `lesson: LSN-### <title>`.
