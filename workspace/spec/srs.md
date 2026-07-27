# Software Requirements Specification — Garazo

- Version: 1
- Date: 2026-07-27
- Status: draft — ⏳ AWAITING HUMAN `srs_approval`
- Derived from: locked BRD v1, approved PRD v1, feature list v1, design v1
- Visual canon: `workspace/docs/design/README.md`
- Approved screens: `SCR-001` through `SCR-014`
- Traces to: `workspace/spec/feature-list.md`, then the live traceability matrix

## Amendments

N/A — initial draft. After approval, every change must be recorded here as
`AMD-<n> · date · change · reason · approved by`.

## 1. Product boundary and release stages

Garazo is a Bangla-first, Android-first workshop-management product for
informal vehicle workshops. The customer does not need a Garazo account or
app. The product remains useful without TireBook.

| Stage | Included contract |
|---|---|
| MVP | `FR-ACCESS-*` through `FR-ONLINE-*`, plus applicable `NFR-*` |
| First paying cohort | `FR-OFFLINE-*` |
| P1, after separate detailed approval | `FR-MECH-*`, `FR-INVENTORY-*`, `FR-APPOINT-*`, `FR-REPORT-*`, `FR-HISTORY-*` |
| L2, after validated demand and separate approval | `FR-BRANCH-*`, `FR-FLEET-*`, `FR-TIREBOOK-*`, `FR-VAT-*` |

P1 and L2 rows preserve the approved boundary only. They do not authorize
implementation until their detailed fields, permissions, and flows are
approved.

## 2. Actors

| Actor | Authorized purpose |
|---|---|
| Owner/Ustad | Full workshop operation and owner-PIN-protected money access |
| Permitted workshop user | Operational job/customer work without protected owner values |
| Customer | Receives a bill or reminder without installing Garazo |
| Authorized support operator | Uses the separate scoped admin surface |
| Scheduler | Evaluates eligible service reminders |
| TireBook | Future consented L2 integration; never an MVP dependency |

## 3. MVP modules

### 3.1 Shop setup and access

| ID | Priority | Atomic requirement | Traces from | Screen | EARS acceptance criterion |
|---|---|---|---|---|---|
| FR-ACCESS-01 | Must | The system SHALL save the confirmed initial workshop setup. | FR-001, FT-001 | SCR-001 | EARS-ACCESS-1 — WHEN a first-time owner confirms all required setup values, the system SHALL retain the workshop context. |
| FR-ACCESS-02 | Must | The system SHALL open the operational home after successful initial setup. | FR-001, FT-001 | SCR-001, SCR-002 | EARS-ACCESS-2 — WHEN initial setup is saved, the system SHALL open `SCR-002`. |
| FR-ACCESS-03 | Must | The system SHALL authenticate a registered owner through the approved phone-OTP capability. | FR-002, FT-002 | SCR-001 | EARS-ACCESS-3 — WHEN a registered owner completes valid phone authentication, the system SHALL create an authenticated workshop session. |
| FR-ACCESS-04 | Must | The system SHALL show no workshop data after failed authentication. | FR-002, FT-002 | SCR-001 | EARS-ACCESS-4 — IF phone authentication fails, THEN the system SHALL show no workshop record. |
| FR-ACCESS-05 | Must | The system SHALL restrict an authenticated session to its authorized workshop context. | FR-002, FR-091, FT-002 | Cross-cutting | EARS-ACCESS-5 — WHILE a user is authenticated for one workshop, the system SHALL return only records authorized for that workshop. |
| FR-ACCESS-06 | Must | The system SHALL let the owner select Bangla or English interface content. | FR-022, FT-017 | SCR-011 | EARS-ACCESS-6 — WHEN the owner selects Bangla or English, the system SHALL apply that language to supported interface content. |

**UC-ACCESS.1:** Actor: Owner. Trigger: first launch or signed-out access.
Main flow: authenticate, confirm shop setup, enter the correct workshop.
Error flows: invalid OTP shows no workshop data; unavailable service keeps the
user outside the operational app.

### 3.2 Job cards and workflow

