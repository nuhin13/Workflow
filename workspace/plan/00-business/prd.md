# PRD — Garazo

- ID prefix: `FR-###`
- Version: 1
- Status: approved
- Traces from: locked BRD v1 (`BR-###` trace anchors below)
- Traces to: Features (`FT-###`), Screens (`SCR-###`)
- UI reference: locked HTML prototype v1
- Last updated: 2026-07-26

## 1. Product summary

Garazo is a mobile-first workshop management product for informal vehicle
garages in Bangladesh. It helps an owner or ustad capture jobs quickly, keep a
customer and vehicle record, issue bills, track payments and dues, understand
daily cash, and bring customers back through service reminders. The first
release targets independent bike workshops and must be usable in Bangla without
requiring customers to install an app.

### BRD v1 trace anchors

The approved BRD v1 is an external, locked source document. The aliases below
give derived artifacts stable trace IDs without modifying or extending that
source. The cited BRD section remains authoritative if an alias summary is ever
ambiguous.

| ID | Exact BRD v1 source | Source requirement summary |
|---|---|---|
| BR-001 | §1, "What Garazo is" | Replace paper and memory with job cards, customer and vehicle records, billing and dues, daily money visibility, and service reminders. |
| BR-002 | §2, "Who it's for" | Serve owner/ustad buyers first, support limited mechanic use, keep customers app-free, and exclude formal dealer service centers. |
| BR-003 | §3, "Market position" | Be self-serve, Bangla-first, simple to start, and suitable for informal workshops rather than demo-led ERP buyers. |
| BR-004 | §4, Law 1 | Confirm rather than type; require only a plate and at least one problem icon for a job card; keep other capture optional. |
| BR-005 | §4, Law 2 | Keep owner money information behind an owner PIN while non-owner users see operational work only. |
| BR-006 | §5, MVP row | Launch shop setup, job cards, customer and vehicle book, billing/payments/dues, daily cash, service reminders, expenses, and monetization. |
| BR-007 | §5, P1/L2/non-goals rows | Defer mechanics/salary, inventory, appointments, reports, multi-branch, fleet accounts, TireBook, and VAT as stated; exclude listed non-goals. |
| BR-008 | §6, "Platform & surfaces" | Provide an Android-first owner app plus WhatsApp bills, SMS reminders, optional public history links, and admin support capabilities. |
| BR-009 | §6, "Reused from the Polygon platform" | Carry forward phone OTP, tenant isolation, ledger, billing, messaging, media input, notifications, admin, and bn/en region-profile needs for technical planning. |
| BR-010 | §7, Free tier | Limit Free to 30 job cards per month and one device, with billing/customer records and manual WhatsApp sharing. |
| BR-011 | §7, Pro/SMS/P1 rows | Provide Pro entitlements, yearly onboarding collection, SMS-credit packs, and paid P1 modules as described. |
| BR-012 | §8, "Go-to-market" | Pilot with 10 bike workshops and instrument the launch and assisted onboarding model. |
| BR-013 | §9, "KPIs" | Measure adoption, reminder use and return, job-card speed, paying shops, and ecosystem demand. |
| BR-014 | §10, "Risks" | Support shared-device privacy, end-of-day batch entry, manual plate fallback, Pro-only automated reminders, and yearly collection realities. |
| BR-015 | §11, "Field validation" | Validate real workflows, dues, reminders, speed, pricing, delegation, and distribution before build assumptions harden. |
| BR-016 | §12, "The ecosystem seam" | Keep Garazo standalone and defer consent-based TireBook booking/history integration until L2. |
| BR-017 | §13, "Delivery pipeline" | Build from the approved business and design sources; ship online-first and add offline/sync with the first paying cohort. |

## 2. Personas

| Persona | Goals | Frustrations | Tech comfort |
|---|---|---|---|
| Owner/Ustad (primary buyer and user) | Know every active job, collect dues, see private money totals, and bring customers back | Paper records, forgotten dues, rush-hour typing, staff seeing private money | Low to moderate; Bangla-first, one shared Android phone |
| Head mechanic (secondary user) | See and progress assigned workshop jobs without carrying details in memory | Repeated questions, unclear priorities, and unnecessary money visibility | Low to moderate; needs a direct operational view |
| Workshop customer (beneficiary) | Receive a clear bill and timely service reminder without installing an app | Lost paper bills and forgotten service dates | Uses WhatsApp and SMS; no Garazo account expected |
| Founder/support operator (stakeholder) | Configure offers, assist workshops, inspect support data, and measure adoption | Inconsistent field onboarding and weak product evidence | Comfortable with an admin portal |
| Authorized dealer service center (anti-persona) | N/A — intentionally outside the target segment | Garazo does not provide a full dealer ERP | N/A |

