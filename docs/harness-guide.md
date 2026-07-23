# The Agentic Harness — How It Works

> Complete operating manual for this repository's multi-agent development
> harness. Read this once, then drive with `docs/HUMAN-GUIDE.md` (the 5-minute
> human playbook) and `AGENTS.md` (the constitution, loaded on every agent turn).

---

## 1. What the harness is

A **file-based multi-agent development operating system**. There is no server
and no framework — just markdown, YAML, git, and five small Python scripts
(~1,000 lines total). Any coding agent that can read markdown and write code
(Claude Code, Codex CLI, OpenCode, Cursor, …) can operate it, because **all
state lives in files and git — never in an agent's chat memory**.

The core idea: treat AI agents like a distributed team of contractors who all
share one project wiki (this repo) and one law book (`AGENTS.md`), and who can
be swapped mid-task without losing work.

```
docs/business/BRD.md          the business truth (what & why)
        │  PM agent drafts, human approves
        ▼
spec/srs.md                   the build truth ("spec is law")
        │  /epic-breakdown (PM) — human approves the epic map
        ▼
epics/E00-genesis/            stack · architecture · walking skeleton
        │  human decides ADRs (rule 13), exit gate locks E00
        ▼
epics/E01…/tasks/*.md         sharded tasks (files, contracts, EARS, DoD)
        │  make next → scheduler picks → agent implements on task branch
        ▼
QA-gated PRs                  peer AI review (different model) + QA gate
        │  human gateway: epic → development, development → main
        ▼
shipped code                  every commit traces back to a BRD line
```

## 2. The layers (what lives where)

| Layer | Location | Purpose |
|---|---|---|
| **Constitution** | `AGENTS.md` | 16 always-on rules every agent obeys every turn + the phased pipeline and ID conventions |
| **Adapter** | `CLAUDE.md` (+ others) | Platform-specific glue pointing at AGENTS.md |
| **Policy** | `harness.yaml` | Platforms, model tiers, budgets, WIP limit, human gates — "org code" |
| **Roles** | `harness/agents/` | 10 role cards / subagents: pm, team-lead (delivery planner), orchestrator, qa, devops, developer-backend, developer-frontend + pipeline roles analyst, designer, architect. Each defines boundaries: what it may do, what it must hand off. Mirrored at `.claude/agents` (symlink) |
| **Workflows** | `harness/workflows/` | 12 step-by-step processes: epic-breakdown, implement-task, qa-review, handoff-freeze/resume, retro, release, rollback triggers… Start with `_handoff_protocol.md` |
| **Skills** | `harness/skills/` | 35 on-demand skills: 16 pipeline drivers (/kickoff /brd /prd /features /forecast /design /trace /tech-plan /dev-plan /epic /build /qa /checkpoint /status /question /lesson) + capability manuals (SRS/EARS authoring, TDD, git-flow, task-sharding, API contracts, security review, rate-limit handoff, token optimization…). Mirrored at `.claude/skills` (symlink); loaded only when needed |
| **Pipeline artifacts** | `harness/templates/` → `project/` | Phase 0–4 artifacts (BRD/PRD/features/forecast, design system + screens, traceability matrix, tech plan, dev plan) — each starts from its template (see `harness/templates/README.md`) |
| **Work items** | `epics/` | Epic dirs with `epic.md`, `tracker.md`, `tasks/*.md`, `metrics.csv`. Templates in `harness/templates/epic/` |
| **Orchestrator** | `harness/orchestrator/` | `scheduler.py` (DAG + picker), `metrics_collect.py` / `metrics_report.py` (cost), `dashboard_build.py` (HTML board), `ratelimit_guard.py` (freeze trigger) |
| **Adapters (exec)** | `harness/adapters/` | `run-claude.sh`, `run-codex.sh`, `run-opencode.sh` — same prompt in, session + cost JSON out into `runs/` |
| **Handoffs** | `harness/handoffs/` | Freeze packets (YAML) for cross-platform resume |
| **Memory** | `harness/memory/` + `memory/state.yaml` | `decisions/` (ADRs), `lessons/` (retro output), `graphiti/` (optional temporal knowledge graph); `memory/state.yaml` is the pipeline position any platform resumes from |
| **Hooks** | `harness/hooks/` | Git hooks: strip AI co-author trailers, block direct pushes to main/development. Statusline script for rate-limit visibility |
| **Run logs** | `runs/<task-id>/` | Every headless run's session JSON + cost — the audit trail |

## 3. Project management (built in — no Jira needed)

**The task file IS the ticket.** YAML frontmatter carries all PM state:

