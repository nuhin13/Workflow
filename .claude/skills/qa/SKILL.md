---
name: qa
description: Run the independent QA agent against a task or epic — fresh context, spec + repo only, no builder reasoning; produces a PASS/FAIL QA report; failures route back through the planner. Usage - /qa EP-## | /qa T-##.##
---

# /qa — independent verification

Argument: `EP-##` or `T-##.##` (default: current epic if all tasks `built`).

1. **Isolation is the point.** Dispatch the **qa** agent in a fresh context with ONLY: the
   spec path(s), conventions.md path, matrix path, repo. Do NOT pass builder transcripts,
   this session's reasoning, or completion reports (the agent reads those last, itself).
2. The qa agent follows its protocol (run the flow → test the tests → audit vs spec →
   trace) and writes `project/05-epics/EP-##/qa/<id>-report.md`.
3. **On PASS / PASS-WITH-NOTES:** status → `qa-passed`; minor findings become tracked notes
   (follow-ups in the epic or Q-###/D-###). Epic-level pass → proceed to `/checkpoint`.
4. **On FAIL:** status → `qa-failed`. Route findings to the **planner**: spec defect →
   spec revised then rebuilt; implementation defect → same builder gets the report's
   findings as a fix list (spec unchanged). Rebuild → re-QA with a FRESH qa run. Two
   consecutive FAILs on the same task → stop, escalate to human with both reports.
5. Always: proposed LSN-### lessons get appended via `/lesson`; state.yaml + history
   updated; commit `qa: <id> <verdict>`.
