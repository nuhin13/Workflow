# Feature List — Garazo

- ID prefix: `FT-###`
- Version: 1
- Status: approved
- Traces from: approved PRD v1 (`FR-###`)
- Traces to: Screens (`SCR-###`), Epics (`E<NN>`)
- Last updated: 2026-07-26

One row represents a coherent capability a user or operator would name. Screen
and epic IDs stay unassigned until `/design import` and `/dev-plan`; assigning
them here would invent downstream contracts before their owning phases.

| ID | Feature | Description (1 line) | Traces from | Depth (S/M/L/XL) | Depth notes (why) | Priority | MVP? | Screens | Epic |
|---|---|---|---|---|---|---|---|---|---|
| FT-001 | Workshop onboarding | Let a first-time owner configure a workshop and reach the operational app. | FR-001 | M | Multi-step setup, validation, and persisted workshop context. | Must | yes | TBD - `/design import` | TBD - `/dev-plan` |
| FT-002 | Phone authentication and tenant access | Authenticate an owner and restrict access to the correct workshop. | FR-002, FR-091 | L | Security boundary spanning identity, session handling, tenant isolation, and failure states. | Must | yes | TBD - `/design import` | TBD - `/dev-plan` |
| FT-003 | Standalone online workspace | Persist server-backed workshop records and operate independently of TireBook. | FR-023, FR-092, FR-096 | L | Shared persistence/reliability subsystem used by every MVP workflow. | Must | yes | N/A - cross-cutting | TBD - `/dev-plan` |
| FT-004 | Rapid job-card capture | Create a job from plate plus problem icon, with optional photo/OCR, voice, and media aids. | FR-003, FR-004, FR-005, FR-090, FR-095 | L | Time-critical multi-step flow with camera/OCR fallback, optional media, and measured speed. | Must | yes | TBD - `/design import` | TBD - `/dev-plan` |
| FT-005 | Job workflow and batch entry | Track promised work through delivery and support first-class end-of-day entry. | FR-006, FR-007 | L | Stateful lifecycle plus a second entry path that must produce equivalent records. | Must | yes | TBD - `/design import` | TBD - `/dev-plan` |
| FT-006 | Customer and vehicle book | Build linked customer/vehicle records from jobs and provide search and service history. | FR-008, FR-009 | M | Linked records, duplicate avoidance, search, and chronological history across several views. | Must | yes | TBD - `/design import` | TBD - `/dev-plan` |
| FT-007 | Billing and payment capture | Build a bill from job charges and record full or partial payments and balances. | FR-010, FR-011 | L | Financial calculations and state transitions must remain consistent and auditable. | Must | yes | TBD - `/design import` | TBD - `/dev-plan` |
| FT-008 | WhatsApp bill sharing | Prepare an approved bill image or PDF for manual WhatsApp sharing. | FR-012 | M | Document rendering plus an external share handoff and failure/cancel states. | Must | yes | TBD - `/design import` | TBD - `/dev-plan` |
| FT-009 | Dues and collection reminders | Show customer balances and record manual or SMS due-reminder actions. | FR-013 | M | Aggregated balances, reminder state, and SMS-credit interaction across customers. | Must | yes | TBD - `/design import` | TBD - `/dev-plan` |
| FT-010 | Owner-PIN money privacy | Lock owner-private money values on a shared workshop device. | FR-014, FR-091 | M | Security-sensitive gate with lock, unlock, invalid-PIN, and re-lock behavior. | Must | yes | TBD - `/design import` | TBD - `/dev-plan` |
| FT-011 | Daily cash and expense ledger | Record expenses and show daily income, dues, recoveries, expenses, and net totals. | FR-015, FR-016 | L | Append-only financial effects, category totals, and exact reconciliation across workflows. | Must | yes | TBD - `/design import` | TBD - `/dev-plan` |
| FT-012 | Service scheduling and reminders | Set next-service timing and deliver eligible Pro reminders exactly once. | FR-017 | L | Scheduled/background work, entitlement checks, delivery channels, credits, and idempotency. | Must | yes | TBD - `/design import` | TBD - `/dev-plan` |
| FT-013 | Reminder-return ROI | Attribute a returning job to a reminder and show sent, returned, and income outcomes. | FR-018 | M | Attribution link and owner-facing aggregates across reminder, job, and payment records. | Must | yes | TBD - `/design import` | TBD - `/dev-plan` |
| FT-014 | Free-tier limits and ads | Enforce the monthly job and device limits while retaining included Free capabilities. | FR-019 | M | Metering, period reset, entitlement state, ad surface, and upgrade boundary. | Must | yes | TBD - `/design import` | TBD - `/dev-plan` |
| FT-015 | Pro activation and entitlements | Activate Pro and expose only the capabilities included in the active plan. | FR-020 | M | Entitlement transitions affect several features while existing data must remain intact. | Must | yes | TBD - `/design import` | TBD - `/dev-plan` |
| FT-016 | SMS credit wallet | Display, add, validate, and consume SMS credits exactly once per successful send. | FR-021 | M | Credit ledger shared by bills and reminders with insufficient-credit and retry states. | Must | yes | TBD - `/design import` | TBD - `/dev-plan` |
| FT-017 | Bangla/English region profile | Switch approved interface language and number presentation without altering business data. | FR-022, FR-094 | M | App-wide content coverage, formatting, persistence, and region configuration. | Must | yes | N/A - all released screens | TBD - `/dev-plan` |
| FT-018 | Admin configuration and support controls | Provide authorized pricing, flags, referral audit, support lookup, and metrics operations. | FR-024, FR-091 | L | Separate privileged surface with auditability, scoped effects, and multiple operational tools. | Must | yes | TBD - `/design import` | TBD - `/dev-plan` |
| FT-019 | Pilot analytics and KPI measurement | Capture the adoption, speed, reminder, support, and paying-workshop evidence required by the pilot. | FR-025, FR-097 | M | Cross-feature event contract and metric definitions; reporting can reuse the admin surface. | Must | yes | N/A - cross-cutting/admin | TBD - `/dev-plan` |
| FT-020 | Pro offline operation | Keep supported Pro workflows usable while connectivity is unavailable. | FR-030, FR-093 | L | Local persistence, offline reads/writes, entitlement behavior, and clear connectivity states. | Should | no - first paying cohort | TBD - `/design import` | TBD - `/dev-plan` |
| FT-021 | Multi-device synchronization | Reconcile supported Pro records after reconnect without loss, duplicate money effects, or tenant leaks. | FR-030, FR-093 | L | Conflict handling and financial idempotency form a distinct synchronization subsystem. | Should | no - first paying cohort | N/A - cross-cutting | TBD - `/dev-plan` |
| FT-022 | Mechanics and salary module | Manage mechanic records, operational access, and salary information as a paid P1 module. | FR-031 | L | New role/access surface plus salary records and owner-money privacy dependencies. | Should | no - P1 | TBD - `/design import` | TBD - `/dev-plan` |
| FT-023 | Inventory module | Track real workshop stock and attributable stock movements as a paid P1 module. | FR-032 | L | New stock subsystem with movement history and future billing/job dependencies. | Should | no - P1 | TBD - `/design import` | TBD - `/dev-plan` |
| FT-024 | Appointments and booking link | Accept external booking submissions and let the workshop act on them as a paid P1 module. | FR-033 | L | Public entry surface, validation, notifications, and conversion into workshop work. | Should | no - P1 | TBD - `/design import` | TBD - `/dev-plan` |
| FT-025 | Reports pack | Reconcile period-based business reports to underlying workshop records. | FR-034 | M | Multiple read models and filters over existing trusted financial and operational data. | Should | no - P1 | TBD - `/design import` | TBD - `/dev-plan` |
| FT-026 | Public vehicle-history link | Share an approved, privacy-limited vehicle history without requiring a customer account. | FR-035 | M | Public token/link lifecycle, field filtering, and privacy boundaries. | Should | no - P1 | TBD - `/design import` | TBD - `/dev-plan` |
| FT-027 | Multi-branch operation | Separate branch records while allowing approved owner-level aggregate views. | FR-040 | L | Branch scoping changes tenancy, permissions, reporting, and most domain queries. | Could | no - L2 | TBD - `/design import` | TBD - `/dev-plan` |
| FT-028 | Fleet-customer accounts | Distinguish fleet vehicles, jobs, bills, and balances from retail customer records. | FR-041 | L | New account hierarchy and aggregate billing/history behavior across many records. | Could | no - L2 | TBD - `/design import` | TBD - `/dev-plan` |
| FT-029 | TireBook booking intake | Receive consented TireBook bookings while keeping Garazo independently operable. | FR-042 | L | Versioned external API, consent, identity matching, retries, and appointment conversion. | Could | no - L2 | TBD - `/design import` | TBD - `/dev-plan` |
| FT-030 | TireBook service-history exchange | Send consented service history and support reminder-to-rebooking flow. | FR-042 | L | Separate outbound contract, consent lifecycle, delivery reliability, and integration observability. | Could | no - L2 | TBD - `/design import` | TBD - `/dev-plan` |
| FT-031 | VAT invoicing | Issue configured VAT invoices linked to the originating workshop bill. | FR-043 | M | Conditional invoice fields, calculations, rendering, numbering, and retention. | Could | no - L2 | TBD - `/design import` | TBD - `/dev-plan` |

