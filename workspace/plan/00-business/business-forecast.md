# Business Forecast — Garazo

- ID prefix: `FC-###`
- Status: approved
- Traces from: locked BRD v1 (`BR-###`), approved PRD v1 (`FR-###`), approved feature list v1 (`FT-###`)
- Traces to: Features and technical planning topics for capacity, scale, cost, and operations
- Last updated: 2026-07-26

This forecast is a planning envelope, not a sales commitment. The technical
plan must cite `FC-###` IDs when it uses these figures.

Every figure below states its basis and confidence. A locked input has high
confidence as an approved requirement. That does not make the outcome likely.

## 1. Demand forecast

### Market and business checkpoints

| ID | Metric | Approved input or estimate | Basis | Confidence |
|---|---|---:|---|---|
| FC-001 | Bangladesh market context | About 6 million registered vehicles; 30,000–60,000 workshops; 80%–90% informal | Locked BRD v1 §3. These figures are approved planning inputs but have not been independently checked here. | Medium |
| FC-002 | Adoption quality checkpoint | 100 active workshops by M+4; each has at least 10 job cards; no more than 5% need support | Locked BRD v1 §9 and approved `FR-097`. This is a target, not observed demand. | High as an input; low as an outcome forecast |
| FC-003 | Pro conversion and revenue checkpoint | 150 Pro workshops and about ৳50,000–৳75,000 monthly recurring revenue by M+9 | Locked BRD v1 §9 and approved PRD v1 §6. This is a target, not observed conversion. | High as an input; low as an outcome forecast |

### Expected demand and load

| ID | Metric | M+3 | M+6 | M+12 | Basis (evidence or guess) | Confidence |
|---|---:|---:|---:|---:|---|---|
| FC-004 | Registered workshops | 90 | 220 | 550 | Operating guess. It supports the locked M+4 active-workshop target and later wholesaler-led acquisition. No acquisition data exists yet. | Low |
| FC-005 | Active workshops | 70 | 160 | 400 | Operating guess anchored to `FC-002`. “Active” means at least 10 lifetime job cards, matching the approved KPI. | Low |
| FC-006 | Total owner and operator accounts | 100 | 260 | 700 | Derived guess from `FC-004`. It assumes about 1.1, 1.2, and 1.3 accounts per registered workshop, rounded. | Low |
| FC-007 | Daily active accounts (DAU) | 35 | 80 | 200 | Derived guess. It assumes 50% of active workshops use Garazo on a working day, with one active account each. | Low |
| FC-008 | Peak concurrent accounts | 5 | 12 | 30 | Derived guess. It assumes 15% of DAU overlaps during a busy period, rounded. | Low |
| FC-009 | Job cards created per month | 2,800 | 6,400 | 16,000 | Derived guess from `FC-005`. It assumes 40 job cards per active workshop each month. | Low |
| FC-010 | Cumulative stored data | 10 GB | 40 GB | 180 GB | Operating guess. It assumes about 2 MB retained per job, optional media use, growth ramp, and system overhead. | Low |
| FC-011 | Peak application request rate | 8 requests/second | 18 requests/second | 45 requests/second | Derived guess from `FC-008`. It allows about 1.5 requests per concurrent account each second during bursts. | Low |
| FC-012 | SMS sends per month | 300 | 1,500 | 5,600 | Operating guess. Participation and sends per participating shop rise from 20% and 20 at M+3, to 30% and 30 at M+6, then 40% and 35 at M+12. Values are rounded; dues add some traffic. | Low |

The job-card estimate drives the main record load. Optional photos and voice
notes drive more storage uncertainty than structured records.

## 2. Revenue / cost model (if applicable)