## 3. User journeys (happy paths first)

### Journey A — Set up and capture the first job

1. The owner installs Garazo and completes shop setup.
2. The owner starts a job card and captures or types the vehicle plate.
3. The owner confirms at least one problem icon and may add optional details.
4. Garazo saves the job, customer, and vehicle relationship.
5. The workshop sees the job in its current work list within the 45-second
   target.

### Journey B — Finish work, collect payment, and share a bill

1. The owner or permitted worker opens an active job and records completed
   work and charges.
2. The owner creates a clean bill and records full or partial payment.
3. Any unpaid balance becomes a customer due.
4. The owner shares the bill with the customer through WhatsApp.
5. The job becomes part of the vehicle's service history.

### Journey C — Recover a due

1. The owner opens the due list and sees each customer balance.
2. The owner sends a due reminder through an allowed channel.
3. When money is collected, the owner records the payment.
4. Garazo reduces the due and reflects the receipt in the daily money view.

### Journey D — Bring a customer back

1. At delivery, the owner records or confirms the next service timing.
2. Garazo places the service reminder in the appropriate queue.
3. An eligible reminder is sent to the customer.
4. When the customer returns, the workshop records the return against the
   reminder.
5. The owner sees reminders sent, customers returned, and attributed income.

### Journey E — Check private daily money

1. The owner opens the money area on a shared workshop phone.
2. Garazo asks for the owner PIN.
3. After a valid PIN, Garazo shows today's income, expenses, dues, and net
   position.
4. Locking or leaving the protected area hides those values again.

### Journey F — Enter work after the rush

1. The workshop completes work while the phone cannot be used during the rush.
2. The owner opens the first-class batch entry flow later that day.
3. The owner records the jobs and money entries from the available notes.
4. Garazo includes those entries in customer history, dues, and daily totals.

## 4. Product requirements

