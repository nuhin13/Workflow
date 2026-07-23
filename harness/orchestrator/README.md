# harness/orchestrator/ — deterministic scripts

**Why this exists.** Some jobs must never be creative: picking the next
task, validating rules, counting money. These are plain Python — same
input, same output, no LLM.

**How it works** (all via Makefile targets):

| Script | Target | Job |
|---|---|---|
| `scheduler.py` | `make next/status/review/validate` | task DAG, statuses, pick order, WIP + file-collision guard |
| `validate_harness.py` | `make validate` | constitution checks: IDs, frontmatter, peer rule, write scopes, dead paths |
| `metrics_collect.py` | (adapters call it) | append run usage to `workspace/epics/*/metrics.csv` |
| `metrics_report.py` | `make metrics` | cost per task/epic + budget warnings |
| `dashboard_build.py` | `make dashboard` | the PM console (one static HTML) |
| `ratelimit_guard.py` | statusline/hooks | freeze at the rate-limit threshold |

**What it does NOT cover.** Dispatching agents (platforms do that via
`harness/adapters/`) and business judgment (human gates). If a check can
be fooled by prose, it does not belong here — it belongs in QA.