```yaml
id: E01-T03
title: Password reset via email
status: todo            # → in-progress → review-requested →
                        #   (changes-requested →) done → verified
                        #   side states: blocked, frozen
layer: backend          # lane: backend|frontend|cli|infra|docs|cross-cutting
depends_on: [E01-T01]
priority: { moscow: must, p: P2 }
traces_to: [FR-AUTH-03] # BRD/SRS requirement ids — rule 1
token_estimate: { tier: M }
owner_agent: developer-backend
executed_by: null       # filled at pickup
reviewed_by: null       # MUST differ from executed_by (rule 12)
files:                  # the contract — rule 5
  create: [...]
  update: [...]
```

### Status lifecycle

| From | To | Trigger |
|------|----|---------|
| todo | in-progress | scheduler picks it (deps met, no file collision, WIP slot free) |
| in-progress | review-requested | self-review checklist passed |
| in-progress | blocked | needs human decision / external input (§18 filled) |
| in-progress | frozen | rate-limit freeze — handoff packet written |
| review-requested | changes-requested | peer/QA found issues |
| review-requested | done | peer approved + QA gate + merged |
| changes-requested | in-progress | implementer resumes |
| done | verified | HUMAN sign-off |

### Daily driving (the whole PM interface)

```
make status     # per-epic progress board (counts per status)
make next       # scheduler picks next task(s) — JSON with task/model/owner
make next LAYER=frontend   # pull one lane only (parallel streams)
make review     # tasks waiting on peer/QA review
make validate   # DAG sanity: unknown deps, cycles, missing traces_to
make dashboard  # rebuild dashboard/index.html (cost + progress board)
make metrics    # token + cost report per task/epic from metrics.csv
```

The scheduler picks by: **P1 bugs → MoSCoW → epic WSJF → critical path**
(longest dependency chain first), skips tasks whose `files:` collide with
in-flight work, and respects `wip_limit_parallel_agents` (default 3) from
`harness.yaml`. Add `--tight` when the rate-limit window is low — prefers
small (S-tier) tasks.

**Discipline that keeps it honest:** agents update frontmatter status the
moment it changes, check off the task's implementation checklist item-by-item
with commit hashes (never batch at the end), and log reviews in the epic's
`tracker.md`. `make validate` catches structure errors; status truthfulness is
enforced by the review gates.

## 4. How ANY platform runs this harness

**Core principle (handoff protocol §1): no agent is special.** A task file +
the spec + AGENTS.md contain everything needed. Handoffs move through the task
file + git — never through chat history.

### Per-platform entry points

| Platform | Reads the constitution via | Headless run |
|---|---|---|
| Claude Code | `CLAUDE.md` → `@AGENTS.md` | `harness/adapters/run-claude.sh <task-id> "<prompt>"` |
| Codex CLI | `AGENTS.md` natively | `harness/adapters/run-codex.sh` (config: `harness/mcp/codex-config.example.toml`) |
| OpenCode | `AGENTS.md` natively | `harness/adapters/run-opencode.sh` (config: `harness/mcp/opencode.example.json`) |
| Cursor / other | `AGENTS.md` (open standard) | point it at the task file + AGENTS.md |

Adapters capture session JSON + cost into `runs/<task-id>/` and append to the
epic's `metrics.csv` — so cross-platform spend stays comparable.

### The standard task prompt (any platform)

```
Read AGENTS.md, then epics/E01-auth/tasks/E01-T03.md fully.
Check harness/memory/lessons/ for the relevant area.
Execute the task exactly per its checklist. Follow the git-flow skill:
branch epic_01_task_03. Update frontmatter status + tracker as you go.
```

### Cross-platform handoff (rate limit / freeze)

1. Statusline / `ratelimit_guard.py` detects ~80% of the platform window.
2. Orchestrator runs `harness/workflows/handoff-freeze.md`: WIP-commit the
   branch, write `harness/handoffs/<task-id>.yaml` from the template
   (`next_step` and `last_test_status` are mandatory), set `status: frozen`.
3. Next platform (fallback order in `harness.yaml: platforms`) runs
   `handoff-resume.md`: reads ONLY the packet + task file + AGENTS.md,
   re-runs the failing tests first, executes `next_step` literally.

Same mechanism covers "Claude implements, Codex reviews" — the peer-review
rule (implementer ≠ reviewer, different model) is the harness's defense
against single-model blind spots.

### Model routing (cost control)

`harness.yaml: model_tiers` — plan/review on the top tier (opus), default
implementation on mid tier (sonnet), trivia (renames, boilerplate) on the
cheap tier (haiku). Budgets warn at $5/task, $60/epic. Details:
`harness/skills/token-optimization/SKILL.md`.

## 5. The review chain (quality gates)

