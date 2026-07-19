---
name: prd
description: Create or revise the Product Requirements Document from the approved BRD via the analyst agent — personas, journeys, FR-### requirements with testable acceptance criteria, MVP cut.
---

# /prd — product requirements document

1. Precondition: approved BRD (else run `/brd` first). Read its Handoff block.
2. Delegate to the **analyst** agent: produce/revise `project/00-business/prd.md` from
   `templates/prd.md`. Every FR traces to a BR; every FR has Given/When/Then acceptance
   criteria QA could verify alone; MVP cut line drawn.
3. Present: journeys summary, the FR table, the MVP cut, batched blocking questions.
   Apply answers; rest → Q-###.
4. On approval: Handoff block, state update, commit `business: PRD`. Ripple via `/trace`
   if downstream artifacts exist.
5. Next: `/features`.
