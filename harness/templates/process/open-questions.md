# Open Questions — <Project Name>

Central register (`workspace/open-questions.md` in a live project). Every `Q-###` in any
artifact is also indexed here by `/question`. Blocking questions also live in
`workspace/state.yaml → blockers` as IDs only (for example, `[Q-001]`).
Question text, ownership, status, and blocking targets live only in this register.

| ID | Question | Raised in | Blocks | Options + recommendation | Status | Answer |
|---|---|---|---|---|---|---|
| Q-001 | | BRD §7 | E01-T02 | A/B — recommend A because … | open | |

Rules:
- Every question carries a recommendation — agents propose, humans dispose.
- Answered ⇒ ripple the answer into the artifacts that raised it (same commit), mark
  `answered`, note where it was applied.
- Batch non-blocking questions for the next checkpoint; never interrupt for them.
