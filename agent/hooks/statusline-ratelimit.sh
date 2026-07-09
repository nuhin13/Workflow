#!/usr/bin/env bash
# Claude Code statusLine hook → rate-limit guard.
# Wire in settings.json:
#   "statusLine": {"type":"command","command":"agent/hooks/statusline-ratelimit.sh"}
# Claude Code (>=2.1.x) passes session JSON on stdin incl. a rate_limits
# object (shape varies by version — guard is defensive).
DIR="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$(python3 "$DIR/agent/orchestrator/ratelimit_guard.py" 2>/dev/null)"
CODE=$?
if [ $CODE -eq 2 ]; then
  mkdir -p "$DIR/agent/handoffs"
  date -u +"%Y-%m-%dT%H:%M:%SZ freeze signal" >> "$DIR/agent/handoffs/.FREEZE"
fi
echo "${OUT:-harness | window: n/a}"
exit 0
