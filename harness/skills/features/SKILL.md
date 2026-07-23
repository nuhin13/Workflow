---
name: features
description: Derive or revise the feature list from the PRD via the analyst agent — FT-### features with honest depth ratings that drive epic sizing; XL features get decomposed.
---

# /features — feature list

1. Precondition: approved PRD. Read its Handoff block.
2. Delegate to the **analyst** agent: produce/revise `workspace/plan/00-business/feature-list.md`
   from `harness/templates/business/feature-list.md`. Every FT traces to ≥1 FR; every MVP FR is covered by
   ≥1 FT; depth (S/M/L/XL) justified in depth notes; XL rows decomposed before handoff.
3. Present: the table, coverage check result (uncovered FRs, orphan FTs), depth
   distribution. Batched questions if priorities are unclear.
4. On approval: Handoff, state update, commit `business: feature list`.
5. Next: `/forecast` (or `/design` if forecast already exists).
