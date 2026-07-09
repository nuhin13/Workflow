# Agentic Project Harness

A reusable, template-driven harness that takes a product idea from **BRD → PRD → design →
technical plan → epics → shipped code**, driven from the terminal with Claude Code, with
independent QA and a human checkpoint per epic.

This repo is the harness, not a product. Clone (or template) it for each new project.

## Quickstart

```bash
claude               # open Claude Code in the repo
/kickoff             # describe your idea → initializes state + Phase 0
```

Then follow the pipeline — each command is a slash command (skill):

| Stage | Command | Produces |
|---|---|---|
| Business | `/brd`, `/prd`, `/features`, `/forecast` | `project/00-business/` |
| Design | `/design` | design system, tokens, screens, clickable HTML prototype |
| Traceability | `/trace` | live BRD ↔ feature ↔ UI ↔ epic ↔ test matrix |
| Tech plan | `/tech-plan` | options + pros/cons + Mermaid diagrams + ADRs |
| Dev plan | `/dev-plan` | Epic 00 (skeleton) + feature epic map |
| Build | `/epic EP-01`, `/build`, `/qa EP-01` | task specs → code → QA report |
| Gate | `/checkpoint EP-01` | human approval, epic remap if needed |
| Anytime | `/status`, `/lesson`, `/question` | position, lessons, open questions |

## How it works

- **Templates** (`templates/`) define the exact shape of every artifact — BRD to task spec.
- **Agents** (`.claude/agents/`) are specialized roles: analyst, designer, architect,
  planner, builder, and an independent QA that never sees the builder's reasoning.
- **Task specs are the prompts.** `/dev-plan` + `/epic` break features into epics and tasks
  so complete (what/where/how/what-not/file patterns/checklist/test cases) that a builder
  agent can execute a task from the spec alone — in parallel where dependencies allow.
- **Memory** (`memory/`) holds pipeline state, the decision log, and compounding lessons, so
  any new session resumes exactly where the last one stopped.
- **Traceability** (`project/02-traceability/matrix.md`) links every requirement to its
  feature, screen, epic, task, and test; drift becomes a fix or an attached discrepancy note.
- **Loop:** epic → build (parallel tasks, always landing a runnable increment before any
  usage limit) → independent QA → human checkpoint → remap → next epic.

Design is Claude-native by default: tokens + components + HTML prototypes generated and
versioned in-repo. Externally designed assets (e.g. Google Stitch exports) can be dropped
into `project/assets/design-imports/` and ingested by `/design import`.

## Layout

```
CLAUDE.md            ← operating manual (read by every session)
templates/           ← canonical artifact templates
.claude/agents/      ← analyst · designer · architect · planner · builder · qa
.claude/skills/      ← the pipeline slash commands
project/             ← generated artifacts (per-project; empty in the harness)
memory/              ← state.yaml · lessons.md · decisions.md
src/                 ← product code (structure defined by Epic 00)
```
