# Claude Code adapter

@AGENTS.md

Claude Code specifics for this repo:

- **Skills & subagents are natively discoverable**: `.claude/skills` and
  `.claude/agents` are symlinks to `agent/skills/` and `agent/agents/` (the
  platform-neutral homes). Every skill is a slash command: pipeline drivers
  (`/kickoff /brd /prd /features /forecast /design /trace /tech-plan
  /dev-plan /epic /build /qa /checkpoint /status /question /lesson`) plus
  capability skills (git-flow, ears-authoring, epic-breakdown, tdd-workflow,
  token-optimization, rate-limit-handoff, …).
  On Windows checkouts without symlink support: `git config core.symlinks
  true` before cloning, or copy the two directories.
- **Session start ritual** (constitution rule 15): read `memory/state.yaml`,
  skim `agent/memory/lessons/` for the area you'll touch, announce position
  in one sentence, continue the pipeline (`/status` does this for you).
- Run headless tasks via `agent/adapters/run-claude.sh <task-id> "<prompt>"`
  so cost + session JSON are captured into `runs/` and `metrics.csv`.
- Settings this repo expects (see `agent/hooks/`):
  - `"includeCoAuthoredBy": false` (or `"attribution": {"commit": "", "pr": ""}`)
  - statusLine wired to `agent/hooks/statusline-ratelimit.sh` for rate-limit
    freeze detection (5-hour and weekly windows).
- MCP servers for this project are declared in `.mcp.json` (project scope).

Other platforms (Codex CLI, OpenCode, Cursor) read `AGENTS.md` natively and
reach the same skills by path; adapter scripts live in `agent/adapters/`,
example configs in `agent/mcp/`.