## Depth guide

- **S** - CRUD-like, one screen, no new patterns.
- **M** - Multi-step flow or one new integration.
- **L** - New subsystem, background work, security/financial boundary, or
  complex state.
- **XL** - Must be split before `/dev-plan`.

## Coverage check

### Result

- PRD requirements: 43 of 43 covered.
- MVP requirements: 32 of 32 covered.
- Deferred requirements: 11 of 11 covered.
- Uncovered MVP `FR-###`: none.
- Uncovered deferred `FR-###`: none.
- Orphan `FT-###`: none.
- `XL` features: none.

### MVP coverage map

| PRD requirements | Covering features |
|---|---|
| FR-001 | FT-001 |
| FR-002, FR-091 | FT-002, FT-010, FT-018 |
| FR-003, FR-004, FR-005, FR-090, FR-095 | FT-004 |
| FR-006, FR-007 | FT-005 |
| FR-008, FR-009 | FT-006 |
| FR-010, FR-011 | FT-007 |
| FR-012 | FT-008 |
| FR-013 | FT-009 |
| FR-014 | FT-010 |
| FR-015, FR-016 | FT-011 |
| FR-017 | FT-012 |
| FR-018 | FT-013 |
| FR-019 | FT-014 |
| FR-020 | FT-015 |
| FR-021 | FT-016 |
| FR-022, FR-094 | FT-017 |
| FR-023, FR-092, FR-096 | FT-003 |
| FR-024 | FT-018 |
| FR-025, FR-097 | FT-019 |

