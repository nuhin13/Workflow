# /release  (agents: devops + orchestrator; gate: human)
1. Preconditions: target epics merged to development (each: bug-sweep P1/P2 clear,
   retro done, epic-<n>-done tag exists); CI green on dev.
2. Open dev→main PR with a change summary (epics, EARS satisfied, known
   P3/P4). 🧍 HUMAN GATE: release approval.
3. Merge → annotated tag vX.Y.Z → deploy → smoke checks (walking-skeleton
   path at minimum).
4. Failure → skills/rollback (redeploy previous tag FIRST), incident task,
   retro. Success → dashboard rebuild + Slack notice.