```
Agent implements
  → self-review (task §15) → status: review-requested
    → PEER AI review — DIFFERENT model than implementer (per task)
      → done  OR  changes-requested
        → [epic build-complete] → QA GATE (per epic, human picks the QA model)
          → 🧍 HUMAN GATEWAY: epic → development merge
            → verified
```

Two distinct gates — never collapse them:
1. **Per-task peer review** — different model, every task, before `done`.
2. **Per-epic QA gate** — once, when the epic is build-complete: QA agent runs
   `qa-pr-review` + `security-review` skills against the full epic diff.
   Strongest form: run it in a separate session/platform (zero shared context).

The human reviews *QA-approved* work — human time goes to business judgment,
not typo-catching. Human gates are listed in `harness.yaml: human_gates`.

## 6. Benefits (why this is worth the ceremony)

1. **Platform-agnostic & interruption-proof.** Any agent resumes any task from
   files + git. A rate limit or crash loses nothing.
2. **Full traceability.** BRD id → SRS item → epic → task → EARS criterion →
   test name → conventional commit. Auditable end to end.
3. **Human effort spent on judgment.** Gates trigger only on business-fit
   decisions (stack, merges, auth/payments, schema). AI catches AI's typos.
4. **Anti-hallucination contracts.** Task `files:`/`api_contracts:` sections
   bound what an agent may touch; deviation = stop + Open Questions.
5. **Cross-model review** catches single-model blind spots systematically.
6. **Cost visibility & control.** Every run logged; model tiers route work to
   the cheapest capable model; budgets warn before surprises.
7. **Self-improving.** Retro ladder: lesson → rule → hook. A mistake made
   twice becomes an enforced rule.
8. **Zero infrastructure.** Versioned with the code; survives any clone.

## 7. Limitations (know them going in)

1. **Ceremony overhead.** Task file + EARS + branch + PR + peer review for a
   one-line fix costs more than the fix. Batch trivia; use the `trivial` tier.
2. **Frontmatter drift is the #1 failure mode.** Status lives in markdown; a
   forgetful agent makes the scheduler lie. Mitigation: review gates check
   tracker state; `make validate` before every pickup.
3. **The human is on the critical path by design.** Epic merges wait for you.
   Plan your availability around the wave gates.
4. **Parallelism is bounded.** WIP limit + file-collision skipping means
   shared-surface work (schema, routes) serializes. Shard accordingly.
5. **Spec quality is the ceiling.** The harness builds what the SRS says —
   including its mistakes. EARS authoring is the highest-leverage human skill.
6. **The scheduler is deliberately dumb.** No daemon, no retries, no agent
   health checks — it trusts frontmatter. Simplicity is the feature; don't
   expect Jira automation.
7. **Cross-platform orchestration is human-triggered.** Adapters run headless,
   but you (or the orchestrator agent) launch them; there is no background
   daemon moving work between platforms.
8. **Learning curve.** 16 rules, 10 roles, 12 workflows, 35 skills. Newcomers:
   read this doc + `docs/HUMAN-GUIDE.md`, ignore the rest until a workflow
   points at it.

## 8. Bootstrap sequence for a NEW project

```
0. make hooks                      # install git hooks
   pip install -r requirements.txt # pyyaml for the scheduler
   git branch development main     # integration branch must exist
   (.claude/skills and .claude/agents are already symlinked into harness/)
1. Phase 0-3: /kickoff → /brd → /prd → /features → /forecast
   → /design → /trace → /tech-plan            → HUMAN approves each artifact
   PM agent: draft spec/srs.md from BRD/PRD (skills/srs-authoring)
                                              → HUMAN approves
2. /dev-plan → master epic map                → HUMAN approves
3. Genesis epic E00: agent presents stack/architecture options with pros+cons
   → HUMAN decides ADRs (rule 13) → walking skeleton built → E00 exit gate
4. Team Lead updates AGENTS.md "Project conventions" placeholders
5. First feature wave: shard → make next → implement → review → merge
6. After each epic: /retro → lessons → promotions (HUMAN approves)
```

Paste the Figma URL into `docs/design/README.md` before any frontend epic.

## 9. Session rituals (per agent session — any platform)

The harness's continuity mechanism is the task file itself: §12 checklist =
live progress log, §15 = self-review evidence, §18 + handoff packet = freeze
state. That only works if every session follows the same ritual:

**Session start (re-anchor before any new work)**
1. `make validate` — never build on a broken DAG/frontmatter.
2. Read the task file FULLY; find the first unchecked §12 item — that is
   your starting point (checklist = progress file; git log confirms it).
3. Read the relevant `harness/memory/lessons/<area>.md`; Graphiti pull if
   connected (2 queries max, per skills/graphiti-memory).
4. Resuming (frozen/blocked/changes-requested)? Re-run the last failing
   tests FIRST to re-anchor reality, then continue.

