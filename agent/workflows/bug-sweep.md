# /bug-sweep E<NN>  (agent: qa) — runs when all epic tasks are done
1. End-to-end pass of the epic against its EARS set: API flows (real calls),
   UI flows (playwright vs ui refs), cross-task seams (the gaps between
   task-level tests).
2. Each defect → bug task per skills/bug-triage (repro, expected/actual,
   severity, proposed priority). Ids E<NN>-B<nn>.
3. 🧍 HUMAN GATE: human confirms/overrides priorities (severity stays QA's).
4. P1/P2 bugs feed back into the scheduler before the epic→dev PR;
   P3/P4 logged to backlog. Epic→dev PR opens only when P1/P2 = 0.