| ID | Priority | Atomic requirement | Traces from | Screen | EARS acceptance criterion |
|---|---|---|---|---|---|
| FR-JOB-01 | Must | The system SHALL save a job containing a non-empty vehicle plate and at least one problem icon. | FR-003, FT-004 | SCR-004 | EARS-JOB-1 — WHEN a user confirms a non-empty plate and one or more problem icons, the system SHALL save the job. |
| FR-JOB-02 | Must | The system SHALL block job saving when the vehicle plate is absent. | FR-003, FT-004 | SCR-004 | EARS-JOB-2 — IF a job has no plate, THEN the system SHALL identify the missing plate and keep the job unsaved. |
| FR-JOB-03 | Must | The system SHALL block job saving when no problem icon is selected. | FR-003, FT-004 | SCR-004 | EARS-JOB-3 — IF a job has no problem icon, THEN the system SHALL identify the missing problem and keep the job unsaved. |
| FR-JOB-04 | Must | The system SHALL allow a minimum job to be saved when optional capture aids are skipped. | FR-004, FT-004 | SCR-004 | EARS-JOB-4 — WHEN optional photo, OCR, voice, media, price, customer, or timing input is skipped, the system SHALL keep the minimum job save available. |
| FR-JOB-05 | Must | The system SHALL retain each supplied optional capture value with its job. | FR-004, FT-004 | SCR-004 | EARS-JOB-5 — WHEN an optional approved capture value is supplied, the system SHALL attach it to the saved job. |
| FR-JOB-06 | Must | The system SHALL keep manual plate entry available when plate capture is skipped or unsuccessful. | FR-005, FT-004 | SCR-004 | EARS-JOB-6 — IF plate photo or recognition is unavailable or unsuccessful, THEN the system SHALL allow typed plate entry without an OCR retry. |
| FR-JOB-07 | Must | The system SHALL show supplied promised timing with the job. | FR-006, FT-005 | SCR-003, SCR-005 | EARS-JOB-7 — WHEN promised timing is saved for a job, the system SHALL show it in the work list and job detail. |
| FR-JOB-08 | Must | The system SHALL apply only an allowed job-status transition. | FR-006, FT-005 | SCR-003, SCR-005 | EARS-JOB-8 — WHEN a permitted user confirms an allowed status change, the system SHALL set the job to that state. |
| FR-JOB-09 | Must | The system SHALL retain each applied job-status transition in the job history. | FR-006, FT-005 | SCR-005 | EARS-JOB-9 — WHEN a job status changes, the system SHALL append that transition to the job history. |
| FR-JOB-10 | Must | The system SHALL restrict end-of-day batch entry to an owner-PIN-unlocked context. | FR-007, FR-014, FT-005, FT-010 | SCR-013 | EARS-JOB-10 — WHILE the owner PIN is locked, the system SHALL hide batch money and keep batch saving unavailable. |
| FR-JOB-11 | Must | The system SHALL create the same job-record type from valid batch entry as from live entry. | FR-007, FT-005 | SCR-013 | EARS-JOB-11 — WHEN a valid batch job is saved, the system SHALL make it available in the same job, customer, and vehicle records as a live job. |
| FR-JOB-12 | Must | The system SHALL assign the confirmed business date to each saved batch row. | FR-007, FT-005 | SCR-013 | EARS-JOB-12 — WHEN valid batch rows are saved, the system SHALL retain the confirmed business date on every resulting record. |
| FR-JOB-13 | Must | The system SHALL preserve all batch drafts after a failed batch save. | FR-007, FT-005 | SCR-013 | EARS-JOB-13 — IF a batch save fails, THEN the system SHALL retain every draft row without reporting success. |
| FR-JOB-14 | Must | The system SHALL prevent a retried batch save from duplicating an already accepted record. | FR-007, FT-005 | SCR-013 | EARS-JOB-14 — WHEN a previously accepted batch submission is retried, the system SHALL create zero duplicate job or money effects. |

**UC-JOB.1:** Actor: permitted workshop user. Trigger: a vehicle arrives.
Main flow: confirm plate and problem, optionally add details, save, progress the
job. Error flows: missing minimum input blocks save; failed optional capture
falls back to manual entry.

**UC-JOB.2:** Actor: Owner. Trigger: work was recorded after the rush. Main
flow: unlock with PIN, add job rows, add related money, review, save with the
business date. Error flows: invalid rows remain editable; failed or repeated
submission creates no duplicate effect.

### 3.3 Customer and vehicle book

| ID | Priority | Atomic requirement | Traces from | Screen | EARS acceptance criterion |
|---|---|---|---|---|---|
| FR-CUSTOMER-01 | Must | The system SHALL establish the available customer/vehicle relationship when an unknown-plate job is saved. | FR-008, FT-006 | SCR-004, SCR-007, SCR-008 | EARS-CUSTOMER-1 — WHEN an unknown-plate job is saved with available customer details, the system SHALL establish its customer/vehicle relationship. |
| FR-CUSTOMER-02 | Must | The system SHALL link a known plate job to its existing vehicle record. | FR-008, FT-006 | SCR-004, SCR-008 | EARS-CUSTOMER-2 — WHEN a job uses a known plate, the system SHALL link the job to the existing vehicle instead of creating a duplicate vehicle. |
| FR-CUSTOMER-03 | Must | The system SHALL return matching records for an available customer or vehicle identifier. | FR-009, FT-006 | SCR-007 | EARS-CUSTOMER-3 — WHEN a user searches by a stored customer or vehicle identifier, the system SHALL show matching authorized records. |
| FR-CUSTOMER-04 | Must | The system SHALL show linked jobs in chronological vehicle-service context. | FR-009, FT-006 | SCR-008 | EARS-CUSTOMER-4 — WHEN an authorized user opens a vehicle record, the system SHALL show its linked jobs in chronological context. |
| FR-CUSTOMER-05 | Must | The system SHALL mask each customer due amount outside an owner-PIN-unlocked context. | FR-014, FT-010 | SCR-007, SCR-008 | EARS-CUSTOMER-5 — WHILE owner money is locked, the system SHALL replace every customer due amount with a non-value placeholder. |

**UC-CUSTOMER.1:** Actor: permitted workshop user. Trigger: a job is saved or
a record is searched. Main flow: link or create the record, search, open
history. Error flows: a known plate is not duplicated; unauthorized money stays
masked.

### 3.4 Billing, payments, and dues

| ID | Priority | Atomic requirement | Traces from | Screen | EARS acceptance criterion |
|---|---|---|---|---|---|
| FR-BILLING-01 | Must | The system SHALL calculate a bill total from its recorded charge lines. | FR-010, FT-007 | SCR-005 | EARS-BILLING-1 — WHEN billing is confirmed for recorded charges, the system SHALL calculate the bill total from those charges. |
| FR-BILLING-02 | Must | The system SHALL retain a confirmed bill with its originating job. | FR-010, FT-007 | SCR-005 | EARS-BILLING-2 — WHEN a valid bill is confirmed, the system SHALL retain it with the originating job. |
| FR-BILLING-03 | Must | The system SHALL retain a valid payment against its bill. | FR-011, FT-007 | SCR-005 | EARS-BILLING-3 — WHEN the owner confirms a valid payment, the system SHALL retain that payment against the selected bill. |
| FR-BILLING-04 | Must | The system SHALL calculate unpaid balance as bill total minus retained payments. | FR-011, FT-007 | SCR-005 | EARS-BILLING-4 — WHEN a payment is retained, the system SHALL calculate the remaining balance from the bill total and retained payments. |
| FR-BILLING-05 | Must | The system SHALL create a tracked customer due when the unpaid balance is greater than zero. | FR-011, FT-007 | SCR-005, SCR-009 | EARS-BILLING-5 — WHEN a bill has a positive unpaid balance, the system SHALL show that balance as a customer due after owner-PIN authorization. |
| FR-BILLING-06 | Must | The system SHALL show no remaining due when retained payments equal the bill total. | FR-011, FT-007 | SCR-005 | EARS-BILLING-6 — WHEN retained payments equal the bill total, the system SHALL show zero remaining due. |
| FR-BILLING-07 | Must | The system SHALL require owner-PIN authorization before revealing bill-due or payment values. | FR-014, FT-010 | SCR-005, SCR-006 | EARS-BILLING-7 — WHILE owner money is locked, the system SHALL hide bill-due and payment values. |
| FR-BILLING-08 | Must | The system SHALL show each outstanding customer balance in the unlocked due view. | FR-013, FT-009 | SCR-009 | EARS-BILLING-8 — WHEN the authorized owner opens the due view, the system SHALL show each outstanding customer balance. |
| FR-BILLING-09 | Must | The system SHALL record each permitted due-reminder action. | FR-013, FT-009 | SCR-009 | EARS-BILLING-9 — WHEN a permitted due reminder is sent, the system SHALL retain the reminder action and its result. |
| FR-BILLING-10 | Must | The system SHALL reduce an outstanding due by a retained due-recovery payment exactly once. | FR-011, FR-015, FT-007, FT-011 | SCR-009, SCR-010 | EARS-BILLING-10 — WHEN a valid due-recovery payment is retained, the system SHALL reduce the outstanding due exactly once. |

