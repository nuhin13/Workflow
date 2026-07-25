# Open Questions — Garazo

Central register (`workspace/open-questions.md`). Every `Q-###` in any artifact
is indexed here. Blocking questions are mirrored as IDs only in
`workspace/state.yaml`.

| ID | Question | Raised in | Blocks | Options + recommendation | Status | Answer |
|---|---|---|---|---|---|---|
| Q-001 | BRD v1 references `Garazo_Feature_Specs.md`, `Garazo_Design_Brief.md`, and `Garage_Market_Problem_Analysis.md`, but they are not in the repository. Will these be supplied, or are BRD v1 and HTML prototype v1 the complete planning inputs? | Kickoff input review | `/prd` | Supply them if they contain requirements not captured in the BRD or prototype; otherwise explicitly approve BRD v1 + HTML v1 as the complete source set. Recommend supplying them when available to avoid losing product detail. | answered | BRD v1 and HTML prototype v1 are the complete, locked planning inputs. The named companion documents are not part of v1. Any addition, removal, or content change creates v2. Applied to `workspace/plan/00-business/idea.md` and `workspace/state.yaml` on 2026-07-26. |
| Q-002 | May BRD v2 be created as a structural normalization of locked BRD v1, adding the required `BR-###` IDs, template metadata, and Handoff block without changing business meaning or scope? | `/prd` precondition review | `/prd` | A: create BRD v2 and preserve v1 unchanged; B: keep the non-canonical BRD and create a supplemental ID map. Recommend A because the harness requires every PRD requirement to trace to a `BR-###` ID in the canonical BRD. | answered | No v2 work now. Keep BRD v1 and HTML prototype v1 untouched and focus on v1. Derived v1 planning documents may define stable trace aliases to exact BRD v1 sections without changing the source. Applied to `workspace/plan/00-business/idea.md` and `workspace/state.yaml` on 2026-07-26. |

Rules:
- Every question carries a recommendation; agents propose, humans decide.
- When answered, apply the answer to every artifact that raised it in the same
  commit, mark it `answered`, and note where it was applied.
- Batch non-blocking questions for the next checkpoint; never interrupt for
  them.
