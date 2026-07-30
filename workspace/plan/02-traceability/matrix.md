# Traceability Matrix — Garazo

- Maintained by `/trace`; update in the same commit as any traced artifact change.
- Last verified: 2026-07-30
- Source versions: BRD v1 · PRD v1 · feature list v1 · design v1 · SRS v1 ·
  technical plan v1
- Current delivery depth: pre-epic; task and test columns are intentionally `—`

## 1. Requirement → delivery chain

One row represents one PRD requirement and all atomic SRS requirements derived
from it. `—` means intentionally none at the current phase; a blank cell would
be a trace gap.

| BR | PRD | SRS | FT (feature) | SCR (screens) | EP / Tasks | Tests | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| BR-006, BR-008 | FR-001 | FR-ACCESS-01, FR-ACCESS-02 | FT-001 | SCR-001, SCR-002 | — (pre-epic) | — (pre-build) | designed | Workshop setup |
| BR-009 | FR-002 | FR-ACCESS-03, FR-ACCESS-04, FR-ACCESS-05, FR-ACCESS-13, FR-ACCESS-14 | FT-002 | SCR-001, SCR-010 | — (pre-epic) | — (pre-build) | designed | Phone OTP, workshop access, PIN recovery |
| BR-004, BR-006 | FR-003 | FR-JOB-01, FR-JOB-02, FR-JOB-03 | FT-004 | SCR-004 | — (pre-epic) | — (pre-build) | designed | Minimum job |
| BR-004, BR-009 | FR-004 | FR-JOB-04, FR-JOB-05 | FT-004 | SCR-004 | — (pre-epic) | — (pre-build) | designed | Optional capture |
| BR-004, BR-014 | FR-005 | FR-JOB-06 | FT-004 | SCR-004 | — (pre-epic) | — (pre-build) | designed | Manual plate fallback |
| BR-001, BR-006 | FR-006 | FR-JOB-07, FR-JOB-08, FR-JOB-09 | FT-005 | SCR-003, SCR-005 | — (pre-epic) | — (pre-build) | designed | Job lifecycle |
| BR-014 | FR-007 | FR-JOB-10, FR-JOB-11, FR-JOB-12, FR-JOB-13, FR-JOB-14 | FT-005 | SCR-013 | — (pre-epic) | — (pre-build) | designed | End-of-day batch entry |
| BR-001, BR-004 | FR-008 | FR-CUSTOMER-01, FR-CUSTOMER-02 | FT-006 | SCR-004, SCR-007, SCR-008 | — (pre-epic) | — (pre-build) | designed | Auto-built customer/vehicle relationship |
| BR-001, BR-008 | FR-009 | FR-CUSTOMER-03, FR-CUSTOMER-04 | FT-006 | SCR-007, SCR-008 | — (pre-epic) | — (pre-build) | designed | Search and history |
| BR-001, BR-006 | FR-010 | FR-BILLING-01, FR-BILLING-02 | FT-007 | SCR-005 | — (pre-epic) | — (pre-build) | designed | Bill creation |
| BR-001, BR-006 | FR-011 | FR-BILLING-03, FR-BILLING-04, FR-BILLING-05, FR-BILLING-06, FR-BILLING-10 | FT-007 | SCR-005, SCR-009, SCR-010 | — (pre-epic) | — (pre-build) | designed | Payment and due |
| BR-008, BR-010 | FR-012 | FR-SHARE-01, FR-SHARE-02 | FT-008 | SCR-006 | — (pre-epic) | — (pre-build) | designed | WhatsApp bill |
| BR-001, BR-011 | FR-013 | FR-BILLING-08, FR-BILLING-09 | FT-009 | SCR-009 | — (pre-epic) | — (pre-build) | designed | Due reminders |
| BR-005, BR-014 | FR-014 | FR-ACCESS-07, FR-ACCESS-08, FR-ACCESS-09, FR-ACCESS-10, FR-ACCESS-11, FR-ACCESS-12, FR-ACCESS-13, FR-ACCESS-14, FR-ACCESS-15, FR-CUSTOMER-05, FR-BILLING-07, FR-CASH-01, FR-CASH-05, FR-REMINDER-09, FR-SHARE-03 | FT-010 | SCR-002, SCR-005–SCR-010, SCR-012, SCR-013 | — (pre-epic) | — (pre-build) | designed | Owner-PIN privacy and Q-005 policy |
| BR-001, BR-006 | FR-015 | FR-CASH-02, FR-CASH-03, FR-CASH-04 | FT-011 | SCR-010 | — (pre-epic) | — (pre-build) | designed | Daily money |
| BR-006 | FR-016 | FR-EXPENSE-01, FR-EXPENSE-02, FR-EXPENSE-03 | FT-011 | SCR-010 | — (pre-epic) | — (pre-build) | designed | Expenses |
| BR-001, BR-006, BR-011 | FR-017 | FR-REMINDER-01, FR-REMINDER-02, FR-REMINDER-03, FR-REMINDER-04, FR-REMINDER-05 | FT-012 | SCR-005, SCR-008, SCR-009 | — (pre-epic) | — (pre-build) | designed | Service schedule/send |
| BR-001, BR-013 | FR-018 | FR-REMINDER-06, FR-REMINDER-07, FR-REMINDER-08, FR-REMINDER-09 | FT-013 | SCR-002, SCR-009, SCR-012 | — (pre-epic) | — (pre-build) | designed | Reminder returns and protected ROI |
| BR-010 | FR-019 | FR-PLAN-01, FR-PLAN-02, FR-PLAN-03, FR-PLAN-04 | FT-014 | SCR-002, SCR-003, SCR-011, SCR-012 | — (pre-epic) | — (pre-build) | designed | Free limits and ads |
| BR-011 | FR-020 | FR-PLAN-05, FR-PLAN-06, FR-PLAN-07, FR-PLAN-08 | FT-015 | SCR-009, SCR-011, SCR-012 | — (pre-epic) | — (pre-build) | designed | Pro entitlement |
| BR-011 | FR-021 | FR-PLAN-09, FR-PLAN-10, FR-PLAN-11, FR-PLAN-12 | FT-016 | SCR-002, SCR-006, SCR-009, SCR-011, SCR-012, SCR-014 | — (pre-epic) | — (pre-build) | designed | SMS credit wallet |
| BR-003, BR-009 | FR-022 | FR-ACCESS-06 | FT-017 | SCR-001–SCR-013 | — (pre-epic) | — (pre-build) | designed | Owner-app bn/en |
| BR-008, BR-017 | FR-023 | FR-ONLINE-01, FR-ONLINE-02 | FT-003 | — (cross-cutting) | — (pre-epic) | — (pre-build) | planned | Online-first persistence |
| BR-008, BR-009 | FR-024 | FR-ADMIN-01, FR-ADMIN-02, FR-ADMIN-03, FR-ADMIN-04, FR-ADMIN-05, FR-ADMIN-06, FR-ADMIN-07, FR-ADMIN-08 | FT-018 | SCR-014 | — (pre-epic) | — (pre-build) | designed | Authorized admin |
| BR-012, BR-013, BR-015 | FR-025 | FR-ANALYTICS-01, FR-ANALYTICS-02, FR-ANALYTICS-03, FR-ANALYTICS-04 | FT-019 | SCR-014 + measured interactions | — (pre-epic) | — (pre-build) | designed | Pilot evidence |
| BR-008, BR-017 | FR-030 | FR-OFFLINE-01, FR-OFFLINE-02, FR-OFFLINE-03, FR-OFFLINE-04, FR-OFFLINE-05 | FT-020, FT-021 | SCR-003, SCR-011 (teasers) | — (pre-epic) | — (pre-build) | planned | First paying cohort; detailed design deferred |
| BR-007, BR-011 | FR-031 | FR-MECH-01, FR-MECH-02, FR-MECH-03 | FT-022 | SCR-011 (teaser) | — (pre-epic) | — (pre-build) | planned | P1 boundary only |
| BR-007, BR-011 | FR-032 | FR-INVENTORY-01, FR-INVENTORY-02 | FT-023 | SCR-011 (teaser) | — (pre-epic) | — (pre-build) | planned | P1 boundary only |
| BR-007, BR-011 | FR-033 | FR-APPOINT-01, FR-APPOINT-02 | FT-024 | SCR-011 (teaser) | — (pre-epic) | — (pre-build) | planned | P1 boundary only |
| BR-007, BR-011 | FR-034 | FR-REPORT-01, FR-REPORT-02 | FT-025 | — (future design) | — (pre-epic) | — (pre-build) | planned | P1 boundary only |
| BR-008 | FR-035 | FR-HISTORY-01, FR-HISTORY-02, FR-HISTORY-03 | FT-026 | — (future design) | — (pre-epic) | — (pre-build) | planned | P1 boundary only |
| BR-007 | FR-040 | FR-BRANCH-01, FR-BRANCH-02 | FT-027 | — (future design) | — (pre-epic) | — (pre-build) | planned | L2 boundary only |
| BR-007 | FR-041 | FR-FLEET-01, FR-FLEET-02 | FT-028 | — (future design) | — (pre-epic) | — (pre-build) | planned | L2 boundary only |
| BR-016 | FR-042 | FR-TIREBOOK-01, FR-TIREBOOK-02, FR-TIREBOOK-03 | FT-029, FT-030 | — (future design) | — (pre-epic) | — (pre-build) | planned | L2, consented and standalone |
| BR-007 | FR-043 | FR-VAT-01, FR-VAT-02 | FT-031 | — (future design) | — (pre-epic) | — (pre-build) | planned | L2 boundary only |
| BR-004, BR-013 | FR-090 | NFR-PERF-01, FR-JOB-01, FR-JOB-02, FR-JOB-03, FR-JOB-04, FR-JOB-05, FR-JOB-06 | FT-004 | SCR-004 | — (pre-epic) | — (pre-build) | designed | ≤45-second median |
| BR-005, BR-009 | FR-091 | NFR-SEC-01, NFR-SEC-02, NFR-SEC-03, NFR-SEC-04, FR-ACCESS-05, FR-ACCESS-07, FR-ACCESS-08, FR-ACCESS-09, FR-ACCESS-10, FR-ACCESS-11, FR-ACCESS-12, FR-ACCESS-13, FR-ACCESS-14, FR-ACCESS-15, FR-ADMIN-01 | FT-002, FT-010, FT-018 | SCR-001, SCR-002, SCR-005–SCR-010, SCR-012–SCR-014 | — (pre-epic) | — (pre-build) | designed | Tenant, owner-money, admin security |
| BR-008, BR-017 | FR-092 | NFR-REL-01, FR-ONLINE-01, FR-ONLINE-02 | FT-003 | — (cross-cutting) | — (pre-epic) | — (pre-build) | planned | Online persistence |
| BR-008, BR-017 | FR-093 | NFR-REL-02, NFR-REL-03, NFR-REL-04, FR-OFFLINE-03, FR-OFFLINE-04, FR-OFFLINE-05 | FT-020, FT-021 | SCR-003, SCR-011 (teasers) | — (pre-epic) | — (pre-build) | planned | First paying cohort |
| BR-003, BR-009 | FR-094 | NFR-I18N-01, NFR-I18N-02, NFR-I18N-03, FR-ACCESS-06 | FT-017 | SCR-001–SCR-013 | — (pre-epic) | — (pre-build) | designed | bn/en and BD profile |
| BR-004 | FR-095 | NFR-A11Y-01, NFR-USABILITY-01, NFR-USABILITY-02, FR-JOB-01, FR-JOB-02, FR-JOB-03, FR-JOB-04, FR-JOB-05, FR-JOB-06 | FT-004 | SCR-004 | — (pre-epic) | — (pre-build) | designed | Confirm-first and WCAG AA |
| BR-016 | FR-096 | NFR-INDEPENDENCE-01, FR-ONLINE-03 | FT-003 | — (cross-cutting) | — (pre-epic) | — (pre-build) | planned | Standalone Garazo |
| BR-013 | FR-097 | NFR-ADOPTION-01, NFR-ADOPTION-02, FR-ANALYTICS-04 | FT-019 | SCR-014 | — (pre-epic) | — (pre-build) | drifted | D-001 accepted; NFR-ADOPTION-02 frozen |

