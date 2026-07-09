# AGENTS.md — Agentic Harness Constitution (always-on rules)

> This file is the single cross-tool entry point (the AGENTS.md open standard).
> Claude Code, Codex CLI, OpenCode, Cursor and others read this file natively or via
> a thin adapter (see CLAUDE.md). Keep it SHORT — it is loaded on every turn.
> Everything detailed lives under `agent/` and is loaded on demand.

## What this repository is

**Basic Ticketing System** — an embeddable, SDK-style help-desk ticketing
platform (BRD v0.2; `docs/business/BRD.md` is the business source of truth;
`spec/srs.md`, once generated and approved, is canonical for build) —
built with a spec-driven, multi-agent, human-in-the-loop agentic harness.
The UI reference is the Figma design (see `docs/design/README.md`). Work flows:

```
BRD ──▶ spec/srs.md ──▶ Epic 00 (genesis) ──▶ Feature Epics ──▶ Tasks ──▶ QA-gated PRs ──▶ development ──▶ main
```

## Non-negotiable rules (the constitution)

1. **Spec is law.** Never implement behavior that does not trace to an SRS item,
   an EARS acceptance criterion, or an approved task file. If the spec is silent,
   STOP and ask the human (write the question into the task's `## Open Questions`).
2. **One task = one branch = one worktree.** Branch names (flat underscore
   scheme): integration branch `development`; epic branch `epic_<NN>`; task
   branch `epic_<NN>_task_<MM>` (e.g. `epic_00_task_00`). Never commit directly
   to `main`, `development`, or an epic branch. All promotion happens via PR.
3. **QA gates every merge.** A task PR merges into its epic branch only after the
   QA agent approves against the task's Definition of Done and EARS criteria.
4. **Human gates business fit.** Epic→development and development→main merges, schema migrations,
   new dependencies, secrets, deletions of >50 lines, and anything touching auth,
   payments, or production config require explicit human approval.
5. **Never invent APIs, fields, or file paths.** The task file's `files:`,
   `api_contracts:` and `functions:` sections are the contract. Deviation =
   stop, log to `## Open Questions`, request review.
6. **Stay in scope.** Each task file lists `What NOT to do`. Respect it. Do not
   refactor unrelated code, do not upgrade dependencies, do not "improve" things
   outside the task.
7. **Log everything.** Every headless run is stored under `runs/<task_id>/`.
   Every completed task appends a row to its epic's `metrics.csv`.
8. **Memory before work.** Before starting a task: read its task file fully,
   check `agent/memory/lessons/` for the relevant area, and query Graphiti
   (if connected) for decisions touching the same files/APIs.
9. **Commit style.** Conventional commits, message references the task id:
   `feat(E03-T07): add refresh-token endpoint`. No AI co-author trailers
   (enforced by the commit-msg hook).
10. **Tests prove done.** A task is not done until its checklist and DoD are
    fully checked, tests are green, and the tracker is updated.
11. **Statuses & lanes.** Task statuses: todo → in-progress →
    review-requested → (changes-requested →) done → verified · side:
    blocked, frozen. Lanes (`layer:`): backend, frontend, cli, infra, docs,
    cross-cutting — parallel streams pull one lane via `make next LAYER=...`.
12. **Peer review.** `reviewed_by` must be a DIFFERENT agent/model than
    `executed_by` (see `agent/workflows/_handoff_protocol.md` §2), then the
    QA gate, then human `verified`.
13. **Foundational choices are HUMAN decisions.** Stack, language, framework,
    architecture style, datastore, queue, and auth strategy are chosen by the
    human, not the agent. The agent's job is to PRESENT the best options with
    honest pros/cons + a comparison matrix + an advisory recommendation, then
    STOP and wait for the human to pick (ADR `Decision` stays `⏳ AWAITING
    HUMAN`; status stays `proposed`). Once chosen, the agent records the
    decision + consequences and only THEN proceeds. Implementation choices
    *within* an accepted ADR are the agent's to make.

## Where to look next (load on demand, not by default)

| Need | Read |
|---|---|
| How the whole harness works (start here) | `docs/harness-guide.md` |
| Your role & boundaries | `agent/agents/<role>.md` |
| How to do a process (breakdown, retro, handoff…) | `agent/workflows/` (start: `_handoff_protocol.md`) |
| A specific capability (git flow, EARS, contracts…) | `agent/skills/<skill>/SKILL.md` |
| The business requirements (source of truth) | `docs/business/BRD.md` |
| UI work — the Figma design (UI is law) | `docs/design/README.md` |
| Project-wide decisions / lessons | `agent/memory/decisions/`, `agent/memory/lessons/` |
| The human operator's playbook | `docs/HUMAN-GUIDE.md` |
| Current work queue | `make next` (scheduler) |
| External platforms (Figma, DB, Jira, Slack, Graphiti) | `agent/mcp/README.md` |

## Project conventions (filled by Epic 00 — keep updated)

- Stack: **⏳ AWAITING HUMAN — genesis epic presents options (ADR-0001)**
- Architecture: **⏳ AWAITING HUMAN (ADR-0002)**
- Methodology: **⏳ AWAITING HUMAN (ADR-0003)**
- Third-party services: **⏳ AWAITING HUMAN (ADR-0004)**
- Naming & patterns: **⏳ genesis epic (docs/conventions.md)**
- Skeleton & maps: **⏳ genesis epic**
- Design system: **⏳ genesis epic — Figma is the visual canon**
- Auth/session strategy: **⏳ AWAITING HUMAN (ADR-0005+)**

> Agents: when Epic 00 completes, the Team Lead replaces the placeholders above
> with one-line summaries and links to the full decision records.
