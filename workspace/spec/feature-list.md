# SRS Feature List — Garazo

- Version: 1
- Status: approved with SRS v1 on 2026-07-29
- Date: 2026-07-29
- Source: `workspace/spec/srs.md`
- Traces to: epics after SRS approval and `/trace`

One line below represents one atomic SRS functional requirement. Priorities and
release stages are inherited unchanged.

## MVP

### Shop setup and access

| SRS ID | Capability | Priority |
|---|---|---|
| FR-ACCESS-01 | Save confirmed workshop setup | Must |
| FR-ACCESS-02 | Open operational home after setup | Must |
| FR-ACCESS-03 | Authenticate owner by approved phone OTP | Must |
| FR-ACCESS-04 | Hide all workshop data after failed authentication | Must |
| FR-ACCESS-05 | Restrict session to authorized workshop | Must |
| FR-ACCESS-06 | Select Bangla or English interface | Must |
| FR-ACCESS-07 | Relock after explicit lock | Must |
| FR-ACCESS-08 | Relock after leaving protected route | Must |
| FR-ACCESS-09 | Relock after app background | Must |
| FR-ACCESS-10 | Relock after 5 minutes protected-area inactivity | Must |
| FR-ACCESS-11 | Apply 60/120/240-second progressive PIN cooldown | Must |
| FR-ACCESS-12 | Reject PIN verification during cooldown | Must |
| FR-ACCESS-13 | Recover PIN through registered-phone OTP | Must |
| FR-ACCESS-14 | Preserve PIN after invalid recovery OTP | Must |
| FR-ACCESS-15 | Reset failure escalation after successful verification or recovery | Must |

### Job cards and workflow

| SRS ID | Capability | Priority |
|---|---|---|
| FR-JOB-01 | Save a plate-plus-problem minimum job | Must |
| FR-JOB-02 | Block a job without a plate | Must |
| FR-JOB-03 | Block a job without a problem icon | Must |
| FR-JOB-04 | Skip optional capture aids | Must |
| FR-JOB-05 | Retain supplied optional capture values | Must |
| FR-JOB-06 | Use manual plate fallback | Must |
| FR-JOB-07 | Show supplied promised timing | Must |
| FR-JOB-08 | Apply allowed job transition | Must |
| FR-JOB-09 | Retain status history | Must |
| FR-JOB-10 | PIN-protect batch entry | Must |
| FR-JOB-11 | Produce live-equivalent batch records | Must |
| FR-JOB-12 | Retain batch business date | Must |
| FR-JOB-13 | Preserve drafts after failed batch save | Must |
| FR-JOB-14 | Prevent duplicate batch effects | Must |

### Customer and vehicle book

| SRS ID | Capability | Priority |
|---|---|---|
| FR-CUSTOMER-01 | Build customer and vehicle records from an unknown-plate job | Must |
| FR-CUSTOMER-02 | Link known plate without vehicle duplication | Must |
| FR-CUSTOMER-03 | Search customer and vehicle identifiers | Must |
| FR-CUSTOMER-04 | Show chronological service history | Must |
| FR-CUSTOMER-05 | Mask customer due values while locked | Must |

### Billing, payments, and dues

| SRS ID | Capability | Priority |
|---|---|---|
| FR-BILLING-01 | Calculate bill total from charge lines | Must |
| FR-BILLING-02 | Retain bill with job | Must |
| FR-BILLING-03 | Retain payment against bill | Must |
| FR-BILLING-04 | Calculate remaining balance | Must |
| FR-BILLING-05 | Create tracked due for positive balance | Must |
| FR-BILLING-06 | Show zero due after full payment | Must |
| FR-BILLING-07 | PIN-protect due and payment values | Must |
| FR-BILLING-08 | Show unlocked customer balances | Must |
| FR-BILLING-09 | Record due-reminder action | Must |
| FR-BILLING-10 | Apply due recovery exactly once | Must |

### Daily cash summary

| SRS ID | Capability | Priority |
|---|---|---|
| FR-CASH-01 | PIN-protect daily money view | Must |
| FR-CASH-02 | Show approved daily categories together | Must |
| FR-CASH-03 | Reconcile categories to entries | Must |
| FR-CASH-04 | Calculate net position | Must |
| FR-CASH-05 | Hide protected values on lock | Must |

### Service reminders

| SRS ID | Capability | Priority |
|---|---|---|
| FR-REMINDER-01 | Retain next-service timing | Must |
| FR-REMINDER-02 | Queue next-service reminder | Must |
| FR-REMINDER-03 | Gate automated reminders by Pro | Must |
| FR-REMINDER-04 | Send one reminder per due occurrence | Must |
| FR-REMINDER-05 | Mark successful reminder sent | Must |
| FR-REMINDER-06 | Link return job to reminder | Must |
| FR-REMINDER-07 | Count attributed return once | Must |
| FR-REMINDER-08 | Reconcile reminder ROI values | Must |
| FR-REMINDER-09 | Mask reminder ROI while locked | Must |

### Expenses

