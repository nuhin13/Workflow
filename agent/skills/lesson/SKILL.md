---
name: lesson
description: Append a lesson learned (L-<area>-###) to agent/memory/lessons/ — after QA failures, checkpoint surprises, rework, or any "we should never do that again" moment. Lessons bind future planning and building.
---

# /lesson — record a lesson

1. Take the lesson from `$ARGUMENTS` or the current situation (a QA report's proposals, a
   remap's cause).
2. Pick the area file `agent/memory/lessons/<area>.md` (backend, frontend, git, qa,
   infra, process — see its README), take the next `L-<area>-<nnn>` ID, and append an
   entry in the README's format (situation / root cause / fix applied / recurrence /
   status). The critical field is **"fix applied"** — an actionable instruction a future
   agent can obey mechanically, not a reflection ("every task spec that touches auth must
   list the session-refresh edge case in §8", not "we should think more about auth").
   A recurring lesson (recurrence ≥ 2) triggers a promotion proposal:
   lesson → rule (SKILL.md edit, human-approved) → hook (deterministic).
3. If the rule is universal (would apply to every future project), ALSO propose the
   corresponding one-line edit to the harness itself (template, agent, or skill file) —
   that's how the harness compounds. Apply it if the human approves or it's unambiguous.
4. Commit `lesson: L-<area>-### <title>`.