**Session end (leave the repo strange-agent-ready)**
1. Commit everything (uncommitted work is invisible — protocol §4).
2. Checklist ticks carry commit hashes; no `(uncommitted)` markers remain.
3. Status frontmatter + tracker reflect reality NOW.
4. Green or clearly red: tests pass, or §18 says exactly what fails and why.
5. 📋 STATUS block: what/why/how-tested/risks/next.

Verification is end-to-end, not test-suite-only: a "done" feature has been
exercised through its real surface (API call, or browser via playwright for
UI) at least once — the QA gate re-checks this, but the implementer proves
it first (§15).

## 10. Skill & workflow lifecycle (how the harness itself evolves)

The harness treats its own process files as versioned software. Changes flow
through the retro ladder — **never mid-epic, never without the human gate**:

```
mistake observed
  → LESSON  harness/memory/lessons/<area>.md   (retro writes; 1st occurrence)
    → RULE  fold into SKILL.md / role card   (recurrence ≥2; drafted AS A
             DIFF at /retro; 🧍 human approves — skills are code)
      → HOOK harness/hooks/ deterministic check (must-be-enforced tier)
```

- **Adding a brand-new skill after an epic:** follow
  `harness/skills/skill-authoring/SKILL.md` — create the folder, wire it into
  the role cards' `skills:` lists + the workflow step that uses it, update
  the §2 table here, PR with human approval. A skill that isn't wired into
  a role or workflow doesn't exist.
- **Changing the constitution (AGENTS.md):** ADR + human approval, always.
- **Inherited lessons:** `lessons/auth.md` + `lessons/process.md` ship
  pre-seeded from a previous project run (marked as such) — their L-ids are
  cited throughout qa-pr-review / security-review / tdd-workflow.

## 11. How this compares to the market (positioning, July 2026)

| Capability | GitHub Spec Kit | BMAD-Method | Anthropic long-running-harness guidance | **This harness** |
|---|---|---|---|---|
| Spec-first pipeline | ✅ specify→plan→tasks→implement | ✅ PRD→architecture→stories | — (assumes spec exists) | ✅ BRD→SRS→epics→tasks (EARS) |
| Role-based multi-agent | – (single assistant) | ✅ 12+ roles | – | ✅ 10 roles, least-privilege MCP |
| Cross-PLATFORM portability | ✅ 30+ tools (templates) | partial | – | ✅ AGENTS.md + adapters + freeze/resume packets |
| Progress artifact for fresh context | tasks.md | stories | progress file + feature list + git | ✅ task §12 live checklist + tracker + packet |
| Independent AI review gate | – | QA agent | verify with browser tools | ✅ peer (different MODEL) + QA gate + human gate |
| Cost/token accounting | – | – | – | ✅ runs/ + metrics.csv + dashboard + budgets |
| Self-improvement loop | – | – | – | ✅ retro ladder lesson→rule→hook |
| Rate-limit resilience | – | – | compaction + artifacts | ✅ freeze packets + platform fallback |

Takeaway: this harness already covers the union of Spec Kit's pipeline and
BMAD's role system, and implements Anthropic's long-running-agent patterns
(re-anchor ritual, structured progress artifacts, e2e verification) with two
additions the market lacks: cross-model peer review and cost accounting.
The price is ceremony (§7.1) — by design.

## 12. Production-readiness checklist & known gaps

Green before first feature epic:
- [ ] git hooks installed (`make hooks`) and `development` branch exists
- [ ] `.claude/skills` symlink (Claude Code) · statusline wired to
      `harness/hooks/statusline-ratelimit.sh`
- [ ] `.env` with MCP secrets (never committed); `/mcp` shows required
      servers healthy — degraded fallbacks per skills/mcp-connections
- [ ] Figma URL pasted into `docs/design/README.md`
- [ ] `spec/srs.md` approved; `make validate` green
- [ ] E00 exit gate: ADRs accepted, CI green, walking skeleton seen live
- [ ] Branch protection on `main` + `development` (PR + CI required)

Known gaps (accepted for now — revisit at retro):
1. **Frontmatter is trusted, not enforced.** No hook validates status
   transitions or `reviewed_by ≠ executed_by`; review gates catch it. A
   pre-commit frontmatter linter is the natural next hook promotion.
2. **No background daemon.** Freeze/resume and cross-platform dispatch are
   human/orchestrator-triggered by design (§7.7).
3. **CI is genesis-scoped.** Until E00 lands, `make test`/`make lint` don't
   exist; the QA gate is manual-run until then.
4. **Scheduler anti-collision needs the optional frontmatter `files:`
   mirror** on parallel-risk tasks — sharding discipline, not tooling,
   keeps it true (skills/task-sharding §4).
