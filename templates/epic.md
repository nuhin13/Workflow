# EP-## — <Epic title>

- Traces from: FT-### (features), SCR-### (screens), ADR-### (constraints)
- Depends on: EP-##
- Status: specced | building | qa | checkpoint | done
- QA report: `qa/EP-##-report.md` · Checkpoint: `checkpoint.md`

## 1. Runnable flow
When this epic is done, a human can: "…step-by-step user actions…". This sentence is what
QA and the checkpoint verify first.

## 2. Scope
- In: FT-### …
- Out (explicitly not this epic): …

## 3. Flow design
```mermaid
sequenceDiagram
  %% the end-to-end flow this epic delivers
```
Screens touched: SCR-### … · Data touched: … · New patterns introduced: none unless listed
here with justification (new patterns must be added to conventions.md at checkpoint).

## 4. Task breakdown
Tasks are sized so one agent can complete one task within one focused session, delivering
committed, working code. Parallel lanes share no files; conflicts on shared files are
sequenced, not merged.

| ID | Task | Spec | Depends on | Parallel lane | Status |
|---|---|---|---|---|---|
| T-##.01 | | tasks/T-##.01.md | — | A | pending |

## 5. Integration task
The last task is always integration: wire the pieces, run the full flow, update the
prototype/screens if reality diverged (or file D-###), demo script for the checkpoint.

## 6. Open questions
| ID | Question | Blocks | Status |
|---|---|---|---|

## 7. Epic checklist (before requesting /qa)
- [ ] Runnable flow works from a clean start, exactly as §1 states
- [ ] All task checklists complete; all task test cases pass
- [ ] Traceability matrix rows for this epic updated
- [ ] No convention violations introduced (lint + self-review against conventions.md)
- [ ] Lessons captured (LSN-###) if anything surprised us

## Handoff
