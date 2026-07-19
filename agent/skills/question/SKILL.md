---
name: question
description: Register, list, or answer open questions (Q-###) in the central register — blocking questions pause their task and land in state.yaml blockers; answers ripple into the artifacts that raised them. Usage - /question [new "…" | answer Q-### "…" | list]
---

# /question — open-question register

`list` (default): show `project/open-questions.md` — blocking first, each with its
recommendation. Remind which are batched for the next checkpoint.

`new "…"`: next Q-### ID; add to the register AND to the raising artifact's
open-questions table, with: raised-in, blocks (task/artifact or "—"), options + a
recommendation (mandatory — agents propose, humans dispose). If it blocks a task: task →
`blocked`, entry in state.yaml blockers.

`answer Q-### "…"`: record the answer, then **ripple it**: update every artifact that
raised or depends on the question in the same commit (BRD/PRD wording, spec sections,
matrix rows), unblock tasks (blocked → pending), remove from blockers, mark `answered`
with where it was applied. Commit `question: Q-### answered`.
