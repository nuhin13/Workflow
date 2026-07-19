---
name: checkpoint
description: Human gate at epic completion — demo instructions, QA summary, remap proposal, batched questions; records the human decision, applies remaps, starts the next epic. Usage - /checkpoint E<NN>
---

# /checkpoint — human gate per epic

Argument: epic ID (default: current epic). Precondition: epic-level QA verdict is
PASS/PASS-WITH-NOTES — a FAIL cannot reach checkpoint. This is the
`harness.yaml: human_gates.epic_to_dev_merge` gate: the epic branch merges to
`development` only after the human approves here.

1. Prepare `epics/E<NN>/checkpoint.md` from `templates/checkpoint.md`:
   copy-paste demo commands (verify they work NOW, from clean start), what shipped
   (FT-###s), QA summary + link, honest remap proposal for remaining epics (informed by
   lessons + QA findings — "no change" is a valid proposal), batched open questions with
   recommendations.
2. Present it and STOP. This is the one mandatory human decision point per epic — never
   auto-approve, never start merging the next epic's code past an unapproved checkpoint.
   (Preparing the next epic's specs while waiting is allowed.)
3. Refresh the PM board (`make dashboard`) so the human reviews current state.
4. Record the decision in checkpoint.md §6 + state.yaml history:
   - **Approved:** epic → `done`; apply Q answers; run `/trace`; `current_epic` → next;
     commit `E<NN>: checkpoint approved`; immediately run `/epic <next>`.
   - **Approved with changes:** as above, plus changes become tasks in the next epic or a
     remap.
   - **Rework:** epic back to `in-progress` with the rework list routed via the team-lead.
5. Apply approved remaps: dev-plan epic map + remap log updated, affected `todo` epics
   restructured, state.yaml epics list updated, `/lesson` for whatever caused the remap.
