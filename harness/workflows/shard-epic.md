# /shard-epic E<NN>  (agent: team-lead)
1. Precondition: epic approved; Epic 00 done (unless this IS E00).
2. Apply skills/task-sharding: full task files from the template — files,
   api_contracts, functions, do/dont, estimates, model, depends, EARS, DoD.
3. Anti-collision pass (no two parallel tasks share files).
4. Write/refresh tracker.md (state machine + mermaid DAG).
5. `python3 harness/orchestrator/scheduler.py --validate` (no cycles).
6. Hand to /analyze. Tasks are NOT dispatchable before /analyze passes.
