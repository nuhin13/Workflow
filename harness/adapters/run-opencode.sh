#!/usr/bin/env bash
# Usage: run-opencode.sh E03-T07 "Follow harness/workflows/implement-task.md for E03-T07"
set -euo pipefail
TASK="${1:?task id}"; PROMPT="${2:?prompt}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$ROOT"
RUNS_DIR="$(python3 harness/orchestrator/paths.py runs)"
TS=$(date -u +%Y%m%dT%H%M%SZ); OUT="$RUNS_DIR/$TASK/$TS-opencode.log"; mkdir -p "$RUNS_DIR/$TASK"
# VERIFY: `opencode run --help` (output/format flags evolve).
opencode run "$PROMPT" ${HARNESS_OPENCODE_FLAGS:-} 2>&1 | tee "$OUT" >/dev/null
python3 harness/orchestrator/metrics_collect.py --task "$TASK" --platform opencode --result "$OUT" --no-cost
echo "harness: run saved → $OUT"
