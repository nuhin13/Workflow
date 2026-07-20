# /analyze E<NN>  (agent: team-lead, fresh context preferred)
"Unit tests for English" — consistency gate before implementation.
1. Every task ↔ EARS trace: each task lists ≥1 EARS id; every epic EARS id
   is covered by ≥1 task. Orphans either way = fail.
2. Contract sanity: pagination on every list, uniform error envelope,
   naming/casing per genesis, no two tasks defining the same endpoint
   differently.
3. files: collision matrix across parallelizable tasks = empty.
4. dont-sections present; MoSCoW inflation check (>60% must → re-grade).
5. Estimates: any L-tier task → justify or split.
Output: ANALYZE REPORT (pass/fail per check) appended to epic.md.
🧍 HUMAN GATE: human skims the report; approval unlocks dispatch.
