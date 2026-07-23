#!/usr/bin/env bash
# Usage: run-claude.sh E03-T07 "Follow harness/workflows/implement-task.md for E03-T07"
set -euo pipefail
TASK="${1:?task id}"; PROMPT="${2:?prompt}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$ROOT"
RUNS_DIR="$(python3 harness/orchestrator/paths.py runs)"
TS=$(date -u +%Y%m%dT%H%M%SZ); OUT="$RUNS_DIR/$TASK/$TS-claude.json"; mkdir -p "$RUNS_DIR/$TASK"
# VERIFY flags: `claude --help`. Permission mode is conservative by default;
# export HARNESS_CLAUDE_FLAGS='--permission-mode acceptEdits' to loosen.
claude -p "$PROMPT" --output-format json ${HARNESS_CLAUDE_FLAGS:-} | tee "$OUT" >/dev/null
python3 harness/orchestrator/metrics_collect.py --task "$TASK" --platform claude-code --result "$OUT"
echo "harness: run saved → $OUT"
