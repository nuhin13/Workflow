---
name: brd
description: Create or revise the Business Requirements Document from its template via the analyst agent. First step of Phase 0; rerun any time business direction changes.
---

# /brd — business requirements document

1. Read `memory/state.yaml` and `project/00-business/idea.md` (plus existing BRD if
   revising).
2. Delegate to the **analyst** agent: produce/revise `docs/business/BRD.md` from
   `templates/brd.md`, following its interrogation rules. Pass along `$ARGUMENTS` and the
   idea file.
3. Present the human: the executive summary, the objectives table, the out-of-scope list,
   and any batched blocking questions. Apply answers; non-blocking questions become Q-###
   in `project/open-questions.md`.
4. On approval mark the BRD `approved` with its Handoff block; update state + history;
   commit `business: BRD`. If the BRD changed after later phases exist, run `/trace` to
   ripple.
5. Next: `/prd`.
