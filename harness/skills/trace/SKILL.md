---
name: trace
description: Build or verify the BRD↔feature↔UI↔epic↔test traceability matrix — detect gaps, orphans, and drift; fix what's fixable in linked artifacts, file D-### discrepancy notes for the rest. Run after any artifact change and before every checkpoint.
---

# /trace — traceability matrix

1. **Phase precondition:** `workspace/state.yaml: artifacts.srs.approved` is
   set. If not, STOP and run `/srs-authoring`; planning cannot use draft SRS
   identifiers.
2. First run: create `workspace/plan/02-traceability/matrix.md` from
   `harness/templates/plan/traceability-matrix.md` and `discrepancies/` dir.
3. **Index:** scan all artifacts (business docs, design screens, epics/tasks, tests) for
   IDs and Traces-from/to declarations; rebuild §1 rows and per-row status.
4. **Verify (reverse checks):**
   - MVP FR without FT · FT without FR · FT-with-UI without SCR · SCR unreferenced by any FT
   - Epic/task not tracing to any FT (except E00) · done/verified rows without listed tests
   - Content drift: screen spec vs prototype vs built UI; BRD/PRD statements contradicted
     by later artifacts.
   - **Version staleness (v2 · HADR-0001 D-4):** read `workspace/state.yaml: artifacts`.
     For each artifact whose `derived_from: {X: n}` cites a version older than X's
     current version, mark it **stale** and report it — a BRD bump to v3 flags every
     v2-derived PRD/design/epic without a human remembering. Stale ≠ wrong, but it
     MUST be re-reviewed against the new source version before the next gate.
5. **Resolve:** mechanical/unambiguous fixes → apply to ALL linked artifacts in the same
   commit and log in §4 (Change ripples). Judgment calls → `D-###` note
   (`harness/templates/process/discrepancy-note.md`), linked from BOTH artifacts and indexed in §3;
   high-severity D-### also goes to `state.yaml` blockers.
6. Report: rows added/updated, gaps found, fixes applied, D-### filed. Commit
   `trace: <summary>`. If this was the pipeline gate, mark traceability done
   and set `phase: tech-plan`.