| ID | Item | Model | M+6 estimate | M+12 estimate | Confidence |
|---|---|---|---|---|---|
| FC-013 | Pro workshops | Expected path toward the locked `FC-003` checkpoint | 80 Pro workshops | 240 Pro workshops | Low. No pilot conversion data exists. |
| FC-014 | Pro subscription revenue | Locked prices: about ৳400 monthly, ৳4,000 yearly, or ৳2,500 introductory yearly. Estimates show monthly recognized value. | About ৳16,700–৳32,000 per month | About ৳50,000–৳96,000 per month | Medium for arithmetic; low for price mix, collection, churn, and revenue treatment. |
| FC-015 | SMS sales and supplier cost | Locked sale price is about ৳1 per SMS. Locked cost is about ৳0.25–৳0.35. Volume comes from `FC-012`. | Sales: ৳1,500; cost: ৳375–৳525; gross margin: ৳975–৳1,125 per month | Sales: ৳5,600; cost: ৳1,400–৳1,960; gross margin: ৳3,640–৳4,200 per month | Medium for unit-price arithmetic; low for send volume and failed-send treatment. |
| FC-016 | Product infrastructure | Monthly operating envelope. It excludes payroll, field sales, taxes, and payment fees. | ৳15,000–৳40,000 per month | ৳30,000–৳90,000 per month | Low. This is an operating guess without selected architecture or supplier quotes. |
| FC-017 | Workshops needing support | Upper planning envelope of 5% of active workshops from `FC-002` | Up to 8 workshops per measurement period | Up to 20 workshops per measurement period | Low. The 5% target is locked, but the support definition and period need field validation. |
| FC-018 | P1 module and ad revenue | Excluded until take-up, launch timing, and ad economics have approved evidence | Not modeled | Not modeled | High for the exclusion; low for future revenue potential. |

`FC-014` exposes a pricing tension. At the introductory yearly price, 150 Pro
shops equal about ৳31,250 in monthly recognized value. At ৳4,000 yearly, they
equal about ৳50,000.

The locked `FC-003` target is about ৳50,000–৳75,000 monthly recurring revenue
at 150 Pro shops. This forecast keeps the target and records the mix variance.

The project owner decided on 2026-07-26 that pricing is not a key planning
factor. This variance stays visible, but it does not gate Design or technical
planning.

## 3. Growth scenarios

| ID | Scenario at M+12 | Registered workshops | Active workshops | DAU | Peak concurrent | Job cards/month | Pro workshops | Pro revenue/month | Basis | Confidence |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| FC-019 | Conservative | 250 | 150 | 60 | 9 | 6,000 | 90 | ৳18,750–৳36,000 | Pilot works, but referrals and conversion remain slow. Revenue uses the locked intro-to-monthly price range. | Low |
| FC-020 | Expected — technical planning baseline | 550 | 400 | 200 | 30 | 16,000 | 240 | ৳50,000–৳96,000 | Matches `FC-004` through `FC-014`. It assumes the M+4 and M+9 business checkpoints remain reachable. | Low |
| FC-021 | Aggressive — upgrade-path test | 1,200 | 900 | 450 | 68 | 36,000 | 550 | ৳114,600–৳220,000 | Wholesaler referrals work early and several local clusters adopt. Revenue uses the locked intro-to-monthly price range. | Low |

- **Conservative:** The product misses the M+9 Pro target. Distribution and
  paid conversion need review before capacity work grows.
- **Expected:** Technical planning uses `FC-020` as the initial planning
  envelope. Actual pilot evidence replaces its guesses.
- **Aggressive:** Technical planning must name the first constraint and a safe
  upgrade path. Media storage, outbound messaging, and support operations need
  explicit checks.

### Lowest-confidence risks

| Forecast IDs | Risk | What would raise confidence |
|---|---|---|
| FC-004, FC-005, FC-013 | Acquisition, activation, and Pro conversion have no observed funnel data. | The 10-workshop pilot and the first wholesaler referral cohort. |
| FC-007, FC-008, FC-009 | Daily use, busy-hour overlap, and job frequency are operating guesses. | Instrumented job activity from the pilot. |
| FC-010 | Optional photo and voice use may change storage by several times. | Media-size and attachment-rate measurements. |
| FC-012, FC-015 | Reminder participation and send frequency are unknown. | SMS queue, delivery, credit, and reminder-use data. |
| FC-014 | Intro pricing can miss the locked revenue range even if the Pro-shop target is met. This is not a phase gate. | Review observed price mix, collection, and churn after the pilot. |
| FC-016 | Infrastructure cost has no selected architecture or supplier quote. | Human-approved technical choices and current supplier quotes. |
| FC-017 | “Needs support” lacks a fixed measurement period and classification rule. | A definition approved before pilot reporting starts. |

## 4. Forecast → engineering implications

These rows name decision topics. They do not select a stack, supplier,
datastore, queue, authentication method, or architecture.