Status: `planned` · `designed` · `in-build` · `done` · `verified` · `shipped`
· `drifted` (linked `D-###`).

## 2. Reverse checks (run by `/trace`)

| Check | Result | Notes |
|---|---|---|
| PRD requirements represented | pass — 43/43 | 35 functional + 8 PRD NFR rows |
| Atomic SRS functional requirements indexed | pass — 117/117 | Grouped under their PRD parent rows |
| SRS non-functional requirements indexed | pass — 18/18 | D-001 freezes one requirement |
| Features mapped to PRD | pass — 31/31 | No orphan feature |
| MVP PRD mapped to features | pass — 32/32 | No MVP coverage gap |
| Screens referenced by features | pass — 14/14 | No orphan screen |
| UI features with approved screens | pass with declared deferral | FT-025–FT-031 and detailed FT-020–FT-024 UI remain future-stage scope |
| Epic/task trace | N/A — pre-epic | Must be populated by `/dev-plan` and `/epic` |
| Test trace | N/A — pre-build | Must be populated before done/verified status |
| Version staleness | pass | Every approved artifact derives from current v1 sources |
| Content drift | one accepted item | D-001; no other contradiction found |

## 3. Discrepancy notes

Full notes live in `workspace/plan/02-traceability/discrepancies/`.

