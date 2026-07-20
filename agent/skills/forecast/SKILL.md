---
name: forecast
description: Create or revise the business forecast asset via the analyst agent — demand, revenue/cost, growth scenarios, each with basis + confidence — and map every number to the engineering decisions it drives.
---

# /forecast — business forecast asset

1. Precondition: BRD exists. Existing forecast → revision mode (record what changed & why).
2. Delegate to the **analyst** agent: produce/revise
   `project/00-business/business-forecast.md` from `templates/business-forecast.md`.
   Every number has a basis (evidence or labeled guess) and confidence; §4 maps each FC-###
   to the decision it feeds. External data (market reports, analytics exports) may be
   dropped in `project/assets/forecast/` and cited.
3. Present: the three scenarios, the numbers with lowest confidence (these are risks), and
   the FC → engineering implication table.
4. On approval: Handoff, mark Phase 0 `done` if BRD/PRD/features are done too, set
   `phase: design`, commit `business: forecast`.
5. If revising mid-project: notify `/tech-plan` implications — any ADR citing a changed
   FC-### gets reviewed by the architect; file D-### where plan and forecast now disagree.
6. Next: `/design`.