| ID | Requirement | Traces from | Priority | Acceptance criteria (testable) |
|---|---|---|---|---|
| FR-001 | The owner can complete initial shop setup and reach the operational app. | BR-006, BR-008 | Must | Given a first-time owner, when required shop setup information is confirmed, then Garazo saves the shop context and opens the workshop's operational home. |
| FR-002 | The owner can access the correct workshop through the approved phone-authentication and tenant model selected during technical planning. | BR-009 | Must | Given a registered workshop owner, when valid authentication is completed, then the owner enters only that workshop's data context; when authentication fails, no workshop data is shown. |
| FR-003 | A job card can be created with only a vehicle plate and at least one problem icon. | BR-004, BR-006 | Must | Given an owner starting a job, when a non-empty plate and one or more problem icons are confirmed, then the job can be saved; when either minimum input is absent, save is blocked with a clear indication of what is missing. |
| FR-004 | Plate photo, typed plate, voice notes, problem icons, photos, preset prices, and other details remain optional fast-capture aids where the approved design provides them. | BR-004, BR-009 | Must | Given a new job, when the user skips any optional capture aid, then the minimum job can still be saved; when an optional value is supplied, then it remains attached to that job. |
| FR-005 | Manual plate entry remains prominent when plate photo/OCR capture is skipped or fails. | BR-004, BR-014 | Must | Given unavailable or unsuccessful plate recognition, when the user chooses manual entry and supplies a plate, then job creation can continue without retrying OCR. |
| FR-006 | A job records the reported problem and promised timing and can move through the approved work states until delivery. | BR-001, BR-006 | Must | Given a saved job, when an allowed status change is confirmed, then the current state and promised timing are visible in the work list and the transition remains in that job's history. |
| FR-007 | End-of-day batch entry is a first-class path for jobs and related money records. | BR-014 | Must | Given work completed without live entry, when the owner uses batch entry later that day, then each valid job and money record is saved with the correct business date and appears in the same records as live entries. |
| FR-008 | Customer and vehicle records build from job-card activity without requiring a separate customer setup first. | BR-001, BR-004 | Must | Given a job for an unknown plate, when the job is saved with available customer details, then Garazo creates and links the customer and vehicle records; given a known plate, it links the job to the existing vehicle instead of creating a duplicate. |
| FR-009 | Users can find customer and vehicle records and review their linked service history. | BR-001, BR-008 | Must | Given stored records, when a user searches using an available customer or vehicle identifier, then matching records are shown and opening one displays its linked jobs in chronological context. |
| FR-010 | The owner can create a clean bill from recorded work and charges. | BR-001, BR-006 | Must | Given a job with recorded charges, when billing is confirmed, then Garazo calculates and displays the bill total from those charges and retains the bill with the job. |
| FR-011 | The owner can record full or partial payment, and any unpaid balance becomes a tracked due. | BR-001, BR-006 | Must | Given a bill total, when a payment below the outstanding amount is recorded, then the payment is retained and the remainder appears as a customer due; when the full outstanding amount is recorded, then the bill has no remaining due. |
| FR-012 | The owner can share a customer bill manually through WhatsApp in the supported bill format. | BR-008, BR-010 | Must | Given a saved bill, when the owner chooses WhatsApp sharing, then Garazo prepares the approved image or PDF bill for the selected customer without requiring the customer to install Garazo. |
| FR-013 | The owner can review customer dues and send due reminders using available SMS credits or manual sharing paths. | BR-001, BR-011 | Must | Given one or more outstanding dues, when the owner opens the due view, then each balance is visible; when a permitted reminder is sent, then the reminder action is recorded and any consumed SMS credit is deducted once. |
| FR-014 | Money summaries and due-sensitive owner values are protected by an owner PIN on a shared device. | BR-005, BR-014 | Must | Given a locked money area, when an invalid PIN is entered, then private values remain hidden; when the valid owner PIN is entered, then the authorized values become visible until the area is locked again. |
| FR-015 | The owner can see today's income, expenses, dues, recovered dues, and net money position in one place. | BR-001, BR-006 | Must | Given money entries for the current day, when the authorized owner opens the daily money view, then each category and the resulting net value match the underlying entries. |
| FR-016 | The owner can record workshop expenses and have them included in money totals. | BR-006 | Must | Given a valid expense amount and category, when the owner saves it, then the expense appears in the ledger and reduces the applicable net total exactly once. |
| FR-017 | The owner can set a next-service timing at delivery and eligible Pro workshops can send service reminders. | BR-001, BR-006, BR-011 | Must | Given a job being delivered, when a next-service timing is confirmed, then a reminder is queued for that vehicle; given an eligible Pro entitlement and available delivery credit/channel, when the reminder is approved or automatically becomes due under the selected rule, then it is sent once and marked sent. |
| FR-018 | Garazo records reminder-driven customer returns and shows reminder ROI to the owner. | BR-001, BR-013 | Must | Given a sent service reminder, when the returning visit is attributed to it, then `reminder_returned` increases once and the owner-facing sent, returned, and attributed-income values reflect the recorded data. |
| FR-019 | The Free tier enforces 30 job cards per month, one device, light ads, and the included billing/customer capabilities. | BR-010 | Must | Given a Free workshop below its monthly limit, when it saves a valid job, then the monthly count increases; given the limit has been reached, when another save is attempted, then the job is not added and the upgrade path is shown. |
| FR-020 | Pro entitlement unlocks the BRD-defined Pro capabilities without changing Free workshop records. | BR-011 | Must | Given a valid Pro activation under the approved collection method, when activation is confirmed, then Pro capabilities become available and existing workshop data remains intact; when entitlement is absent, Pro-only actions remain unavailable. |
| FR-021 | SMS credits can be purchased or assigned, displayed, and consumed by bill or reminder sends. | BR-011 | Must | Given a known credit balance, when one bill or reminder SMS is successfully sent, then the balance decreases by one; when the balance is zero, an SMS send is blocked without creating a sent record. |
| FR-022 | The owner app supports Bangla and English content and number presentation according to the approved region profile. | BR-003, BR-009 | Must | Given either supported language selection, when the owner changes language, then the supported interface content changes consistently and saved business data remains unchanged. |
| FR-023 | The initial Free experience is server-backed and online-first so saved workshop data remains available after a new authenticated session. | BR-008, BR-017 | Must | Given a successfully saved record and a later authenticated session with service connectivity, when the workshop data is loaded, then that record is present and belongs to the correct workshop. |
| FR-024 | Authorized support operators can manage remote pricing/configuration, feature flags or kill switches, referral audit, support lookup, and product metrics through the reused admin surface. | BR-008, BR-009 | Must | Given an authorized support operator, when a supported remote setting is changed, then the change is auditably retained and only its intended workshop/product scope is affected; unauthorized users cannot access the operation. |
| FR-025 | The pilot captures the usage and outcome data needed to evaluate BRD adoption, reminder, speed, support, and pricing assumptions. | BR-012, BR-013, BR-015 | Must | Given pilot activity, when KPI reports are produced, then the underlying events can calculate active workshops with 10+ jobs, job-card duration, reminder sends/returns, support incidence, and paying-workshop outcomes without manual reconstruction. |
| FR-030 | Pro workshops receive full offline operation and multi-device synchronization with the first paying cohort. | BR-008, BR-017 | Should | Given a Pro workshop working without connectivity, when supported records are created or changed, then they remain usable locally; when connectivity returns, the records synchronize without silent loss or cross-workshop exposure. |
| FR-031 | A paid mechanics and salary module supports the P1 scope. | BR-007, BR-011 | Should | Given the module is enabled, when the owner manages mechanic and salary records, then those records are retained for that workshop and mechanic access still excludes owner-private money views unless explicitly authorized by approved requirements. |
| FR-032 | A paid inventory module provides real stock tracking in P1. | BR-007, BR-011 | Should | Given the module is enabled, when stock-affecting activity is recorded, then the item's current quantity reflects the recorded movements and remains attributable to the workshop. |
| FR-033 | A paid appointments module provides a workshop booking link in P1. | BR-007, BR-011 | Should | Given the module is enabled and a valid booking is submitted through the workshop link, when the workshop opens appointments, then the booking and supplied vehicle/customer details are available for action. |
| FR-034 | A paid reports pack provides the P1 reporting capability. | BR-007, BR-011 | Should | Given reportable workshop data and an enabled reports module, when the owner selects a supported report period, then the displayed totals reconcile to the underlying records for that period. |
| FR-035 | An optional public vehicle-history link can be shared without requiring the customer to install Garazo. | BR-008 | Should | Given an eligible vehicle and owner-approved share action, when the public link is opened, then only the approved vehicle-history fields are shown and private workshop money data is absent. |
| FR-040 | Multi-branch workshop operation is available only when L2 demand justifies it. | BR-007 | Could | Given a future multi-branch entitlement, when an authorized owner selects a branch, then branch-scoped records and permitted aggregate views remain correctly separated. |
| FR-041 | Fleet-customer accounts are available only when L2 demand justifies them. | BR-007 | Could | Given a future fleet account, when its authorized records are viewed, then the vehicles, jobs, bills, and balances associated with that fleet can be distinguished from retail customer records. |
| FR-042 | TireBook integration exchanges consented bookings and service history through a versioned API while Garazo remains independently usable. | BR-016 | Could | Given explicit consent and an available integration, when a supported booking or service-history event is exchanged, then only the approved data is transferred and Garazo workflows continue if TireBook is unavailable. |
| FR-043 | VAT invoices are available only when L2 demand justifies them. | BR-007 | Could | Given VAT invoicing is enabled and required invoice data is present, when an invoice is issued, then it contains the configured VAT details and remains linked to the originating bill. |