| ID | Between | Summary | Severity | Status |
|---|---|---|---|---|
| D-001 | NFR-ADOPTION-02 ↔ Q-006 | “Requires support” lacks an operational definition | medium | accepted |

## 4. Change ripples log

| Date | Changed | Rippled to | Commit |
|---|---|---|---|
| 2026-07-27 | Q-003, Q-004 | Design v1, screen coverage, SRS privacy boundary | `078a6b1`, `4c246a1` |
| 2026-07-29 | Q-005 | SRS access requirements, EARS criteria, feature list, glossary | `4c246a1` |
| 2026-07-29 | SRS v1 approval with Q-006 deferred | D-001 and initial matrix | this trace commit |
| 2026-07-29 | Technical-planning draft | Domain model, lifecycle analysis, and proposed ADR-0001–ADR-0009; no requirement meaning or coverage changed | `75bf452` |
| 2026-07-30 | ADR-0002 architecture style accepted | Technical plan, decision index, consequences, and state; no requirement meaning or coverage changed | this technical-plan commit |
| 2026-07-30 | ADR-0003 delivery methodology accepted | Technical plan, decision index, consequences, and state; no requirement meaning or coverage changed | this technical-plan commit |
| 2026-07-30 | ADR-0001 application stack accepted | Technical plan, decision index, consequences, and state; no requirement meaning or coverage changed | this technical-plan commit |
| 2026-07-30 | ADR-0005 datastore accepted | Technical plan, decision index, consequences, and state; no requirement meaning or coverage changed | this technical-plan commit |
| 2026-07-30 | ADR-0008 API style accepted | Technical plan, decision index, consequences, and state; no requirement meaning or coverage changed | this technical-plan commit |
| 2026-07-30 | ADR-0007 authentication and session accepted conditionally | Technical plan, decision index, security consequences, and state; no requirement meaning or coverage changed | this technical-plan commit |
| 2026-07-30 | ADR-0009 background jobs and queue accepted | Technical plan, decision index, retry/idempotency consequences, and state; no requirement meaning or coverage changed | this technical-plan commit |
| 2026-07-30 | ADR-0004 third-party service boundary accepted | Technical plan, decision index, integration-boundary consequences, and state; no requirement meaning or coverage changed | this technical-plan commit |
| 2026-07-30 | ADR-0006 hosting/runtime accepted; technical plan v1 decided | Chosen target architecture, VM operations consequences, trace handoff, and pipeline state; no requirement meaning or coverage changed | this technical-plan commit |

## Handoff → Development planning

- Produced by: Codex `/trace`, verified through decided technical plan v1 on
  2026-07-30
- **Decided:** 43 PRD rows join all approved BRD anchors, 117 functional SRS
  requirements, 18 NFRs, 31 features, and 14 screens. ADR-0001–ADR-0009 are
  accepted; ADR-0006 records the owner's hardened-VM Option 3 override.
- **Open (`Q-###`):** N/A for the next phase. Q-006 is an accepted deferral
  tracked by D-001 and freezes only NFR-ADOPTION-02.
- **Watch out:** P1/L2 rows and the first-paying-cohort offline UI remain
  boundary contracts. Firebase production use is conditional on its approved
  Bangladesh pilot. The selected single VM requires explicit recovery and
  operational tasks.
- **Next stage must:** run `/dev-plan`; create the genesis and product epics
  from technical plan v1 and populate EP/task links without inventing
  schema/API details.
- **Must NOT change without a D-### + human ping:** approved SRS IDs or
  meaning, accepted ADR choices, release boundaries, privacy rules, or source
  versions.
