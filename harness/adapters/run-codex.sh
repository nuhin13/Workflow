#!/usr/bin/env bash
# Task: run-codex.sh E03-T07 "<prompt>"
# Role: run-codex.sh phase-tech-plan "<prompt>" architect
set -euo pipefail
RUN_ID="${1:?task id or run id}"; PROMPT="${2:?prompt}"; ROLE="${3:-}"
if [[ ! "$RUN_ID" =~ ^[A-Za-z0-9][A-Za-z0-9._-]*$ ]]; then
  echo "harness: run id must contain only letters, numbers, dot, underscore, or hyphen" >&2
  exit 2
fi
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$ROOT"
RUNS_DIR="$(python3 harness/orchestrator/paths.py runs)"
TS=$(date -u +%Y%m%dT%H%M%SZ); BASE="$RUNS_DIR/$RUN_ID/$TS-codex"; OUT="$BASE.jsonl"
POLICY="$BASE-policy.json"; MCP_ARGS_FILE="$BASE-mcp.args"; mkdir -p "$RUNS_DIR/$RUN_ID"
POLICY_ARGS=(--platform codex --mcp-out "$MCP_ARGS_FILE")
if [[ -n "$ROLE" ]]; then POLICY_ARGS+=(--role "$ROLE"); else POLICY_ARGS+=(--task "$RUN_ID"); fi
python3 harness/orchestrator/dispatch_policy.py "${POLICY_ARGS[@]}" > "$POLICY"
MODEL="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["model"])' "$POLICY")"
case " ${HARNESS_CODEX_FLAGS:-} " in
  *" --model "*|*"--model="*|*" -m "*|*" --profile "*|*"--profile="*|*" -p "*|*"mcp_servers."*)
    echo "harness: HARNESS_CODEX_FLAGS may not override model, profile, or MCP policy" >&2
    exit 2
    ;;
esac
CODEX_MCP_ARGS=()
while IFS= read -r arg; do CODEX_MCP_ARGS+=("$arg"); done < "$MCP_ARGS_FILE"
# VERIFY flags: `codex exec --help` (sandbox/model flags evolve).
set +e
"${HARNESS_CODEX_BIN:-codex}" exec ${HARNESS_CODEX_FLAGS:-} \
  --ignore-user-config --strict-config \
  --model "$MODEL" "${CODEX_MCP_ARGS[@]}" --json \
  "$PROMPT" 2>&1 | tee "$OUT" >/dev/null
CLI_STATUS=${PIPESTATUS[0]}
set -e
if [[ -z "$ROLE" ]]; then
  set +e
  python3 harness/orchestrator/metrics_collect.py --task "$RUN_ID" \
    --platform codex --model "$MODEL" --result "$OUT" --exit-code "$CLI_STATUS"
  METRICS_STATUS=$?
  set -e
  if (( METRICS_STATUS != 0 )); then
    echo "harness: warning: metrics collection failed with status $METRICS_STATUS" >&2
  fi
fi
echo "harness: run saved → $OUT"
exit "$CLI_STATUS"
