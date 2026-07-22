# templates/ — canonical artifact templates

**Why this exists.** Same-shaped artifacts every time: agents can parse
them, humans can skim them, and nothing important gets silently dropped.

**What it does NOT cover.** Epic/task/tracker templates (they live in
`epics/_templates/` because the scheduler parses their frontmatter) and
ADR/lesson/freeze-handoff templates (single canonical homes listed at
the bottom).

Constitution rule 14: every pipeline artifact starts from its template. Keep
every section; write `N/A — reason` rather than deleting.

| Artifact | Template | Written to | By |
|---|---|---|---|
| BRD | `brd.md` | `docs/business/BRD.md` | /brd (analyst) |
| PRD | `prd.md` | `project/00-business/prd.md` | /prd (analyst) |
| Feature list | `feature-list.md` | `project/00-business/feature-list.md` | /features (analyst) |
| Business forecast | `business-forecast.md` | `project/00-business/business-forecast.md` | /forecast (analyst) |
| Design system | `design-system.md` | `project/01-design/design-system.md` | /design (designer) |
| Screen spec | `screen-spec.md` | `project/01-design/screens/SCR-###-*.md` | /design (designer) |
| Traceability matrix | `traceability-matrix.md` | `project/02-traceability/matrix.md` | /trace |
| Discrepancy note | `discrepancy-note.md` | `project/02-traceability/discrepancies/D-###.md` | /trace |
| Tech plan | `tech-plan.md` | `project/03-technical/tech-plan.md` | /tech-plan (architect) |
| Dev plan | `dev-plan.md` | `project/04-plan/dev-plan.md` | /dev-plan (team-lead) |
| Epic 00 (genesis) | `epic-00-skeleton.md` | `epics/E00-genesis/epic.md` | /dev-plan (team-lead) |
| Open questions | `open-questions.md` | `project/open-questions.md` | /question |
| Checkpoint | `checkpoint.md` | `epics/E<NN>/checkpoint.md` | /checkpoint |
| QA report | `qa-report.md` | `epics/E<NN>/qa/<id>-report.md` | /qa (qa agent) |
| Phase/agent handoff block | `handoff.md` | bottom of the produced artifact | every agent |

Templates that live elsewhere (single canonical home, do not duplicate here):

| Artifact | Template |
|---|---|
| Feature epic | `epics/_templates/epic.template.md` |
| Task spec | `epics/_templates/task.template.md` |
| Epic tracker | `epics/_templates/tracker.template.md` |
| ADR | `harness/memory/decisions/ADR-0000-template.md` |
| Lesson entry | `harness/memory/lessons/_template.md` |
| Rate-limit freeze handoff | `harness/handoffs/_template.handoff.yaml` |