**UC-BILLING.1:** Actor: Owner. Trigger: work charges are ready. Main flow:
create bill, unlock protected payment, record payment, calculate any due.
Error flows: invalid or repeated payment creates no duplicate financial effect;
locked users see no protected value.

### 3.5 Daily cash summary

| ID | Priority | Atomic requirement | Traces from | Screen | EARS acceptance criterion |
|---|---|---|---|---|---|
| FR-CASH-01 | Must | The system SHALL require owner-PIN authorization before showing the daily money view. | FR-014, FT-010 | SCR-010 | EARS-CASH-1 — WHILE owner money is locked, the system SHALL show no daily money value. |
| FR-CASH-02 | Must | The system SHALL show the current business day's retained income, expenses, dues, recovered dues, and net position in one view. | FR-015, FT-011 | SCR-010 | EARS-CASH-2 — WHEN the authorized owner opens the daily money view, the system SHALL show each approved category for the current business day. |
| FR-CASH-03 | Must | The system SHALL calculate each daily category from its retained underlying entries. | FR-015, FT-011 | SCR-010 | EARS-CASH-3 — WHEN a daily category is displayed, the system SHALL make its value equal the retained entries classified into that category. |
| FR-CASH-04 | Must | The system SHALL calculate net position from the approved daily categories. | FR-015, FT-011 | SCR-010 | EARS-CASH-4 — WHEN the daily money view is displayed, the system SHALL make net position reconcile to its displayed income and expense effects. |
| FR-CASH-05 | Must | The system SHALL hide all daily money values immediately after explicit lock. | FR-014, FT-010 | SCR-010 | EARS-CASH-5 — WHEN the owner selects lock, the system SHALL replace every protected daily value with a non-value state. |

**UC-CASH.1:** Actor: Owner. Trigger: the owner opens Money. Main flow: enter
PIN, review reconciled daily categories, optionally drill into entries, lock.
Error flows: invalid PIN reveals nothing; failed ledger load reveals no stale
private value.

### 3.6 Service reminders

| ID | Priority | Atomic requirement | Traces from | Screen | EARS acceptance criterion |
|---|---|---|---|---|---|
| FR-REMINDER-01 | Must | The system SHALL retain a confirmed next-service timing with its vehicle. | FR-017, FT-012 | SCR-005, SCR-008 | EARS-REMINDER-1 — WHEN next-service timing is confirmed at delivery, the system SHALL retain it with the vehicle. |
| FR-REMINDER-02 | Must | The system SHALL queue a reminder for retained next-service timing. | FR-017, FT-012 | SCR-005, SCR-009 | EARS-REMINDER-2 — WHEN eligible next-service timing is retained, the system SHALL create a reminder queue item for that vehicle. |
| FR-REMINDER-03 | Must | The system SHALL keep automated service-reminder sending unavailable without an eligible Pro entitlement. | FR-017, FR-020, FT-012, FT-015 | SCR-009, SCR-012 | EARS-REMINDER-3 — WHILE a workshop lacks eligible Pro entitlement, the system SHALL keep automated service-reminder sending unavailable. |
| FR-REMINDER-04 | Must | The system SHALL send an eligible reminder no more than once for one due occurrence. | FR-017, FT-012 | SCR-009 | EARS-REMINDER-4 — WHEN one eligible reminder becomes due, the system SHALL create at most one successful send record for that occurrence. |
| FR-REMINDER-05 | Must | The system SHALL mark a successfully delivered reminder as sent. | FR-017, FT-012 | SCR-009 | EARS-REMINDER-5 — WHEN reminder delivery succeeds, the system SHALL mark the reminder sent. |
| FR-REMINDER-06 | Must | The system SHALL attribute an eligible return job to its originating sent reminder. | FR-018, FT-013 | SCR-009 | EARS-REMINDER-6 — WHEN a returning visit is validly attributed, the system SHALL link its job to the originating sent reminder. |
| FR-REMINDER-07 | Must | The system SHALL increment `reminder_returned` no more than once per attributed return job. | FR-018, FT-013 | SCR-009 | EARS-REMINDER-7 — WHEN a return job is attributed repeatedly to the same reminder, the system SHALL count that return once. |
| FR-REMINDER-08 | Must | The system SHALL calculate reminder sent, returned, and attributed-income values from retained records. | FR-018, FT-013 | SCR-009 | EARS-REMINDER-8 — WHEN the authorized owner opens reminder ROI, the system SHALL reconcile all three values to retained reminder, return, and payment records. |
| FR-REMINDER-09 | Must | The system SHALL mask reminder ROI and attributed-income values outside an owner-PIN-unlocked context. | FR-014, FR-018, FT-010, FT-013 | SCR-002, SCR-009, SCR-012 | EARS-REMINDER-9 — WHILE owner money is locked, the system SHALL expose no reminder ROI or attributed-income value. |

