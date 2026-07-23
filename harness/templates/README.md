# harness/templates/ — canonical artifact templates (one home · v2 §8)

**Why this exists.** One folder, one place to look, one place to update.
Same-shaped artifacts every time: agents parse them, humans skim them, nothing
important gets silently dropped. v1 split templates across `templates/` and
`workspace/epics/_templates/` for no principled reason — v2 merges them here, sorted by
pipeline stage.

**How it works.** Constitution rule 14: every pipeline artifact starts from its
template; keep every section, write `N/A — reason` rather than deleting.

| Sub-folder | Templates | Used by |
|---|---|---|
| `business/` | brd.md · prd.md · feature-list.md · business-forecast.md | /brd /prd /features /forecast (analyst) |
| `design/` | design-system.md · screen-spec.md | /design (designer) |
| `plan/` | adr.md · tech-plan.md · dev-plan.md · traceability-matrix.md | /tech-plan /dev-plan /trace |
| `epic/` | epic-00-skeleton.md · epic.template.md · task.template.md · tracker.template.md | /dev-plan /epic /task-sharding (team-lead) |
| `process/` | handoff.md · discrepancy-note.md · open-questions.md · checkpoint.md · qa-report.md | every agent · /question /checkpoint /qa |

**What it does NOT cover.** The lesson template stays with reusable lessons
(`harness/memory/lessons/_template.md`), and the rate-limit freeze packet lives
with its handler (`harness/handoffs/_template.handoff.yaml`).
