# workspace/ — live project workspace

**Why this exists.** This folder contains the current product/project instance:
its state, business/design inputs, build spec, plans, work queue, run logs, and
generated dashboard.

It is kept apart from `harness/`, which is the reusable engine.

| Path | Purpose |
|---|---|
| `state.yaml` | Pipeline position: phase, epics, task statuses, blockers, history |
| `docs/` | Product-facing business and design source documents |
| `spec/` | Approved SRS and glossary; canonical build law once generated |
| `plan/` | Phase 0-4 generated planning artifacts (the SRS gate lives in `spec/`) |
| `epics/` | Epic and task queue consumed by the scheduler |
| `runs/` | Headless run logs and cost/session audit trail |
| `dashboard/` | Generated PM console |
| `assets/` | Forecast inputs, imported design assets, and other project evidence |
| `open-questions.md` | Q-### register created by `/kickoff` or `/question` |

**What it does NOT cover.** Harness rules, skills, workflows, templates,
adapters, and long-term reusable memory. Those live under `harness/`.

Read `workspace/state.yaml` at session start. Update it after every completed
stage so a fresh agent can resume without chat history.
