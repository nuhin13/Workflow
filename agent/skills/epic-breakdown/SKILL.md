---
name: epic-breakdown
description: Break an SRS + feature list into traceable, prioritized epics with EARS acceptance criteria. Use whenever creating epics, restructuring scope, planning a new project or milestone, or whenever the user/PM mentions "epics", "breakdown", or "plan the project".
---
# Epic Breakdown

## Inputs → Outputs
In: `spec/srs.md`, `spec/feature-list.md`, the Figma design (docs/design/README.md).
Out: one folder per epic `epics/E<NN>-<slug>/` containing `epic.md` (from
`epics/_templates/epic.template.md`) and an empty `tasks/` + `tracker.md`.

## Procedure
1. Read the full SRS once. List every SRS ID. Anything non-atomic → propose a
   split back to the PM/human first.
2. Cluster features into epics by FUNCTIONAL AREA (auth, catalog, payments…)
   or by persona journey — pick one axis and state it. 5–12 feature epics is
   the healthy range for an MVP; more = clusters too thin.
3. **Epic 00 is always created first** (skills/genesis-epic). No feature epic
   starts before Epic 00 is human-approved.
4. Per epic fill: title, intent (1 para), `traces_to:` (every SRS id covered),
   EARS acceptance criteria (skills/ears-authoring) at the epic level,
   `depends:` on other epics, MoSCoW + WSJF (skills/priority-scheduling),
   risks, and UI surface (which Figma screens it owns).
5. Coverage check: every SRS-3.x functional id appears in exactly one epic's
   traces_to (NFRs may repeat). Orphans or doubles = fix before proceeding.
6. Output an epic map table (id, title, wsjf, depends) into `epics/README.md`
   and present to the human for approval.

## Hard rules
- No epic without SRS refs. No "misc" epic.
- Epic ids are immutable once tasks exist.
