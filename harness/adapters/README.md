# Platform adapters — one interface, many CLIs

Task mode: `run-<platform>.sh <TASK_ID> "<prompt>"`.
Pipeline-role mode: `run-<platform>.sh <RUN_ID> "<prompt>" <role>` (for
example, `run-claude.sh phase-design "/design" designer`). Each mode:
1. runs the CLI headless, 2. saves the raw result to `workspace/runs/<TASK_ID>/`,
3. resolves the portable tier to an explicit platform model and generates a
   role-filtered MCP config;
4. in task mode, stamps tokens, cost, and CLI exit code into the epic's
   `metrics.csv` even when the CLI run fails. Role-mode phase runs keep their
   audit files under `workspace/runs/<RUN_ID>/` without an epic metrics row.

**Routing and MCP scope are enforced.** A task carries only `tier:
deep|build|cheap`. Before launch, `dispatch_policy.py` resolves that tier
through `harness.yaml: model_tiers`, passes the resulting model explicitly,
and generates MCP configuration from the owner role's `mcp:` allowlist. An
unset model mapping or unknown MCP server stops the run. The policy and
generated MCP config are stored beside the raw result for audit.

CLI flags evolve fast. Each script marks the flags to VERIFY against the
tool's current `--help` before first use. Cost capture quality differs:
- claude-code: authoritative `total_cost_usd` in result JSON ✅
- codex: `codex exec --json` emits token_count JSONL events; the collector
  records task tokens, but `cost_usd` is blank unless Codex starts emitting an
  authoritative cost.
- opencode: token fields vary — adapter logs the run; fill tokens from the
  tool's usage view if absent (rows still attribute time/platform).
