# QA Report — <EP-## or T-##.##>

- QA agent run: YYYY-MM-DD · Fresh context: yes (required)
- Inputs: task/epic spec(s), acceptance criteria, repo at commit `<sha>`
- Explicitly NOT consulted before verdicts: builder completion reports, builder reasoning

## Verdict
**PASS / FAIL / PASS-WITH-NOTES** (fail = any AC unmet, any test case failing, any
convention violation of severity ≥ medium, or runnable flow broken)

## 1. Runnable flow check (epics)
Executed the epic's §1 flow from a clean start, step by step. Result per step:
| Step | Expected | Observed | ✓/✗ |
|---|---|---|---|

## 2. Acceptance criteria
| AC | Method (ran test / manual exercise / read code) | Result | Evidence |
|---|---|---|---|

## 3. Test suite
Commands run and full result summary (paste real output, including counts).

## 4. Spec compliance
- File plan respected? Out-of-plan changes found: …
- §6 prohibitions respected? …
- Conventions (conventions.md) violations: none / list with file:line

## 5. Traceability
Matrix rows correct for this work? Discrepancies filed: D-### / none

## 6. Findings
| # | Severity (blocker/major/minor/note) | Where | What | Suggested fix |
|---|---|---|---|---|

## 7. Lessons proposed
LSN candidates for `memory/lessons.md`, if any.
