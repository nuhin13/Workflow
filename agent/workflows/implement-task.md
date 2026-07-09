# /implement-task E<NN>-T<MM>  (agent: developer-*; dispatched by orchestrator)
1. Orchestrator: `make next` picked this task; status → in-progress in
   tracker; stamp `started_at`/`executed_by`; platform window checked
   (rate-limit-handoff thresholds).
2. Developer: read task file + area lessons + Graphiti pull (2 queries).
3. Branch+worktree per skills/git-flow. 4. TDD per skills/tdd-workflow.
5. Implement within §5 Files / §8 Functions; tick §12 checklist AS YOU GO
   with short commit hashes (protocol §3b); token-optimization throughout.
6. §15 self-review passes → status → review-requested → push → PR to the
   epic branch → 📋 DEV STATUS block.
7. Orchestrator routes PEER review to a DIFFERENT agent/model (protocol §2),
   then /qa-review; metrics_collect.py stamps the run.
Blocked → §18 + Open Questions, status → blocked, hand back. Small ambiguity
→ simplest interpretation + note in §15 Deviations (don't stall).
