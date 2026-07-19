# Master Epic Map

> Empty until the PM agent runs `/epic-breakdown` against the approved
> `spec/srs.md` and the HUMAN approves the map (constitution rule 4 +
> `harness.yaml: human_gates.feature_epic_breakdown`).
>
> **Wave model:** Epic 00 (genesis) is built, reviewed and LOCKED at its exit
> gate FIRST — stack, architecture, security baseline, deployable walking
> skeleton. Then the PM proposes the first wave of feature epics from the
> dependency graph; the human approves each wave before it executes.

| # | Epic | SRS module | depends_on | WSJF | Status |
|---|------|-----------|------------|------|--------|
| E00 | Genesis (stack · architecture · skeleton) | — | — | — | todo |
| …  | *(PM fills via /epic-breakdown)* | | | | |

Templates: `_templates/epic.template.md`, `_templates/task.template.md`,
`_templates/tracker.template.md`.
