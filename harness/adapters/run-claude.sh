#!/usr/bin/env bash
# Task: run-claude.sh E03-T07 "<prompt>"
# Role: run-claude.sh phase-design "<prompt>" designer
set -euo pipefail
RUN_ID="${1:?task id or run id}"; PROMPT="${2:?prompt}"; ROLE="${3:-}"
if [[ ! "$RUN_ID" =~ ^[A-Za-z0-9][A-Za-z0-9._-]*$ ]]; then
  echo "harness: run id must contain only letters, numbers, dot, underscore, or hyphen" >&2
  exit 2
fi
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$ROOT"
RUNS_DIR="$(python3 harness/orchestrator/paths.py runs)"
TS=$(date -u +%Y%m%dT%H%M%SZ); BASE="$RUNS_DIR/$RUN_ID/$TS-claude"; OUT="$BASE.json"
POLICY="$BASE-policy.json"; MCP_CONFIG="$BASE-mcp.json"; mkdir -p "$RUNS_DIR/$RUN_ID"
POLICY_ARGS=(--platform claude-code --mcp-out "$MCP_CONFIG")
if [[ -n "$ROLE" ]]; then POLICY_ARGS+=(--role "$ROLE"); else POLICY_ARGS+=(--task "$RUN_ID"); fi
python3 harness/orchestrator/dispatch_policy.py "${POLICY_ARGS[@]}" > "$POLICY"
MODEL="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["model"])' "$POLICY")"
case " ${HARNESS_CLAUDE_FLAGS:-} " in
  *" --model "*|*"--model="*|*" --mcp-config "*|*"--mcp-config="*|*" --strict-mcp-config "*)
    echo "harness: HARNESS_CLAUDE_FLAGS may not override model or MCP policy" >&2
    exit 2
    ;;
esac
# VERIFY flags: `claude --help`. Permission mode is conservative by default;
# export HARNESS_CLAUDE_FLAGS='--permission-mode acceptEdits' to loosen.
set +e
"${HARNESS_CLAUDE_BIN:-claude}" ${HARNESS_CLAUDE_FLAGS:-} \
  --model "$MODEL" --strict-mcp-config --mcp-config "$MCP_CONFIG" \
  -p "$PROMPT" --output-format json | tee "$OUT" >/dev/null
CLI_STATUS=${PIPESTATUS[0]}
set -e
if [[ -z "$ROLE" ]]; then
  set +e
  python3 harness/orchestrator/metrics_collect.py --task "$RUN_ID" \
    --platform claude-code --model "$MODEL" --result "$OUT" --exit-code "$CLI_STATUS"
  METRICS_STATUS=$?
  set -e
  if (( METRICS_STATUS != 0 )); then
    echo "harness: warning: metrics collection failed with status $METRICS_STATUS" >&2
  fi
fi
echo "harness: run saved → $OUT"
exit "$CLI_STATUS"
