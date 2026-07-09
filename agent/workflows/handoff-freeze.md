# /handoff-freeze  (agent: orchestrator; trigger: ratelimit_guard exit 2 or human)
1. Signal current developer(s): finish the current edit, no new sub-goals.
2. WIP-commit task branch(es): `wip(E..-T..): freeze for handoff`.
3. Write packet(s) from agent/handoffs/_template.handoff.yaml — next_step
   and last_test_status are MANDATORY; save `git diff origin/epic_<NN>` beside.
4. Record native session ids; stamp partial metrics.
5. Slack HANDOFF notice (reason, window reset ETA, resume platform).
6. Mark tasks status → frozen in tracker.
