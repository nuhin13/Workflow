#!/usr/bin/env bash
# Point git at the harness hooks (run once per clone).
set -e
cd "$(dirname "$0")/../.."
chmod +x harness/hooks/githooks/* harness/hooks/*.sh harness/adapters/*.sh 2>/dev/null || true
git config core.hooksPath harness/hooks/githooks
echo "harness: hooks installed (core.hooksPath → harness/hooks/githooks)"
echo "harness: remember Claude Code settings: \"includeCoAuthoredBy\": false"
