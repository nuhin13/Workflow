# Claude Code adapter

@AGENTS.md

Claude Code specifics for this repo:

- Agent role definitions live in `agent/agents/` (also mirrored as subagents if
  you copy them to `.claude/agents/`). Skills live in `agent/skills/` (copy or
  symlink to `.claude/skills/` to make them natively discoverable):
  `ln -s ../agent/skills .claude/skills`
- Run headless tasks via `agent/adapters/run-claude.sh <task-id> "<prompt>"`
  so cost + session JSON are captured into `runs/` and `metrics.csv`.
- Settings this repo expects (see `agent/hooks/`):
  - `"includeCoAuthoredBy": false` (or `"attribution": {"commit": "", "pr": ""}`)
  - statusLine wired to `agent/hooks/statusline-ratelimit.sh` for rate-limit
    freeze detection (5-hour and weekly windows).
- MCP servers for this project are declared in `.mcp.json` (project scope).
