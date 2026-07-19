# Agentic Delivery Harness — platform-agnostic project template

A **reusable skeleton** for building products with a spec-driven, multi-agent,
human-in-the-loop agentic harness. This repo is not a product; it is the
machine that builds products. Use it as a template: clone (or branch) per
project, run `/kickoff`, and drive an idea from BRD to shipped code.

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

## Starting a new project from this template

```bash
# 1. New repo (or branch) from this skeleton
pip install -r requirements.txt   # pyyaml (scheduler)
make hooks                        # git hooks: co-author strip, branch protection
git branch development main      # integration branch

# 2. If you already have a BRD / Figma design / SRS, drop them in:
#      BRD  → docs/business/BRD.md      (or let /brd interview you)
#      UI   → paste Figma URL into docs/design/README.md
#      SRS  → spec/srs.md               (or let srs-authoring draft it)

# 3. Kick off the pipeline (Claude Code shown; any platform works)
#      /kickoff "<your product idea>"   → /brd → /prd → /features → …
```

Daily driving: `make status` · `make next` · `make review` — details in
[`docs/HUMAN-GUIDE.md`](docs/HUMAN-GUIDE.md).

## Pipeline checklist (per project)

- [ ] `/kickoff` — idea captured, state initialized
- [ ] BRD (`/brd`) + human approval
- [ ] PRD + feature list + forecast (`/prd`, `/features`, `/forecast`)
- [ ] Design system + screen specs (`/design`; Figma is law when linked)
- [ ] Traceability matrix live (`/trace`)
- [ ] Tech plan + ADRs — stack/architecture are HUMAN decisions (`/tech-plan`)
- [ ] `spec/srs.md` (EARS) + human approval
- [ ] Dev plan + epic map (`/dev-plan`) + human approval
- [ ] Epic 00 genesis: walking skeleton (`/build`, `/qa`, `/checkpoint`)
- [ ] Feature waves