Rules applied:

- Every `FR-###` traces to at least one stable BRD v1 trace anchor.
- The HTML prototype corroborates navigation and states but does not create
  requirements absent from BRD v1.
- Separate mechanic accounts, stock behavior, appointment details, report
  contents, multi-branch rules, fleet rules, API contracts, and VAT fields must
  be specified in their later approved scope before implementation.

## 5. Non-functional requirements

| ID | Category (perf/security/a11y/i18n/reliability) | Requirement | Traces from | Measure |
|---|---|---|---|---|
| FR-090 | Performance/usability | A new job card must be fast enough for use during workshop work. | BR-004, BR-013 | Median completed new-job-card time is 45 seconds or less during the pilot measurement. |
| FR-091 | Security/privacy | Workshop data is tenant-isolated and owner-private money values require owner authorization. | BR-005, BR-009 | Cross-workshop access tests return no foreign data; locked/shared-device tests reveal no protected money value before valid owner authorization. |
| FR-092 | Reliability | Server-backed records must not silently disappear between valid online sessions. | BR-008, BR-017 | A successfully acknowledged save can be retrieved after a fresh authenticated session for the same workshop. |
| FR-093 | Reliability/offline | Paid offline and sync must preserve supported records through connectivity loss and reconciliation. | BR-008, BR-017 | Defined offline/sync test cases complete without silent record loss, duplicate financial effects, or cross-workshop data exposure. |
| FR-094 | Internationalization | Bangladesh ships first in Bangla and English, while regional behavior remains configurable for later markets. | BR-003, BR-009 | All released owner-app screens have approved bn/en content; switching language does not alter saved business data; BD-specific configuration is not hard-coded into unrelated domain records. |
| FR-095 | Accessibility/usability | Core rush-hour actions must use the approved confirm-first, low-typing interaction model. | BR-004 | The minimum job journey requires only a plate and one problem icon, keeps manual plate entry available, and does not require optional text fields. |
| FR-096 | Independence | Garazo must deliver its complete approved standalone value without TireBook. | BR-016 | All MVP acceptance tests pass with TireBook integration absent or unavailable. |
| FR-097 | Adoption quality | Early users must be able to reach habitual use with limited assisted support. | BR-013 | By month 4, the measured cohort can identify 100 workshops with 10+ job cards while no more than 5% of that target cohort requires support under the agreed support definition. |