**UC-REMINDER.1:** Actor: Owner and Scheduler. Trigger: next service is set
and later becomes due. Main flow: queue, verify entitlement/channel, send once,
record return, show protected ROI. Error flows: ineligible, no-credit, or
failed delivery creates no successful send record.

### 3.7 Expenses

| ID | Priority | Atomic requirement | Traces from | Screen | EARS acceptance criterion |
|---|---|---|---|---|---|
| FR-EXPENSE-01 | Must | The system SHALL retain a valid workshop expense with its amount and approved category. | FR-016, FT-011 | SCR-010 | EARS-EXPENSE-1 — WHEN the authorized owner saves a valid expense amount and category, the system SHALL retain the expense. |
| FR-EXPENSE-02 | Must | The system SHALL include a retained expense in the applicable business-day ledger. | FR-016, FT-011 | SCR-010 | EARS-EXPENSE-2 — WHEN an expense is retained, the system SHALL include it in that business day's expense entries. |
| FR-EXPENSE-03 | Must | The system SHALL reduce the applicable net position by each retained expense exactly once. | FR-016, FT-011 | SCR-010 | EARS-EXPENSE-3 — WHEN the daily net is calculated, the system SHALL apply each retained expense once. |

**UC-EXPENSE.1:** Actor: Owner. Trigger: a workshop expense occurs. Main
flow: unlock Money, enter amount and category, save, see reconciled totals.
Error flow: invalid or repeated submission creates no duplicate expense.

### 3.8 Monetization and SMS credits

| ID | Priority | Atomic requirement | Traces from | Screen | EARS acceptance criterion |
|---|---|---|---|---|---|
| FR-PLAN-01 | Must | The system SHALL count each successfully saved Free-tier job toward the workshop's current monthly limit. | FR-019, FT-014 | SCR-003, SCR-011 | EARS-PLAN-1 — WHEN a Free workshop saves a valid job below its limit, the system SHALL increase the current monthly job count by one. |
| FR-PLAN-02 | Must | The system SHALL block a Free-tier job save after 30 jobs in the current monthly period. | FR-019, FT-014 | SCR-003, SCR-012 | EARS-PLAN-2 — WHEN a Free workshop at 30 current-period jobs attempts another save, the system SHALL keep the job unsaved and show the upgrade path. |
| FR-PLAN-03 | Must | The system SHALL limit a Free workshop to one active device. | FR-019, FT-014 | SCR-011 | EARS-PLAN-3 — WHEN a Free workshop already has its active device, the system SHALL keep an additional device outside the workshop session. |
| FR-PLAN-04 | Must | The system SHALL show only approved light advertising in the Free experience. | FR-019, FT-014 | SCR-002, SCR-003 | EARS-PLAN-4 — WHILE the workshop is on Free, the system SHALL limit advertising to the approved light-ad surfaces. |
| FR-PLAN-05 | Must | The system SHALL activate Pro only after a valid approved activation is confirmed. | FR-020, FT-015 | SCR-012 | EARS-PLAN-5 — WHEN a valid Pro activation is confirmed, the system SHALL set the workshop entitlement to Pro. |
| FR-PLAN-06 | Must | The system SHALL preserve existing workshop records when entitlement changes. | FR-020, FT-015 | SCR-012 | EARS-PLAN-6 — WHEN a workshop changes between Free and Pro entitlement, the system SHALL retain all existing workshop records. |
| FR-PLAN-07 | Must | The system SHALL make only currently entitled Pro capabilities available. | FR-020, FT-015 | SCR-009, SCR-011, SCR-012 | EARS-PLAN-7 — WHILE Pro entitlement is valid, the system SHALL make the BRD-approved capabilities for the current release available. |
| FR-PLAN-08 | Must | The system SHALL keep Pro-only actions unavailable when Pro entitlement is absent. | FR-020, FT-015 | SCR-009, SCR-011, SCR-012 | EARS-PLAN-8 — WHILE Pro entitlement is absent, the system SHALL keep each Pro-only action unavailable. |
| FR-PLAN-09 | Must | The system SHALL display the workshop's retained SMS-credit balance. | FR-021, FT-016 | SCR-002, SCR-011, SCR-012 | EARS-PLAN-9 — WHEN an authorized workshop user opens an SMS-credit surface, the system SHALL show the retained credit balance. |
| FR-PLAN-10 | Must | The system SHALL add credits after an approved purchase or assignment succeeds. | FR-021, FT-016 | SCR-012, SCR-014 | EARS-PLAN-10 — WHEN an approved SMS-credit purchase or assignment succeeds, the system SHALL increase the retained balance by the confirmed quantity. |
| FR-PLAN-11 | Must | The system SHALL consume one SMS credit for one successful bill or reminder SMS send. | FR-021, FT-016 | SCR-006, SCR-009 | EARS-PLAN-11 — WHEN one bill or reminder SMS is successfully sent, the system SHALL reduce the balance by one exactly once. |
| FR-PLAN-12 | Must | The system SHALL block SMS sending when the retained credit balance is zero. | FR-021, FT-016 | SCR-006, SCR-009 | EARS-PLAN-12 — IF the SMS-credit balance is zero, THEN the system SHALL create no sent record and show the unavailable-credit state. |

**UC-PLAN.1:** Actor: Owner. Trigger: a limit, paid capability, or SMS balance
is encountered. Main flow: view entitlement, activate through an approved
collection path, or add credits. Error flows: invalid activation changes
nothing; zero credits or expired entitlement blocks only the gated action.

## 4. Platform surfaces

### 4.1 Customer touchpoints

