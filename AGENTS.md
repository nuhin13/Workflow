# AGENTS.md — Agentic Harness Constitution (always-on rules)

> This file is the single cross-tool entry point (the AGENTS.md open standard).
> Claude Code, Codex CLI, OpenCode, Cursor and others read this file natively or via
> a thin adapter (see CLAUDE.md). Keep it SHORT — it is loaded on every turn.
> Everything detailed lives under `harness/` and is loaded on demand.

## What this repository is

A **reusable, platform-agnostic agentic delivery harness** — the machine that
builds products, not a product itself. The product under construction is
defined by `workspace/docs/business/BRD.md` (business source of truth; `workspace/spec/srs.md`,
once generated and approved, is canonical for build). The UI reference is the
design canon in `workspace/docs/design/README.md` (Figma when linked). Work flows
through a phased pipeline (skills in `harness/skills/`, `/name` on Claude Code):

```
Phase 0 business   /kickoff /brd /prd /features /forecast → workspace/docs/business/BRD.md · workspace/plan/00-business/
Phase 1 design     /design                                → workspace/plan/01-design/ (Figma is law when linked)
Required SRS gate  /srs-authoring                         → workspace/spec/srs.md (HUMAN approval)
Phase 2 trace      /trace                                 → workspace/plan/02-traceability/matrix.md (kept live forever)
Phase 3 tech plan  /tech-plan                             → workspace/plan/03-technical/ · product ADRs in decisions/
Phase 4 dev plan   /dev-plan /epic                        → workspace/plan/04-dev/ · workspace/epics/E<NN>/
Phase 5 build loop /build → /qa → /checkpoint (per epic)  → QA-gated PRs ──▶ development ──▶ main
```

Phases run in order; a revisited phase must ripple (`/trace`) before work
continues. PRD → `workspace/spec/srs.md` (EARS) is authored via skills/srs-authoring;
once approved the SRS is canonical for build.

**Profiles decide how much of this runs (v2 · HADR-0001).** `/kickoff` sets a
`profile` (`small`/`medium`/`large`/`extra-large`/`enterprise`, human-picked)
that selects which phases run, which human gates apply, how deep review goes,
which git tiers exist, and QA depth (`harness.yaml: profiles`). Every profile
keeps the executable contract-producing spine (approved SRS, traceability,
technical decisions, dev plan, then build); lighter profiles reduce review,
git, QA, and artifact depth rather than skipping prerequisites. The
`development` branch tier exists only at `extra-large`+. Escalating a profile
mid-project is recorded like an ADR; downgrading must state the verification
it drops.

**IDs (traceability — never invent other formats):** `BR-###` business req ·
`FR-###` product req (PRD) · `FR-<AREA>-NN` / `NFR-<AREA>-NN` SRS
functional/non-functional req · `FT-###` feature · `SCR-###` screen · `FC-###` forecast
assumption · `ADR-####` product decision · `HADR-####` harness decision · `E<NN>` epic · `E<NN>-T<MM>` task
(`E<NN>-B<MM>` bug) · `Q-###` open question · `D-###` discrepancy ·
`L-<area>-<nnn>` lesson · `EARS-<AREA>-n` acceptance criterion. Every artifact
lists what it traces from/to; `workspace/plan/02-traceability/matrix.md` is the join
table.

## Non-negotiable rules (the constitution)

