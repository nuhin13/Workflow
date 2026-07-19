# Ticketing System — platform-agnostic agentic delivery harness

An embeddable, SDK-style help-desk ticketing system (BRD:
`docs/business/BRD.md`, UI canon: Figma via `docs/design/README.md`) built
end-to-end by a spec-driven, multi-agent, human-in-the-loop agentic harness.

The harness is **platform-agnostic**: Claude Code, Codex CLI, OpenCode and
Cursor all drive the same constitution (`AGENTS.md`), the same skills
(`agent/skills/`), and the same work queue (`epics/`), with rate-limit
handoff between platforms (`agent/adapters/`, `harness.yaml`).

## Two layers, one pipeline

```
Phase 0 business   /kickoff /brd /prd /features /forecast → docs/business/BRD.md · project/00-business/
Phase 1 design     /design                                → project/01-design/ (Figma is law when linked)
Phase 2 trace      /trace                                 → project/02-traceability/matrix.md
Phase 3 tech plan  /tech-plan                             → project/03-technical/ · ADRs in agent/memory/decisions/
Phase 4 dev plan   /dev-plan /epic                        → project/04-plan/ · spec/srs.md · epics/E<NN>/
Phase 5 build loop /build → /qa → /checkpoint (per epic)  → QA-gated PRs → development → main
```

The **pipeline layer** (phases 0–4) turns an idea into template-shaped,
traceable specs. The **execution layer** (phase 5) is the industrial engine:
scheduler, lanes, worktree-per-task, peer review + QA gates, metrics, cost
budgets, cross-platform rate-limit handoff.

## Start here

| You are | Read |
|---|---|
| New to the harness | [`docs/harness-guide.md`](docs/harness-guide.md) — how everything works, benefits, limitations |
| The human operator | [`docs/HUMAN-GUIDE.md`](docs/HUMAN-GUIDE.md) — your gates + 3 daily commands |
| An agent (any platform) | [`AGENTS.md`](AGENTS.md) — the constitution (16 rules) |
| Resuming a session | `memory/state.yaml`, then `/status` |

## Quick start

```bash
pip install -r requirements.txt   # pyyaml (scheduler)
make hooks                        # git hooks: co-author strip, branch protection
make validate                     # DAG sanity
make status                       # progress board
make next                         # what runs now
```

## Project state

- [x] BRD v0.2 (`docs/business/BRD.md`)
- [x] Figma URL linked in `docs/design/README.md` (UI is law)
- [ ] PRD + feature list + forecast (`/prd`, `/features`, `/forecast`)
- [ ] `spec/srs.md` drafted from BRD/PRD (PM agent) + human-approved
- [ ] Design system + screen specs derived from Figma (`/design`, `/trace`)
- [ ] Tech plan + ADRs — stack/architecture are HUMAN decisions (`/tech-plan`)
- [ ] Dev plan + epic map (`/dev-plan`) + human-approved
- [ ] Epic 00 genesis: walking skeleton (`/build`, `/qa`, `/checkpoint`)
- [ ] Feature waves