| ID | Priority | Atomic requirement | Traces from | Screen | EARS acceptance criterion |
|---|---|---|---|---|---|
| FR-SHARE-01 | Must | The system SHALL prepare an approved image or PDF representation of a saved bill for manual WhatsApp sharing. | FR-012, FT-008 | SCR-006 | EARS-SHARE-1 — WHEN the owner chooses WhatsApp for a saved bill, the system SHALL prepare the approved bill artifact for the external share handoff. |
| FR-SHARE-02 | Must | The system SHALL complete bill sharing without requiring the customer to install Garazo. | FR-012, FT-008 | SCR-006 | EARS-SHARE-2 — WHEN the external bill handoff is completed, the system SHALL require no Garazo customer account or app. |
| FR-SHARE-03 | Must | The system SHALL reveal a bill containing a due only after owner-PIN authorization. | FR-014, FT-010 | SCR-006 | EARS-SHARE-3 — WHILE owner money is locked, the system SHALL hide a bill's due value and its protected share actions. |

**UC-SHARE.1:** Actor: Owner. Trigger: a saved bill is ready. Main flow:
unlock protected values when required, preview, hand off to WhatsApp. Error
flows: canceled or failed handoff does not claim delivery.

### 4.2 Authorized admin portal and pilot evidence

| ID | Priority | Atomic requirement | Traces from | Screen | EARS acceptance criterion |
|---|---|---|---|---|---|
| FR-ADMIN-01 | Must | The system SHALL show admin controls only to an authorized support operator. | FR-024, FR-091, FT-018 | SCR-014 | EARS-ADMIN-1 — IF an admin request lacks required authorization, THEN the system SHALL show no admin control or protected result. |
| FR-ADMIN-02 | Must | The system SHALL apply a remote configuration change only to its confirmed product or workshop scope. | FR-024, FT-018 | SCR-014 | EARS-ADMIN-2 — WHEN an authorized operator confirms a supported configuration change, the system SHALL apply it only to the displayed scope. |
| FR-ADMIN-03 | Must | The system SHALL apply a feature-flag change only to its confirmed scope. | FR-024, FT-018 | SCR-014 | EARS-ADMIN-3 — WHEN an authorized operator confirms a supported feature flag, the system SHALL apply it only to the displayed scope. |
| FR-ADMIN-04 | Must | The system SHALL apply a kill-switch change only to its confirmed scope. | FR-024, FT-018 | SCR-014 | EARS-ADMIN-4 — WHEN an authorized operator confirms a supported kill switch, the system SHALL apply it only to the displayed scope. |
| FR-ADMIN-05 | Must | The system SHALL retain an audit record for every successful admin mutation. | FR-024, FT-018 | SCR-014 | EARS-ADMIN-5 — WHEN an admin mutation succeeds, the system SHALL retain the operator, control, prior value, new value, scope, and time in its audit record. |
| FR-ADMIN-06 | Must | The system SHALL provide authorized read-only referral audit results for the selected scope. | FR-024, FT-018 | SCR-014 | EARS-ADMIN-6 — WHEN an authorized operator opens referral audit, the system SHALL show the records permitted for the selected scope. |
| FR-ADMIN-07 | Must | The system SHALL return only permitted workshop data through support lookup. | FR-024, FT-018 | SCR-014 | EARS-ADMIN-7 — WHEN an authorized operator searches support records, the system SHALL return only records allowed by the operator's permission and scope. |
| FR-ADMIN-08 | Must | The system SHALL show approved product metrics for the selected scope. | FR-024, FR-025, FT-018, FT-019 | SCR-014 | EARS-ADMIN-8 — WHEN an authorized operator opens product metrics, the system SHALL calculate them from retained scoped events. |
| FR-ANALYTICS-01 | Must | The system SHALL retain enough job-created data to calculate active workshops and job-card duration by live or batch entry mode. | FR-025, FT-019 | Cross-cutting | EARS-ANALYTICS-1 — WHEN a job is successfully created, the system SHALL retain its workshop, completion time, duration, and entry mode for approved KPI calculation. |
| FR-ANALYTICS-02 | Must | The system SHALL retain enough reminder data to calculate sends and attributed returns. | FR-025, FT-019 | SCR-009, SCR-014 | EARS-ANALYTICS-2 — WHEN a reminder is sent or a return is attributed, the system SHALL retain the event and its workshop linkage for approved KPI calculation. |
| FR-ANALYTICS-03 | Must | The system SHALL retain enough entitlement data to calculate paying-workshop outcomes. | FR-025, FT-019 | SCR-012, SCR-014 | EARS-ANALYTICS-3 — WHEN a Pro entitlement or collection status changes, the system SHALL retain the workshop, plan, period, and confirmed status for approved KPI calculation. |
| FR-ANALYTICS-04 | Must | The system SHALL retain a support-assistance record used in pilot support-incidence measurement. | FR-025, FR-097, FT-019 | SCR-014 | EARS-ANALYTICS-4 — WHEN qualifying pilot support is provided, the system SHALL retain the workshop, date, reason, and outcome under the approved support definition. |

**UC-ADMIN.1:** Actor: authorized support operator. Trigger: an operational
support or configuration need. Main flow: authenticate, select scope, inspect
or change one approved control, retain audit. Error flows: missing permission
hides the control; failed mutation keeps the prior value and creates no success
audit.

### 4.3 Online-first standalone workspace

| ID | Priority | Atomic requirement | Traces from | Screen | EARS acceptance criterion |
|---|---|---|---|---|---|
| FR-ONLINE-01 | Must | The system SHALL persist every successfully acknowledged MVP record in the server-backed workshop workspace. | FR-023, FR-092, FT-003 | Cross-cutting | EARS-ONLINE-1 — WHEN an MVP record save is acknowledged as successful, the system SHALL retain that record in the server-backed workshop workspace. |
| FR-ONLINE-02 | Must | The system SHALL return an acknowledged record in a later authenticated online session for the same workshop. | FR-023, FR-092, FT-003 | Cross-cutting | EARS-ONLINE-2 — WHEN the same workshop starts a later authenticated session with service connectivity, the system SHALL return its acknowledged record. |
| FR-ONLINE-03 | Must | The system SHALL operate every approved MVP workflow when TireBook is absent or unavailable. | FR-096, FT-003 | SCR-001–SCR-014 | EARS-ONLINE-3 — WHILE TireBook is absent or unavailable, the system SHALL keep every approved MVP workflow operational. |

