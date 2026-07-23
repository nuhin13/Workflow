---
name: status
description: Show where the project is — phase, current epic, task board, blockers, open questions, next action — from state.yaml plus a quick consistency check against reality.
---

# /status — pipeline position

1. Read `workspace/state.yaml`, `workspace/open-questions.md`, and the current epic's task
   table (if in build).
2. **Consistency check:** does state match reality? (artifacts listed exist; task statuses
   match git log; current epic's spec exists). Mismatches are reported and fixed in
   state.yaml — state must never lie.
3. Report, compactly:
   - Project + phase, and per-phase ✅/🔄/⬜ line
   - Build phase: epic board (per epic: status; current epic: per-task status/owner/lane)
   - Blockers (Q-### with what they block) and high-severity D-###
   - Last 3 history events
   - **Next action:** the single command to run next (this is the loop's steering wheel)
4. Refresh the PM board: `make dashboard` → `workspace/dashboard/index.html` (phases,
   epic/task board with owner → reviewer, blockers, open questions, costs,
   artifact links). Open it in any browser; it is a single static file.