1. **Spec is law.** Never implement behavior that does not trace to an SRS item,
   an EARS acceptance criterion, or an approved task file. If the spec is silent,
   STOP and ask the human (write the question into the task's `## Open Questions`).
2. **One task = one branch = one worktree.** Branch names (flat underscore
   scheme): integration branch `development`; epic branch `epic_<NN>`; task
   branch `epic_<NN>_task_<MM>` (e.g. `epic_00_task_00`). Never commit directly
   to `main`, `development`, or an epic branch. Which tiers exist — and whether
   promotion needs a PR or a recorded squash-merge — is set by the profile's
   `git:` block (`require_pr` is true only at `enterprise`); parallel agents
   always need separate worktrees regardless of profile.
3. **Review gates every merge.** A task PR merges into its epic branch only
   after PEER review by a different agent/model (rule 12). The epic merges into
   `development` only after the independent QA agent — fresh context, spec +
   repo only — approves the full epic against DoD + EARS (`/qa E<NN>`).
   Task-level QA (`/qa E<NN>-T<MM>`) is additionally required for high-risk
   tasks (auth, payments, migrations, security).
4. **Human gates business fit.** Epic→development and development→main merges, schema migrations,
   new dependencies, secrets, deletions of >50 lines, and anything touching auth,
   payments, or production config require explicit human approval.
5. **Never invent APIs, fields, or file paths.** The task file's `files:`,
   `api_contracts:` and `functions:` sections are the contract. Deviation =
   stop, log to `## Open Questions`, request review.
6. **Stay in scope.** Each task file lists `What NOT to do`. Respect it. Do not
   refactor unrelated code, do not upgrade dependencies, do not "improve" things
   outside the task. Each ROLE also has a declared write scope
   (`harness.yaml: write_scopes`, validator-enforced); harness files (harness/,
   AGENTS.md, harness/templates/…) change only via lesson promotion or
   skills/skill-authoring with human approval (`harness_change_policy`).
7. **Log everything.** Every headless run is stored under `workspace/runs/<task_id>/`.
   Every completed task appends a row to its epic's `metrics.csv`.
8. **Memory before work.** Before starting a task: read its task file fully,
   check `harness/memory/lessons/` for the relevant area, and query Graphiti
   (if connected) for decisions touching the same files/APIs.
9. **Commit style.** Conventional commits, message references the task id:
   `feat(E03-T07): add refresh-token endpoint`. No AI co-author trailers
   (enforced by the commit-msg hook).
10. **Tests prove done.** A task is not done until its checklist and DoD are
    fully checked, tests are green, and the tracker is updated.
11. **Statuses & lanes.** Task statuses: todo → in-progress →
    review-requested → (changes-requested →) done → verified · side:
    blocked, frozen. Lanes (`layer:`): backend, frontend, cli, infra, docs,
    cross-cutting — parallel streams pull one lane via
    `make next PLATFORM=<platform> LAYER=...`.
12. **Peer review.** `reviewed_by` must be a DIFFERENT agent/model than
    `executed_by` (see `harness/workflows/_handoff_protocol.md` §2), then the
    QA gate, then human `verified`.
13. **Foundational choices are HUMAN decisions.** Stack, language, framework,
    architecture style, datastore, queue, and auth strategy are chosen by the
    human, not the agent. The agent's job is to PRESENT the best options with
    honest pros/cons + a comparison matrix + an advisory recommendation, then
    STOP and wait for the human to pick (ADR `Decision` stays `⏳ AWAITING
    HUMAN`; status stays `proposed`). Once chosen, the agent records the
    decision + consequences and only THEN proceeds. Implementation choices
    *within* an accepted ADR are the agent's to make.
14. **Templates always, plainly.** Every pipeline artifact starts from its
    file in `harness/templates/` (epic/task templates: `harness/templates/epic/`). Keep every
    section; write `N/A — reason` rather than deleting. Human-facing documents
    follow skills/plain-language: short sentences, simple words, visuals over
    prose.
15. **State always.** After completing any stage, update `workspace/state.yaml`
    (phase, statuses, history). A fresh session must be able to resume from
    state alone — read it at session start.
16. **Traceability always.** Creating or changing any artifact ⇒ update
    `workspace/plan/02-traceability/matrix.md` in the same commit. Fixable mismatch:
    fix in all linked artifacts. Unfixable: file a `D-###` discrepancy note
    linked from both sides.

## Where to look next (load on demand, not by default)

| Need | Read |
|---|---|
| How the whole harness works (start here) | `harness/docs/harness-guide.md` |
| Your role & boundaries | `harness/agents/<role>.md` |
| How to do a process (breakdown, retro, handoff…) | `harness/workflows/` (start: `_handoff_protocol.md`) |
| A specific capability (git flow, EARS, contracts…) | `harness/skills/<skill>/SKILL.md` |
| The business requirements (source of truth) | `workspace/docs/business/BRD.md` |
| UI work — the Figma design (UI is law) | `workspace/docs/design/README.md` |
| Product decisions / harness lessons | `workspace/plan/03-technical/decisions/`, `harness/memory/lessons/` |
| The human operator's playbook | `harness/docs/HUMAN-GUIDE.md` |
| Pipeline position / resume point | `workspace/state.yaml` (then `/status`) |
| Canonical artifact templates | `harness/templates/` · `harness/templates/epic/` |
| Product workspace (phase artifacts) | `workspace/plan/00-business/ … 04-dev/` |
| Epics & task specs (the work queue) | `workspace/epics/E<NN>/` |
| Current work queue | `make next PLATFORM=codex` (scheduler; choose active platform) |
| External platforms (Figma, DB, Jira, Slack, Graphiti) | `harness/mcp/README.md` |

## Project conventions (filled by Epic 00 — keep updated)

- Stack: **⏳ AWAITING HUMAN — `/tech-plan` presents options (ADR-0001)**
- Architecture: **⏳ AWAITING HUMAN — `/tech-plan` (ADR-0002)**
- Methodology: **⏳ AWAITING HUMAN — `/tech-plan` (ADR-0003)**
- Third-party services: **⏳ AWAITING HUMAN — `/tech-plan` (ADR-0004)**
- Naming & patterns: **⏳ genesis epic (workspace/epics/E00-genesis/conventions.md)**
- Skeleton & maps: **⏳ genesis epic**
- Design system: **⏳ genesis epic — Figma is the visual canon**
- Auth/session strategy: **⏳ AWAITING HUMAN — `/tech-plan` (ADR-0005+)**

> Agents: when Epic 00 completes, the Team Lead replaces the placeholders above
> with one-line summaries and links to the full decision records.
