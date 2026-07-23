---
name: question
description: Register, list, or answer open questions (Q-###) in the ONE central register — blocking questions pause their task and mirror into state.yaml blockers; answers ripple into the artifacts that raised them. Usage - /question [new "…" | answer Q-### "…" | list]
---

# /question — open-question register

**One source of truth (v2 · §5).** `project/open-questions.md` is the ONLY
authoritative register. `memory/state.yaml: blockers` mirrors *only the IDs*
of blocking questions (so the scheduler can pause tasks); it never holds the
question text. The artifact that raised a question links to its Q-### — it does
not restate it. This kills the v1 drift where the same question lived in three
places with three different statuses. The dashboard renders the register
(`make dashboard`).

Every entry carries: `id`, `raised-in`, `blocks` (task/artifact or "—"),
`owner` (who must answer — human or a role), `due` (the checkpoint/gate it must
clear by), `options + recommendation` (mandatory — agents propose, humans
dispose), `status` (open | answered).

`list` (default): show `project/open-questions.md` — blocking first, each with
its recommendation, owner, and due-point. Remind which are batched for the next
checkpoint.

`new "…"`: next Q-### ID; add ONE row to the register with all fields above,
and a back-link Q-### in the raising artifact (not a copy). If it blocks a
task: task → `blocked`, mirror the ID into `state.yaml: blockers`.

`answer Q-### "…"`: record the answer in the register, then **ripple it** —
update every artifact that raised or depends on the question in the same commit
(BRD/PRD wording, spec sections, matrix rows), unblock tasks
(`blocked → todo`), remove the ID from `state.yaml: blockers`, mark `answered`
with where it was applied. Commit `question: Q-### answered`.