**UC-ONLINE.1:** Actor: authenticated workshop user. Trigger: a later online
session. Main flow: authenticate, load the correct retained records, continue
work without TireBook. Error flows: no service connectivity reports an
online-first unavailable state and does not claim an unsaved record succeeded.

## 5. First paying cohort

### 5.1 Pro offline operation and synchronization

| ID | Priority | Atomic requirement | Traces from | Screen | EARS acceptance criterion |
|---|---|---|---|---|---|
| FR-OFFLINE-01 | Should | WHERE the first-paying-cohort offline capability is enabled for an eligible Pro workshop, the system SHALL keep every explicitly supported record usable without connectivity. | FR-030, FT-020 | SCR-003, SCR-011 | EARS-OFFLINE-1 — WHILE an eligible Pro workshop has approved offline capability but no connectivity, the system SHALL keep supported records available locally. |
| FR-OFFLINE-02 | Should | WHERE approved synchronization is enabled, the system SHALL reconcile supported local records after connectivity returns. | FR-030, FT-021 | Cross-cutting | EARS-OFFLINE-2 — WHEN connectivity returns to a workshop with approved synchronization enabled, the system SHALL reconcile supported local records with the workshop workspace. |
| FR-OFFLINE-03 | Should | The system SHALL preserve every acknowledged supported record through approved offline reconciliation. | FR-030, FR-093, FT-020, FT-021 | Cross-cutting | EARS-OFFLINE-3 — WHEN approved offline reconciliation completes, the system SHALL have zero silently lost acknowledged supported records. |
| FR-OFFLINE-04 | Should | The system SHALL create zero duplicate financial effects during approved synchronization. | FR-030, FR-093, FT-021 | Cross-cutting | EARS-OFFLINE-4 — WHEN repeated or concurrent synchronization is tested, the system SHALL create zero duplicate financial effects. |
| FR-OFFLINE-05 | Should | The system SHALL expose zero foreign-workshop records during approved synchronization. | FR-030, FR-093, FT-021 | Cross-cutting | EARS-OFFLINE-5 — WHEN synchronization is tested across workshops, the system SHALL return zero record belonging to another workshop. |

**UC-OFFLINE.1:** Actor: Pro owner. Trigger: connectivity is lost and later
restored. Main flow: use only approved offline records, reconnect, reconcile.
Error flows: conflicts follow a separately approved technical policy; the
system never silently loses or duplicates money effects.

## 6. P1 modules — boundary contracts only

### 6.1 Mechanics and salary

| ID | Priority | Atomic requirement | Traces from | EARS acceptance criterion |
|---|---|---|---|---|
| FR-MECH-01 | Should | WHERE the paid mechanics module is enabled, the system SHALL retain workshop-scoped mechanic records. | FR-031, FT-022 | EARS-MECH-1 — WHEN the owner saves a valid mechanic record in an enabled mechanics module, the system SHALL retain it for that workshop. |
| FR-MECH-02 | Should | WHERE the paid salary module is enabled, the system SHALL retain workshop-scoped salary records. | FR-031, FT-022 | EARS-MECH-2 — WHEN the owner saves a valid salary record in an enabled salary module, the system SHALL retain it for that workshop. |
| FR-MECH-03 | Should | The system SHALL keep owner-private money unavailable to a mechanic unless a later approved requirement explicitly grants access. | FR-031, FT-022 | EARS-MECH-3 — WHILE a mechanic lacks explicit owner-money permission, the system SHALL expose no protected owner value. |

**UC-MECH.1:** Actor: Owner. Trigger: the P1 module is enabled. Main flow:
manage approved mechanic and salary records. Error flow: mechanic access never
implicitly grants owner-money access.

### 6.2 Inventory

| ID | Priority | Atomic requirement | Traces from | EARS acceptance criterion |
|---|---|---|---|---|
| FR-INVENTORY-01 | Should | WHERE the paid inventory module is enabled, the system SHALL retain workshop-attributable stock movements. | FR-032, FT-023 | EARS-INVENTORY-1 — WHEN a valid stock movement is recorded in an enabled inventory module, the system SHALL retain it for the workshop. |
| FR-INVENTORY-02 | Should | The system SHALL calculate current item quantity from retained stock movements. | FR-032, FT-023 | EARS-INVENTORY-2 — WHEN an item's quantity is shown, the system SHALL reconcile it to that item's retained workshop movements. |

**UC-INVENTORY.1:** Actor: Owner. Trigger: stock changes. Main flow: record a
movement and review reconciled quantity. Error flow: failed or repeated input
does not create an unconfirmed duplicate movement.

### 6.3 Appointments and booking link

| ID | Priority | Atomic requirement | Traces from | EARS acceptance criterion |
|---|---|---|---|---|
| FR-APPOINT-01 | Should | WHERE the paid appointments module is enabled, the system SHALL accept a valid booking through the workshop's public link. | FR-033, FT-024 | EARS-APPOINT-1 — WHEN a valid public booking is submitted to a workshop with appointments enabled, the system SHALL retain it for the selected workshop. |
| FR-APPOINT-02 | Should | The system SHALL show retained booking-supplied vehicle and customer details to the authorized workshop. | FR-033, FT-024 | EARS-APPOINT-2 — WHEN the authorized workshop opens a retained booking, the system SHALL show its supplied vehicle and customer details. |

**UC-APPOINT.1:** Actor: Customer and workshop user. Trigger: public booking
submission. Main flow: submit, retain, open, act. Error flow: invalid submission
creates no booking.

### 6.4 Reports pack

