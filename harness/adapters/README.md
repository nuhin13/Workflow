# Platform adapters — one interface, many CLIs

Each adapter: `run-<platform>.sh <TASK_ID> "<prompt>"` →
1. runs the CLI headless, 2. saves the raw result to `workspace/runs/<TASK_ID>/`,
3. stamps tokens+cost into the epic's `metrics.csv` via metrics_collect.py.

⚠️ **Model routing is advisory, not enforced.** No adapter passes a model
flag — each CLI uses its own configured default. A task's `tier:`
(`plan_review|implement|trivial`) and the legacy `model:` field record
INTENT only; `harness.yaml → model_tiers` maps each tier to a per-platform
model so that intent survives a platform switch. To actually bind a model,
export the platform's flag var, e.g.
`HARNESS_CLAUDE_FLAGS='--model opus'` or `HARNESS_CODEX_FLAGS='--model <id>'`.
Note `model: opus` is Claude vocabulary and means nothing to codex/opencode —
that is why `tier:` is the portable field.

⚠️ CLI flags evolve fast. Each script marks the flags to VERIFY against the
tool's current `--help` before first use. Cost capture quality differs:
- claude-code: authoritative `total_cost_usd` in result JSON ✅
- codex: `codex exec --json` emits token_count JSONL events; the collector
  records task tokens, but `cost_usd` is blank unless Codex starts emitting an
  authoritative cost.
- opencode: token fields vary — adapter logs the run; fill tokens from the
  tool's usage view if absent (rows still attribute time/platform).