| SRS ID | Capability | Priority |
|---|---|---|
| FR-EXPENSE-01 | Retain valid categorized expense | Must |
| FR-EXPENSE-02 | Include expense in business-day ledger | Must |
| FR-EXPENSE-03 | Apply expense to net exactly once | Must |

### Monetization and SMS credits

| SRS ID | Capability | Priority |
|---|---|---|
| FR-PLAN-01 | Count Free jobs per month | Must |
| FR-PLAN-02 | Enforce 30-job Free limit | Must |
| FR-PLAN-03 | Enforce one Free device | Must |
| FR-PLAN-04 | Limit Free advertising to approved light surfaces | Must |
| FR-PLAN-05 | Validate Pro activation | Must |
| FR-PLAN-06 | Preserve data across entitlement changes | Must |
| FR-PLAN-07 | Expose entitled Pro capabilities | Must |
| FR-PLAN-08 | Hide unavailable Pro actions | Must |
| FR-PLAN-09 | Display SMS-credit balance | Must |
| FR-PLAN-10 | Add approved purchased or assigned credits | Must |
| FR-PLAN-11 | Consume one credit per successful SMS | Must |
| FR-PLAN-12 | Block SMS at zero credits | Must |

### Customer touchpoints

| SRS ID | Capability | Priority |
|---|---|---|
| FR-SHARE-01 | Prepare approved WhatsApp bill artifact | Must |
| FR-SHARE-02 | Share without customer Garazo install | Must |
| FR-SHARE-03 | PIN-protect a bill due before share | Must |

### Admin and pilot evidence

| SRS ID | Capability | Priority |
|---|---|---|
| FR-ADMIN-01 | Authorize admin controls | Must |
| FR-ADMIN-02 | Scope remote configuration | Must |
| FR-ADMIN-03 | Scope feature flags | Must |
| FR-ADMIN-04 | Scope kill switches | Must |
| FR-ADMIN-05 | Audit successful admin mutations | Must |
| FR-ADMIN-06 | Read scoped referral audit | Must |
| FR-ADMIN-07 | Restrict support lookup | Must |
| FR-ADMIN-08 | Show scoped approved metrics | Must |
| FR-ANALYTICS-01 | Retain job adoption and duration evidence | Must |
| FR-ANALYTICS-02 | Retain reminder outcome evidence | Must |
| FR-ANALYTICS-03 | Retain paying-workshop evidence | Must |
| FR-ANALYTICS-04 | Retain qualifying support evidence | Must |

### Online-first standalone workspace

| SRS ID | Capability | Priority |
|---|---|---|
| FR-ONLINE-01 | Persist acknowledged MVP records | Must |
| FR-ONLINE-02 | Retrieve records in later online session | Must |
| FR-ONLINE-03 | Operate MVP without TireBook | Must |

## First paying cohort

| SRS ID | Capability | Priority |
|---|---|---|
| FR-OFFLINE-01 | Use approved Pro records offline | Should |
| FR-OFFLINE-02 | Reconcile after reconnect | Should |
| FR-OFFLINE-03 | Preserve acknowledged records | Should |
| FR-OFFLINE-04 | Prevent duplicate financial sync effects | Should |
| FR-OFFLINE-05 | Prevent cross-workshop sync exposure | Should |

## P1 boundary contracts

| SRS ID | Capability | Priority |
|---|---|---|
| FR-MECH-01 | Retain mechanic records | Should |
| FR-MECH-02 | Retain salary records | Should |
| FR-MECH-03 | Preserve mechanic money privacy | Should |
| FR-INVENTORY-01 | Retain stock movements | Should |
| FR-INVENTORY-02 | Calculate stock quantity | Should |
| FR-APPOINT-01 | Accept valid public booking | Should |
| FR-APPOINT-02 | Show booking-supplied details | Should |
| FR-REPORT-01 | Produce approved period report | Should |
| FR-REPORT-02 | Reconcile report totals | Should |
| FR-HISTORY-01 | Create owner-approved public history link | Should |
| FR-HISTORY-02 | Show only approved public fields | Should |
| FR-HISTORY-03 | Exclude private workshop money | Should |

## L2 boundary contracts

| SRS ID | Capability | Priority |
|---|---|---|
| FR-BRANCH-01 | Separate branch-scoped records | Could |
| FR-BRANCH-02 | Restrict owner aggregates to permitted branches | Could |
| FR-FLEET-01 | Distinguish fleet vehicles and jobs | Could |
| FR-FLEET-02 | Distinguish fleet bills and balances | Could |
| FR-TIREBOOK-01 | Receive consented versioned bookings | Could |
| FR-TIREBOOK-02 | Send consented versioned service history | Could |
| FR-TIREBOOK-03 | Continue without TireBook | Could |
| FR-VAT-01 | Issue VAT invoice from approved data | Could |
| FR-VAT-02 | Link VAT invoice to bill | Could |

## Handoff

- Status: approved with SRS v1.
- Deferred: `Q-006` freezes NFR-ADOPTION-02 until an approved amendment.
- Next: `/trace` assigns delivery coverage without renumbering these IDs.