| ID | Priority | Atomic requirement | Traces from | EARS acceptance criterion |
|---|---|---|---|---|
| FR-REPORT-01 | Should | WHERE the paid reports module is enabled, the system SHALL produce an approved report for a selected supported period. | FR-034, FT-025 | EARS-REPORT-1 — WHEN the owner selects an approved report and supported period in an enabled reports module, the system SHALL display that report. |
| FR-REPORT-02 | Should | The system SHALL reconcile every displayed report total to retained records in its period. | FR-034, FT-025 | EARS-REPORT-2 — WHEN a report total is displayed, the system SHALL make it equal the underlying retained records in the selected period. |

**UC-REPORT.1:** Actor: Owner. Trigger: a P1 report is needed. Main flow:
select approved report and period, view reconciled result. Error flow: missing
data produces an empty state rather than a fabricated value.

### 6.5 Public vehicle-history link

| ID | Priority | Atomic requirement | Traces from | EARS acceptance criterion |
|---|---|---|---|---|
| FR-HISTORY-01 | Should | WHERE public history is enabled, the system SHALL create a vehicle-history link only after an owner-approved share action. | FR-035, FT-026 | EARS-HISTORY-1 — WHEN the owner approves sharing an eligible vehicle with public history enabled, the system SHALL create its public history link. |
| FR-HISTORY-02 | Should | The system SHALL show only later-approved public vehicle-history fields through that link. | FR-035, FT-026 | EARS-HISTORY-2 — WHEN a valid public history link is opened, the system SHALL show only fields approved for public history. |
| FR-HISTORY-03 | Should | The system SHALL expose no private workshop-money value through a public history link. | FR-035, FT-026 | EARS-HISTORY-3 — WHEN any public history link is opened, the system SHALL expose zero owner-private money value. |

**UC-HISTORY.1:** Actor: Owner and Customer. Trigger: owner shares public
history. Main flow: approve link, customer opens without Garazo. Error flow:
invalid link or unapproved field reveals no history.

## 7. L2 modules — boundary contracts only

### 7.1 Multi-branch

| ID | Priority | Atomic requirement | Traces from | EARS acceptance criterion |
|---|---|---|---|---|
| FR-BRANCH-01 | Could | WHERE a future multi-branch entitlement is enabled, the system SHALL keep branch-scoped records separated by selected branch. | FR-040, FT-027 | EARS-BRANCH-1 — WHEN an authorized owner selects a branch with multi-branch enabled, the system SHALL show only records permitted for that branch. |
| FR-BRANCH-02 | Could | The system SHALL show an owner aggregate only when a later approved permission allows it. | FR-040, FT-027 | EARS-BRANCH-2 — WHEN an authorized aggregate is requested, the system SHALL include only branches permitted for that owner. |

**UC-BRANCH.1:** Actor: authorized owner. Trigger: branch selection. Main flow:
select branch, work within its scope, optionally view approved aggregate. Error
flow: unauthorized branch data is absent.

### 7.2 Fleet-customer accounts

| ID | Priority | Atomic requirement | Traces from | EARS acceptance criterion |
|---|---|---|---|---|
| FR-FLEET-01 | Could | WHERE fleet accounts are enabled, the system SHALL distinguish fleet vehicles and jobs from retail customer records. | FR-041, FT-028 | EARS-FLEET-1 — WHEN an authorized fleet is opened with fleet accounts enabled, the system SHALL identify its vehicles and jobs as fleet-scoped. |
| FR-FLEET-02 | Could | The system SHALL distinguish fleet bills and balances from retail customer records. | FR-041, FT-028 | EARS-FLEET-2 — WHEN an authorized fleet account is opened, the system SHALL identify its bills and balances as fleet-scoped. |

**UC-FLEET.1:** Actor: authorized workshop user. Trigger: fleet account work.
Main flow: select fleet, manage its approved records. Error flow: retail and
other-fleet records are not mixed into the selected fleet context.

### 7.3 TireBook ecosystem link

| ID | Priority | Atomic requirement | Traces from | EARS acceptance criterion |
|---|---|---|---|---|
| FR-TIREBOOK-01 | Could | WHERE the L2 integration is enabled, the system SHALL receive only a booking covered by explicit user consent through an approved versioned contract. | FR-042, FT-029 | EARS-TIREBOOK-1 — WHEN a consented valid booking is received through an enabled approved TireBook version, the system SHALL retain the approved booking data. |
| FR-TIREBOOK-02 | Could | WHERE the L2 integration is enabled, the system SHALL send only service-history fields covered by explicit user consent through an approved versioned contract. | FR-042, FT-030 | EARS-TIREBOOK-2 — WHEN a consented service-history event is sent through an enabled approved TireBook version, the system SHALL transfer only approved fields. |
| FR-TIREBOOK-03 | Could | The system SHALL keep Garazo workflows operational when TireBook is unavailable. | FR-042, FT-029, FT-030 | EARS-TIREBOOK-3 — IF TireBook is unavailable, THEN the system SHALL keep standalone Garazo workflows operational. |

**UC-TIREBOOK.1:** Actor: consenting user, TireBook, workshop. Trigger: future
booking or history exchange. Main flow: verify consent/version, exchange only
approved data. Error flow: unavailable integration queues or rejects the
exchange without blocking Garazo.

### 7.4 VAT invoice

| ID | Priority | Atomic requirement | Traces from | EARS acceptance criterion |
|---|---|---|---|---|
| FR-VAT-01 | Could | WHERE VAT invoicing is enabled, the system SHALL issue a VAT invoice only when later-approved required invoice data is present. | FR-043, FT-031 | EARS-VAT-1 — WHEN a VAT invoice is requested with VAT invoicing enabled and all approved required data present, the system SHALL issue the VAT invoice. |
| FR-VAT-02 | Could | The system SHALL link each issued VAT invoice to its originating bill. | FR-043, FT-031 | EARS-VAT-2 — WHEN a VAT invoice is issued, the system SHALL retain its originating bill linkage. |

**UC-VAT.1:** Actor: Owner. Trigger: future VAT invoice request. Main flow:
confirm approved data, issue, retain bill link. Error flow: missing required
data blocks issue.