## 6. Analytics & success measurement

| Outcome | Required event or measure | Required properties | BRD target |
|---|---|---|---|
| Active-workshop adoption | `job_card_created` and workshop active count | workshop, created time, capture duration, entry mode | 100 workshops with 10+ job cards by month 4 |
| Support burden | Support-assistance record linked to workshop | workshop, date, reason, resolution | No more than 5% of the target cohort needing support |
| Reminder use | `service_reminder_sent` | workshop, vehicle, reminder type, channel, sent time | 30% of active shops send at least one per month by month 6 |
| North star | `reminder_returned` | workshop, reminder, return job, attributed value, recorded time | Rising monthly |
| Job speed | New-job capture duration | workshop, start/end, live or batch, minimum/expanded job | Median 45 seconds or less |
| Revenue | Active Pro entitlement and recognized collection | workshop, plan, period, activation/collection status | 150 Pro shops by month 9 |
| Ecosystem demand | `booking_received` when L2 ships | source, workshop, consent state, booking status | Demand signal; no v1 numerical target |

Analytics must avoid exposing owner-private money to unauthorized workshop roles.
The event and consent design is finalized during SRS and technical planning.

## 7. Release strategy

### MVP launch cut

The MVP contains `FR-001` through `FR-025` and `FR-090` through `FR-092`,
`FR-094` through `FR-097`. It launches online-first to the 10-workshop bike
pilot and includes the Free/Pro/SMS entitlement model needed to validate the
business loop.

### First paying cohort

`FR-030` and `FR-093` add paid offline operation and multi-device sync after the
online-first MVP is stable enough for the first paying cohort.

### P1 paid modules

`FR-031` through `FR-035` cover mechanics/salary, inventory, appointments,
reports, and the optional public history link. Their detailed product contracts
must be approved before implementation.

### L2 by validated demand

`FR-040` through `FR-043` cover multi-branch, fleet customers, TireBook, and VAT
invoicing. They are not part of the MVP or P1 commitment.

### Explicitly out of scope

The product does not include POS/menus, insurance billing, OBD diagnostics,
ride-hailing, or a marketplace. Authorized dealer ERP requirements are also
outside the target product.

## 8. Open questions

No blocking product-scope questions are open. `Q-001` and `Q-002` are answered
in `workspace/open-questions.md`; both confirm continued planning from the
locked v1 source set without modifying it.

## Handoff → Feature derivation

- Produced by: Codex analyst on 2026-07-26 · Status: approved
- **Decided (do not reopen without escalating):** BRD v1 and HTML prototype v1
  are the complete locked sources; trace anchors are aliases to exact BRD
  sections, not source changes; the MVP is online-first; offline/sync follows
  with the first paying cohort; P1 and L2 remain outside the MVP cut; the
  project owner approved the PRD v1 scope and MVP cut on 2026-07-26.
- **Open (`Q-###`):** N/A — no blocking scope question remains.
- **Watch out:** BRD references to Flutter, auth, datastore behavior, and reused
  Polygon capabilities remain inputs to the foundational human decisions in
  `/tech-plan`; this PRD does not select their implementation.
- **Next stage must:** derive `FT-###` items through `/features`, prove complete
  MVP `FR-###` coverage, and decompose any `XL` feature before handoff.
- **Must NOT change without a D-### + human ping:** locked BRD v1 or HTML
  prototype v1, the confirm-don't-type minimum job, owner-private money, the
  standalone-product rule, MVP/P1/L2 boundaries, or explicit non-goals.
