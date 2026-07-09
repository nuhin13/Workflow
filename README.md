# Ticketing System — agentic harness workshop project

An embeddable, SDK-style help-desk ticketing system (BRD:
`docs/business/BRD.md`) built end-to-end by a spec-driven, multi-agent,
human-in-the-loop agentic harness.

## Start here

| You are | Read |
|---|---|
| New to the harness | [`docs/harness-guide.md`](docs/harness-guide.md) — how everything works, benefits, limitations |
| The human operator | [`docs/HUMAN-GUIDE.md`](docs/HUMAN-GUIDE.md) — your gates + 3 daily commands |
| An agent (any platform) | [`AGENTS.md`](AGENTS.md) — the constitution (13 rules) |

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
- [ ] Figma URL pasted into `docs/design/README.md`
- [ ] `spec/srs.md` drafted from BRD (PM agent) + human-approved
- [ ] Epic map (`/epic-breakdown`) + human-approved
- [ ] Epic 00 genesis: stack/architecture ADRs (HUMAN decides) + walking skeleton
- [ ] Feature waves