## 8. Non-functional requirements

| ID | Priority | Quantified requirement | Traces from | Verification |
|---|---|---|---|---|
| NFR-PERF-01 | Must | The median completed minimum new-job-card time SHALL be 45 seconds or less in the pilot measurement. | FR-090, BR-013 | Timed pilot sessions, separated by live and batch entry mode |
| NFR-SEC-01 | Must | Cross-workshop authorization tests SHALL return zero foreign-workshop records. | FR-091, BR-005, BR-009 | Automated tenant-isolation suite |
| NFR-SEC-02 | Must | Locked shared-device tests SHALL reveal zero due, bill-due, money-summary, reminder-ROI, profit, or attributed-income values before valid owner-PIN authorization. | FR-091, Q-004, SCR-002, SCR-005–SCR-010, SCR-012–SCR-013 | UI, API, accessibility-tree, cache, and error-state tests |
| NFR-SEC-03 | Must | An explicit lock SHALL hide 100% of currently displayed protected values immediately. | FR-014, Q-004 | Protected-route UI and state tests |
| NFR-SEC-04 | Must | Unauthorized admin tests SHALL expose zero admin control and zero protected support result. | FR-024, FR-091, SCR-014 | Admin authorization suite |
| NFR-REL-01 | Must | 100% of successfully acknowledged MVP records in the defined persistence suite SHALL be retrievable in a fresh authenticated online session for the same workshop. | FR-092 | Persistence/reconnect suite |
| NFR-REL-02 | Should | Approved offline/sync tests SHALL produce zero silently lost acknowledged record. | FR-093 | First-paying-cohort record-preservation suite |
| NFR-REL-03 | Should | Approved offline/sync tests SHALL produce zero duplicate financial effect. | FR-093 | First-paying-cohort financial-idempotency suite |
| NFR-REL-04 | Should | Approved offline/sync tests SHALL expose zero foreign-workshop record. | FR-093 | First-paying-cohort tenant-isolation suite |
| NFR-I18N-01 | Must | 100% of released owner-app screens SHALL have approved Bangla and English content. | FR-094 | Locale inventory against released `SCR-###` screens |
| NFR-I18N-02 | Must | Language switching SHALL change zero stored business-data value. | FR-094 | Before/after data comparison |
| NFR-I18N-03 | Must | Bangladesh-specific presentation SHALL be supplied by the BD region profile rather than unrelated domain-record fields. | FR-094 | Configuration and schema review |
| NFR-A11Y-01 | Must | Every released screen and reusable component SHALL meet WCAG AA for applicable contrast, focus, naming, and keyboard/switch access checks. | FR-095, approved design v1 | Automated checks plus manual screen/component review |
| NFR-USABILITY-01 | Must | The minimum job path SHALL require only one non-empty plate and one selected problem icon. | FR-095 | Minimum-path acceptance test |
| NFR-USABILITY-02 | Must | The minimum job path SHALL require zero optional text field. | FR-095 | Minimum-path acceptance test |
| NFR-INDEPENDENCE-01 | Must | 100% of MVP acceptance tests SHALL pass with TireBook absent or unavailable. | FR-096 | MVP suite with integration disabled |
| NFR-ADOPTION-01 | Must | By month 4, approved pilot reporting SHALL be able to identify 100 workshops with at least 10 job cards. | FR-097 | KPI query over retained pilot events |
| NFR-ADOPTION-02 | Must | By month 4, qualifying support incidence SHALL be no more than 5% of the 100-workshop target cohort under the human-approved support definition. | FR-097 | KPI query after `Q-006` is answered |

## 9. Owner-PIN security detail awaiting approval

The approved privacy boundary is fixed: protected values stay hidden until the
owner PIN succeeds. Exact relock, retry, and recovery parameters remain open in
`Q-005`; they must be quantified before SRS approval. No technical auth
architecture is selected here.

## 10. Traceability declaration

| Source set | Coverage |
|---|---|
| PRD functional requirements | `FR-001`–`FR-025`, `FR-030`–`FR-035`, and `FR-040`–`FR-043` map to at least one `FR-<AREA>-NN` above |
| PRD non-functional requirements | `FR-090`–`FR-097` map to `NFR-*` and supporting functional requirements |
| Feature list | `FT-001`–`FT-031` remain represented without changing release boundaries |
| Design | `SCR-001`–`SCR-014` are referenced where a UI contract exists |
| Human decisions | `Q-003` and `Q-004` are incorporated; `Q-005` and `Q-006` remain open |

## 11. Explicitly out of scope

- POS or restaurant/menu operation
- Insurance billing
- OBD diagnostics
- Ride-hailing
- A marketplace
- Authorized-dealer ERP requirements
- P1 or L2 implementation before its separate detailed approval
- Any unapproved field, API, stack, architecture, datastore, queue, or auth strategy

## 12. Open questions

| ID | Blocks | Decision needed |
|---|---|---|
| Q-005 | SRS approval | Quantified owner-PIN inactivity relock, failed-attempt cooldown, and recovery behavior |
| Q-006 | SRS approval | The operational definition of a workshop that “requires support” for the ≤5% pilot KPI |

## Handoff → Human SRS approval

- Produced by: Codex PM role on 2026-07-27 · Status: draft
- **Decided (do not reopen without escalating):** locked source v1, approved
  MVP/P1/L2 boundaries, 14 approved screens, first-class batch entry, separate
  authorized admin, and owner-PIN masking from Q-004.
- **Open (`Q-###`):** Q-005 and Q-006 block approval.
- **Watch out:** P1 and L2 requirements are boundary contracts, not permission
  to invent detailed fields or begin implementation.
- **Next stage must:** answer Q-005 and Q-006, update this draft, pass the human
  `srs_approval` gate, then run `/trace`.
- **Must NOT change without a D-### + human ping:** requirement meaning,
  priorities, release boundaries, privacy law, standalone rule, or non-goals.