| FC ID | Implication | Feeds decision topic |
|---|---|---|
| FC-001 | The reachable market is much larger than the first-year envelope. Tenant and regional boundaries must not assume one local cluster forever. | Tenant boundary and regional expansion strategy |
| FC-002 | Pilot analytics must prove active use, job counts, and support incidence by the approved checkpoint. | Analytics event contract and KPI reporting |
| FC-003 | Entitlement and collection records must support the paying-shop checkpoint without redefining Pro. | Entitlement, collection, and revenue reporting |
| FC-004 | Registration can reach hundreds of workshops before M+12. Onboarding and tenant creation need measured failure handling. | Onboarding capacity and operational observability |
| FC-005 | Active-workshop counts drive record volume, support load, and scheduled work. | Capacity baseline and active-tenant measurement |
| FC-006 | More than one account per workshop becomes normal over time. Access design must preserve owner-private money rules. | Account, role, and workshop-access model |
| FC-007 | DAU is modest, but daily use makes availability and session recovery visible to workshops. | Availability target and session behavior |
| FC-008 | Expected concurrency is low. The plan must still record a measured scale-up trigger. | Initial capacity envelope and scaling trigger |
| FC-009 | Job cards are the main business write path. Financial effects and repeated submissions need exact handling. | Write-path integrity, idempotency, and data growth |
| FC-010 | Media dominates storage. Retention, compression, upload failure, and access control need explicit policies. | Media storage, retention, privacy, and cost controls |
| FC-011 | Request load is small in every first-year scenario. Load testing should validate the envelope and burst assumptions. | Performance budget and load-test plan |
| FC-012 | Messaging volume needs credit checks, send deduplication, retries, and delivery evidence. | Messaging workflow and supplier-capacity review |
| FC-013 | Pro growth affects offline, sync, second-device, and reminder demand. | Entitlement rollout and deferred-capability capacity |
| FC-014 | Price mix changes reported revenue but is not a capacity driver. Keep reporting separate from entitlement and cash collection. | Revenue reporting — non-gating |
| FC-015 | SMS margin depends on successful-send accounting and supplier cost. | SMS ledger, failed-send treatment, and cost monitoring |
| FC-016 | Cost is uncertain until humans select the foundations. The plan needs cost telemetry and review thresholds. | Infrastructure cost model and observability |
| FC-017 | Support volume needs consistent reasons and outcomes, not free-text reconstruction. | Support taxonomy and admin reporting |
| FC-018 | P1 and ad revenue cannot justify MVP capacity or scope. | Scope guardrails and later monetization evidence |
| FC-019 | Weak growth should not force unnecessary infrastructure work. | Conservative operating mode and spend controls |
| FC-020 | This is the baseline for first-year capacity and cost validation. | Expected capacity, storage, messaging, and cost envelope |
| FC-021 | The plan must state what reaches a limit first and how operators detect it. | Aggressive-scenario upgrade path and alerting |

## 5. Review cadence

Review the forecast after each pilot cycle and at the M+4, M+6, M+9, and M+12
checkpoints referenced above. Replace guesses with observed cohort data.

Review it sooner when acquisition, job volume, media use, SMS volume, or
support materially departs from its cited `FC-###` envelope.

Each review must record the changed `FC-###` rows and notify technical planning.
Any linked plan disagreement must follow the repository discrepancy process.

## Handoff → Design

- Produced by: Codex analyst on 2026-07-26 · Status: approved
- **Decided (do not reopen without escalating):** locked BRD and PRD targets
  remain inputs; approved prices remain inputs; P1 and ad revenue remain
  unmodeled; pricing is not a key planning factor or phase gate; no
  foundational technical choice is made here.
- **Open (`Q-###`):** N/A — no blocking design question is created.
- **Watch out:** `FC-004` through `FC-021` are mostly low-confidence planning
  envelopes. The pilot must replace them with measured data. Pricing variance
  remains informational and non-blocking.
- **New trace IDs:** `FC-001` through `FC-021`; `/trace` must index all 21.
- **Next stage must:** use the approved HTML prototype as visual input; preserve
  the confirm-first job flow, owner-private money, online-first MVP, and
  measurable pilot events.
- **Must NOT change without a D-### + human ping:** locked BRD v1, approved PRD
  v1, approved feature list v1, business targets, prices, release boundaries,
  design laws, or explicit non-goals.
