# harness/ — the harness engine

**Why this exists.** The machine that builds the product must live apart
from the product. Everything in here is reusable across projects;
nothing in here is product code.

**How it works.** Each subfolder is one organ, and each has its own
README (why · how · what it does not cover):

| Folder | Organ |
|---|---|
| `agents/` | who works — 10 role cards / subagents |
| `skills/` | how to do things — 36 on-demand manuals |
| `workflows/` | step-by-step processes (handoff, QA, retro…) |
| `orchestrator/` | deterministic scripts: scheduler, validators, metrics, dashboard |
| `adapters/` | run any platform headless, log cost + session |
| `hooks/` | git hooks — the deterministic last line of defense |
| `handoffs/` | rate-limit freeze packets |
| `memory/` | long-term memory: lessons, ADRs, knowledge graph |
| `templates/` | canonical artifact templates, one home (v2 §8) |
| `mcp/` | how to reach external platforms safely |
| `docs/` | human and builder guides for operating the harness |
| `rates/` | model price table for cost estimates |

**What it does NOT cover.** Product artifacts (`workspace/plan/`, `workspace/spec/`,
`workspace/epics/`, `src/`) and pipeline position (`workspace/state.yaml`). Changing
files here follows `harness.yaml: harness_change_policy` — lesson
promotion or skill-authoring, with human approval.
