#!/usr/bin/env bash
# Claude Code statusLine hook → rate-limit guard.
# Wire in settings.json:
#   "statusLine": {"type":"command","command":"harness/hooks/statusline-ratelimit.sh"}
# Claude Code (>=2.1.x) passes session JSON on stdin incl. a rate_limits
# object (shape varies by version — guard is defensive).
DIR="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$(python3 "$DIR/harness/orchestrator/ratelimit_guard.py" 2>/dev/null)"
CODE=$?
if [ $CODE -eq 2 ]; then
  mkdir -p "$DIR/harness/handoffs"
  date -u +"%Y-%m-%dT%H:%M:%SZ freeze signal" >> "$DIR/harness/handoffs/.FREEZE"
fi
echo "${OUT:-harness | window: n/a}"
exit 0
