---
name: qa
description: Run the independent QA agent against a task or epic — fresh context, spec + repo only, no implementer reasoning; produces a PASS/FAIL QA report; failures route back through the team-lead. Usage - /qa E<NN> | /qa E<NN>-T<MM>
---

# /qa — independent verification

Argument: `E<NN>` or `E<NN>-T<MM>` (default: current epic if all tasks are
peer-approved). The EPIC gate is mandatory before epic→development (rule 3);
task-level QA is on-demand — required for high-risk tasks.

1. **Isolation is the point.** Dispatch the **qa** agent in a fresh context with ONLY: the
   spec path(s), conventions.md path, matrix path, repo. Do NOT pass implementer transcripts,
   this session's reasoning, or completion reports (the agent reads those last, itself).
2. The qa agent follows its protocol (run the flow → test the tests → audit vs spec →
   trace) and writes `epics/E<NN>/qa/<id>-report.md`.
3. **On PASS / PASS-WITH-NOTES:** status → `done`; minor findings become tracked notes
   (follow-ups in the epic or Q-###/D-###). Epic-level pass → proceed to `/checkpoint`.
4. **On FAIL:** status → `changes-requested`. Route findings to the **team-lead**: spec defect →
   spec revised then rebuilt; implementation defect → same implementer gets the report's
   findings as a fix list (spec unchanged). Rebuild → re-QA with a FRESH qa run. Two
   consecutive FAILs on the same task → stop, escalate to human with both reports.
5. Always: proposed L-<area>-### lessons get appended via `/lesson`; state.yaml + history
   updated; commit `qa: <id> <verdict>`.
