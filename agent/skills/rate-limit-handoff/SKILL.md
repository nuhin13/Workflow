---
name: rate-limit-handoff
description: Detect approaching subscription rate-limits (Claude 5h/weekly windows, Codex credits) and hand work to the next platform losslessly via a handoff packet. Use when usage warnings appear, before long runs, when /usage shows >70%, or when planning around quota resets.
---
# Rate-Limit Handoff (detect → freeze → resume)

Trigger on PLAN limits (5-hour rolling + weekly windows), not API budget.

## Detect (before exhaustion)
- Claude Code: statusline JSON exposes `rate_limits` (five_hour, seven_day) —
  wired via `agent/hooks/statusline-ratelimit.sh`; also `/usage` and
  `npx ccusage@latest` (reads local session JSONL). 
- Codex: `/status` for session usage; credits/reset live in the account
  dashboard (no reliable in-CLI countdown — be conservative).
- Freeze threshold: **80% of the 5h window**, or weekly headroom < the next
  task's token_estimate. Helper:
  `python3 agent/orchestrator/ratelimit_guard.py` (reads statusline JSON on
  stdin, exits 2 when freeze is due).

## Freeze (orchestrator runs workflows/handoff-freeze.md)
1. WIP-commit the task branch: `wip(E03-T07): freeze for handoff` (hooks
   allow `wip` only on task branches).
2. Write the packet from `agent/handoffs/_template.handoff.yaml` →
   `agent/handoffs/E03-T07.yaml` + save `git diff origin/epic_03` alongside.
3. Record native session id (Claude JSONL path / Codex session) for forensics.
4. Post `HANDOFF` notice (Slack MCP) with reason + resume ETA.

## Resume (next platform in harness.yaml: platforms)
1. New agent reads ONLY: the handoff packet, the task file, AGENTS.md —
   **the packet, not chat history, is the unit of transfer.**
2. `git worktree add` the SAME task branch; verify `last_commit` matches.
3. Execute `next_step` literally; re-run the failing tests named in
   `last_test_status` first.
4. On completion, normal PR flow; delete the packet only after merge.

## Rules
- Never start a task with < its estimate of headroom — schedule a smaller one
  (scheduler picks by estimate when window is tight).
- A packet missing `next_step` or `last_test_status` is invalid — fix at
  freeze time, not resume time.
