#!/usr/bin/env bash
# Task: run-opencode.sh E03-T07 "<prompt>"
# Role: run-opencode.sh phase-design "<prompt>" designer
set -euo pipefail
RUN_ID="${1:?task id or run id}"; PROMPT="${2:?prompt}"; ROLE="${3:-}"
if [[ ! "$RUN_ID" =~ ^[A-Za-z0-9][A-Za-z0-9._-]*$ ]]; then
  echo "harness: run id must contain only letters, numbers, dot, underscore, or hyphen" >&2
  exit 2
fi
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$ROOT"
RUNS_DIR="$(python3 harness/orchestrator/paths.py runs)"
TS=$(date -u +%Y%m%dT%H%M%SZ); BASE="$RUNS_DIR/$RUN_ID/$TS-opencode"; OUT="$BASE.log"
POLICY="$BASE-policy.json"; MCP_CONFIG="$BASE-mcp.json"; mkdir -p "$RUNS_DIR/$RUN_ID"
POLICY_ARGS=(--platform opencode --mcp-out "$MCP_CONFIG")
if [[ -n "$ROLE" ]]; then POLICY_ARGS+=(--role "$ROLE"); else POLICY_ARGS+=(--task "$RUN_ID"); fi
python3 harness/orchestrator/dispatch_policy.py "${POLICY_ARGS[@]}" > "$POLICY"
MODEL="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["model"])' "$POLICY")"
case " ${HARNESS_OPENCODE_FLAGS:-} " in
  *" --model "*|*"--model="*|*" -m "*)
    echo "harness: HARNESS_OPENCODE_FLAGS may not override model policy" >&2
    exit 2
    ;;
esac
MCP_CONTENT="$(tr -d '\n' < "$MCP_CONFIG")"
# VERIFY: `opencode run --help` (output/format flags evolve).
set +e
OPENCODE_CONFIG_CONTENT="$MCP_CONTENT" "${HARNESS_OPENCODE_BIN:-opencode}" run \
  ${HARNESS_OPENCODE_FLAGS:-} --model "$MODEL" "$PROMPT" 2>&1 | tee "$OUT" >/dev/null
CLI_STATUS=${PIPESTATUS[0]}
set -e
if [[ -z "$ROLE" ]]; then
  set +e
  python3 harness/orchestrator/metrics_collect.py --task "$RUN_ID" \
    --platform opencode --model "$MODEL" --result "$OUT" --no-cost \
    --exit-code "$CLI_STATUS"
  METRICS_STATUS=$?
  set -e
  if (( METRICS_STATUS != 0 )); then
    echo "harness: warning: metrics collection failed with status $METRICS_STATUS" >&2
  fi
fi
echo "harness: run saved → $OUT"
exit "$CLI_STATUS"
