# T-##.## — <Task title>

- Epic: EP-## · Traces from: FT-### / FR-### / SCR-### / ADR-###
- Depends on: T-##.## · Parallel lane: <A/B/…>
- Status: pending | building | blocked (Q-###) | built | qa-passed | qa-failed
- Estimated size: S / M (L tasks must be split)

> THIS SPEC IS THE PROMPT. A builder agent receives this file and the repo — nothing else.
> If anything below is ambiguous or missing, the spec is defective: fix the spec via the
> planner, do not improvise in code.

## 1. Objective
One sentence: the capability that exists after this task that didn't before.

## 2. Context the builder needs
- Why this task exists (link to feature/flow)
- What already exists that this builds on (files, functions — exact paths)
- Read first: `project/05-epics/EP-00-skeleton/conventions.md` §… , relevant LSN-###

## 3. What to do
Ordered steps. Concrete, not vague — name functions, routes, tables, components.
1. …
2. …

## 4. Where — file plan
| Action | Path | Follows pattern of |
|---|---|---|
| create | src/… | src/…(existing example file) |
| modify | src/… | keep public API stable |
| create | tests/… | tests/…(existing example) |

No files outside this plan without noting it in the completion report with justification.

## 5. How — patterns to apply
- Pattern/idiom for this kind of code (cite conventions.md section, show 3–10 line example)
- Naming for the new identifiers this task introduces
- Error handling & validation specifics for these inputs
- Design tokens/components to use (UI tasks — no hardcoded styles)

## 6. What NOT to do
- Do not touch: <paths owned by parallel tasks>
- Do not introduce: <libs/patterns considered and rejected — cite ADR-###>
- Do not "improve" unrelated code; file a note instead
- Do not weaken/skip existing tests to get green

## 7. Acceptance criteria
Given/When/Then, each independently checkable by QA:
- AC1: Given … When … Then …

## 8. Test cases
| ID | Type (unit/integration/e2e) | Case | Expected |
|---|---|---|---|
| TC-##.##.1 | | | |
Include at least one failure-path case. Tests are written IN this task, not deferred.

## 9. Checklist (builder ticks in the completion report)
- [ ] All steps in §3 done; only files in §4 touched (or deviation noted)
- [ ] Conventions & patterns followed (§5), prohibitions respected (§6)
- [ ] All test cases implemented and passing; lint clean; app still boots
- [ ] Committed with message `EP-##/T-##.##: <summary>`
- [ ] Traceability row updated · state.yaml task status updated
- [ ] Completion report appended below

## 10. Open questions
| ID | Question | Blocks this task? | Status |
|---|---|---|---|
Blocked task ⇒ set status `blocked`, record Q-### in state.yaml blockers, continue other lanes.

---
## Completion report (builder fills; QA reads this LAST, after independent verification)
- What was done / any deviations from §4 and why:
- How to run/verify by hand:
- Follow-ups noted (not fixed):
