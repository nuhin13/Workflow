# Traceability Matrix — <Project Name>

- Maintained by `/trace`; updated in the SAME commit as any artifact change.
- Last verified: YYYY-MM-DD (run `/trace` to re-verify)

## 1. Requirement → delivery chain
One row per product requirement. `—` means intentionally none; blank means MISSING (a gap
`/trace` must flag).

| BR | FR | FT (feature) | SCR (screens) | EP / Tasks | Tests | Status | Notes |
|---|---|---|---|---|---|---|---|
| BR-010 | FR-001 | FT-001 | SCR-001, SCR-002 | E01 / T-01.01 | TC-01.01.1 | in-build | |

Status: planned | designed | in-build | done | verified | shipped | drifted (has D-###)

## 2. Reverse checks (run by /trace)
- Every FT maps to ≥1 FR, and every MVP FR maps to ≥1 FT
- Every SCR is referenced by ≥1 FT; every FT with UI has ≥1 SCR
- Every epic task traces to ≥1 FT or to E00 (skeleton)
- Orphans found go to §3 as discrepancies

## 3. Discrepancy notes
Full notes in `project/02-traceability/discrepancies/D-###.md`
(template: `templates/discrepancy-note.md`). Index:

| ID | Between | Summary | Severity | Status |
|---|---|---|---|---|
| D-001 | SCR-003 ↔ FR-007 | | high/med/low | open / resolved |

## 4. Change ripples log
| Date | Changed | Rippled to | Commit |
|---|---|---|---|