### Deferred coverage map

| PRD requirements | Covering features |
|---|---|
| FR-030, FR-093 | FT-020, FT-021 |
| FR-031 | FT-022 |
| FR-032 | FT-023 |
| FR-033 | FT-024 |
| FR-034 | FT-025 |
| FR-035 | FT-026 |
| FR-040 | FT-027 |
| FR-041 | FT-028 |
| FR-042 | FT-029, FT-030 |
| FR-043 | FT-031 |

### Depth distribution

| Depth | Count | Share | Interpretation |
|---|---:|---:|---|
| S | 0 | 0% | No feature is isolated CRUD; even the smaller capabilities cross a workflow or integration boundary. |
| M | 14 | 45% | Multi-step capabilities built on shared product foundations. |
| L | 17 | 55% | Security, finance, background work, external integration, or new subsystems. |
| XL | 0 | 0% | Offline/sync and TireBook were decomposed before handoff. |

## Feature notes

### FT-004 - Rapid job-card capture

- Edge cases: OCR unavailable or wrong; permission denied; optional media
  skipped; duplicate/known plate; minimum input incomplete.
- Depends on: FT-001, FT-002, FT-003.
- Open questions: N/A - detailed field and state contracts belong to SRS/design.

### FT-007 - Billing and payment capture

- Edge cases: zero/partial/full payment, repeated submission, unpaid remainder,
  and reconciliation with daily cash.
- Depends on: FT-005, FT-006, FT-003.
- Open questions: N/A - exact fields and arithmetic rules must be made atomic
  in the SRS.

### FT-011 - Daily cash and expense ledger

- Edge cases: duplicate financial effects, corrected entries, day boundary,
  privacy lock, and batch-entered activity.
- Depends on: FT-007, FT-009, FT-010.
- Open questions: N/A - ledger implementation is a foundational technical
  decision, not a feature-list decision.

### FT-012 - Service scheduling and reminders

- Edge cases: no SMS credits, entitlement expiry, duplicate scheduler attempts,
  skipped next-service timing, and failed delivery.
- Depends on: FT-006, FT-015, FT-016.
- Open questions: N/A - channel retry and scheduling contracts belong to SRS.

### FT-020 / FT-021 - Offline and synchronization

- Decomposition: FT-020 owns local offline operation; FT-021 owns reconciliation
  across devices and connectivity changes.
- Depends on: stable contracts for every supported online MVP record.
- Open questions: N/A - conflict policy is intentionally deferred to the
  foundational decisions and SRS for the first paying cohort.

### FT-029 / FT-030 - TireBook integration

- Decomposition: FT-029 owns bookings into Garazo; FT-030 owns history out and
  the consented reminder/rebooking loop.
- Depends on: FT-024 for appointment conversion and stable versioned public
  contracts.
- Open questions: N/A - L2 API fields and consent details require separate
  approved scope before implementation.

## Handoff → Business forecast

- Produced by: Codex analyst on 2026-07-26 · Status: approved
- **Decided (do not reopen without escalating):** 31 features cover all 43 PRD
  requirements; 19 features are MVP, two belong to the first paying cohort,
  five are P1, and five are L2; no feature is `XL`; screen and epic IDs remain
  intentionally unassigned.
- **Open (`Q-###`):** N/A - no blocking priority or coverage question remains.
- **Watch out:** more than half the features are depth L because Garazo includes
  security, financial records, scheduled messaging, offline sync, and future
  integrations. Forecast and technical planning must not flatten that risk.
- **Next stage must:** run `/forecast`, using depth and release stage without
  converting estimates into commitments; then run `/design import`.
- **Must NOT change without a D-### + human ping:** approved PRD scope, MVP/P1/L2
  boundaries, locked v1 sources, or the split of offline/sync and TireBook
  integration that prevents `XL` features.
