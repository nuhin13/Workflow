---
name: trace
description: Build or verify the BRD↔feature↔UI↔epic↔test traceability matrix — detect gaps, orphans, and drift; fix what's fixable in linked artifacts, file D-### discrepancy notes for the rest. Run after any artifact change and before every checkpoint.
---

# /trace — traceability matrix

1. First run: create `project/02-traceability/matrix.md` from
   `templates/traceability-matrix.md` and `discrepancies/` dir.
2. **Index:** scan all artifacts (business docs, design screens, epics/tasks, tests) for
   IDs and Traces-from/to declarations; rebuild §1 rows and per-row status.
3. **Verify (reverse checks):**
   - MVP FR without FT · FT without FR · FT-with-UI without SCR · SCR unreferenced by any FT
   - Epic/task not tracing to any FT (except EP-00) · qa-passed rows without listed tests
   - Content drift: screen spec vs prototype vs built UI; BRD/PRD statements contradicted
     by later artifacts.
4. **Resolve:** mechanical/unambiguous fixes → apply to ALL linked artifacts in the same
   commit and log in §4 (Change ripples). Judgment calls → `D-###` note
   (`templates/discrepancy-note.md`), linked from BOTH artifacts and indexed in §3;
   high-severity D-### also goes to `state.yaml` blockers.
5. Report: rows added/updated, gaps found, fixes applied, D-### filed. Commit
   `trace: <summary>`. If this was the Phase 2 gate, set `phase: tech-plan`.
