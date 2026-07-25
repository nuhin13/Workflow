# Garazo — Business Requirements Document (FINAL)
## Garage & Service-Center Management · Bangladesh-first, global-ready

**Version 1.0 (locked) · July 2026 · Droid Builder Ltd**
**Status:** Confidential — Internal · **Owner:** Founder / Product Lead
**Companion docs:** `Garazo_Feature_Specs.md` (every feature in detail) · `Garazo_Design_Brief.md` (for Claude Design)

**Name:** Garazo — LOCKED by founder. Due-diligence note (founder aware, accepted): a `garazo.nl` garage-management software exists in the Netherlands — same name, same category, but a small Netherlands-only operation with zero current market overlap with Bangladesh/South Asia. Trademarks are territorial, so a BD/South-Asia launch is low-risk; the same-category overlap is a flag to manage before any Europe expansion. Action items: DPDT trademark filing (BD) and a defensive mark strategy before any global push, distinct logo/branding, secure the garazo.org/.xyz/.life domains founder identified, FB page.

**Tagline (bn):** গ্যারেজের সব হিসাব, পকেটেই।
**Tagline (en):** Run your whole garage from your pocket.

---

## 1. What Garazo is

Garazo is a mobile-first management app for vehicle workshops — the ustad-run garages that fix bikes, cars, CNGs and trucks across Bangladesh. It replaces the paper khata, wall-writing, and memory with five things a workshop actually needs:

1. **Job cards** — what vehicle came in, what's wrong, when it's promised.
2. **A customer & vehicle book** that builds itself.
3. **Billing and dues** — clean bills to WhatsApp, baki never forgotten.
4. **A daily money picture** — today's income, expense, dues in one glance.
5. **A service-reminder engine** that brings customers back automatically — the feature that makes the shop money, not just records it.

## 2. Who it's for

| Persona | Description | Role |
|---|---|---|
| **Salam, 38 — Owner/Ustad** | Bike + CNG workshop, 6 workers, Bikrampur galli. Bangla only, bKash daily, one smartphone. Fears forgotten dues and dead afternoons. | Buyer + primary user |
| **Head mechanic** | Runs jobs when Salam is away. May resist money transparency. | Secondary user (limited views) |
| **Customer** | Never installs anything. Receives the bill on WhatsApp, the reminder SMS, sees history if asked. | Beneficiary |
| **Anti-persona** | Authorized dealer service centers with computers and ERPs (Vehicles Lab's market). | Not targeted |

Beachhead order: bike workshops first (largest count, simplest jobs, youngest owners) → CNG/auto → car.

## 3. Market position (summary — full analysis in `Garage_Market_Problem_Analysis.md`)

- ~6M registered vehicles, motorcycle-heavy and young — servicing demand grows for a decade.
- Estimated 30–60K workshops; **80–90% are informal Tier-3 shops that no software vendor can reach**, because incumbents (Vehicles Lab, GarageBox) sell ERP through demo calls to the formal top.
- **Garazo's wedge is distribution, not features:** self-serve Play Store install, first job card in 5 minutes, Bangla, offline, no demo call. Sell *up* from the phone; never down from ERP.
- The paper khata is the real competitor. Garazo beats it on recovered dues and returned customers — measurable money, not "digitization."

## 4. The two design laws (carried across the Polygon platform)

**Law 1 — Confirm, don't type.** Capture data at the moment it's created, with the phone doing the reading: plate photo, problem icons, voice notes, preset price lists, big number pads. A job card requires only a plate (photo or typed) and at least one problem icon. Everything else is optional.

**Law 2 — The owner's money is private.** Money summaries, profit, and dues sit behind an owner PIN. The mechanic sees his jobs; the owner sees the money. This single rule defuses the biggest human obstacle to adoption (staff resistance).

## 5. Scope at a glance

| Layer | Modules | When |
|---|---|---|
| **MVP (L0)** | Shop setup · Job cards ★ · Customer & vehicle book · Billing, payments & dues · Daily cash summary · Service reminders ★ · Expenses · Monetization | Launch |
| **P1 (paid modules)** | Mechanics & salary · Inventory (real stock) · Appointments & booking link · Reports pack | Launch +2–4 mo |
| **L2** | Multi-branch · Fleet-customer accounts · TireBook ecosystem link (bookings in, history out) · VAT invoice | By demand |
| **Non-goals** | POS/menus, insurance billing, OBD diagnostics, ride-hailing, marketplace | Never (this product) |

Every feature above is specified in detail in `Garazo_Feature_Specs.md`.

## 6. Platform & surfaces

| Surface | What | Notes |
|---|---|---|
| **Owner app** | Flutter, Android-first, Play Store | Full features. Free = online mode (server-backed, data never lost). Paid = full offline + multi-device sync. |
| **Customer touchpoints** | WhatsApp bill (image/PDF), SMS reminders, optional public history link per vehicle | Customer never installs anything |
| **Admin portal** | Polygon platform portal reused | Pricing remote-config, flags/kill-switch, referral audit, support lookup, metrics |

Reused from the Polygon platform: auth (phone OTP), tenants + RLS, append-only ledger, billing engine, SMS outbox, voice/photo input kit, notifications, admin portal, bn/en ARB i18n with region-profile architecture (BD profile ships first; global later is config, not code).

## 7. Monetization

| Tier | Price (remote-config; founder sets final) | Includes |
|---|---|---|
| **Free** | ৳0, light banner ads | 30 job cards/month, 1 device, full billing & customer book, manual WhatsApp sharing |
| **Pro** | ~৳400/month or ~৳4,000/year (intro ~৳2,500/yr, collected yearly at onboarding via bKash unlock code) | Unlimited job cards, **service-reminder engine**, no ads, reports, 2nd device, offline + sync |
| **SMS credits** | ~৳1/SMS packs (cost ~৳0.25–0.35) | Bills, due reminders, service reminders |
| **P1 modules** | +৳150–250/month each | Mechanics/salary · Inventory · Appointments |

Sales logic: the Pro pitch is one screen — "রিমাইন্ডার পাঠানো হয়েছে ১২টি · কাস্টমার ফিরেছে ৩ জন = আয় ৳X". One returning customer pays for the year.

## 8. Go-to-market

1. **Pilot:** 10 bike workshops in one para, hand-onboarded, 6 weeks of iteration.
2. **Launch channels:** parts wholesalers as ambassadors (referral codes — they visit hundreds of shops), mechanic Facebook groups, "recovered dues" testimonial reels in Bangla, shop-front sticker ("এই গ্যারেজ Garazo-তে চলে"), SPOC build-in-public series.
3. **Collection reality:** yearly fee collected at onboarding (cash/bKash), field-agent or wholesaler-assisted. Monthly card billing will not work at Tier 3.

## 9. KPIs

| Area | Metric | Target |
|---|---|---|
| Adoption | Workshops with 10+ job cards, ≤5% needing support | 100 shops by month 4 |
| The money loop | Shops sending ≥1 service reminder/month | 30% of active shops by month 6 |
| North star | `reminder_returned` count (customer came back from a reminder) | Rising monthly |
| Speed | New job card median time | ≤45 seconds |
| Revenue | Paying shops | 150 Pro shops (~৳50–75K MRR) by month 9 |
| Ecosystem | `booking_received` (when TireBook link ships) | Demand signal |

## 10. Risks

| Risk | Mitigation |
|---|---|
| Incumbents launch a "lite" mobile tier | Their demo-sales channel conflict buys 12–18 months; win the Tier-3 brand and offline capability first |
| Mechanic resists transparency | Owner-PIN money views (Law 2); give the mechanic his own value: job list, no memory work |
| Behavior change mid-rush | Batch end-of-day entry mode is first-class, not a fallback |
| OCR fails on dirty plates | Manual entry always prominent; OCR is delight, not dependency |
| SMS cost abuse | Reminders are Pro-only; free tier shares bills via WhatsApp manually |
| Seasonality (Eid rush) + collection ops | Yearly pricing smooths revenue; wholesaler-assisted collection |

## 11. Field validation (founder conducts before build — 5 bike + 3 car/CNG shops)

1. Photograph how the last 3 jobs were recorded (khata/wall/memory).
2. Quantify dues: how many written last month, how many recovered, how much probably forgotten?
3. Show the reminder concept and the ROI screen — watch the face at "customers return automatically."
4. Time a real job card on the prototype with a vehicle standing outside (target ≤45s unaided).
5. Ask about Vehicles Lab or any software (expect: never heard — verifies the distribution gap).
6. Price test: ৳2,500/year — instant yes, haggle, or no?
7. Who else would touch the app? (delegation reality → mechanic-module demand)
8. Wholesaler interview: would you recommend an app to your shop customers for a referral fee?

**Revision triggers:** forgotten-dues under ৳2K/month (weakens wedge #1 → lead with reminders) · reminder concept lands flat (lead with dues/billing) · nobody will hold the phone during jobs (elevate batch mode to the primary flow).

## 12. The ecosystem seam (L2 — designed now, built later)

Garazo and TireBook connect through a versioned public API with per-booking user consent:

1. **Bookings in:** a TireBook user taps "book a service" → nearby Garazo shops → the shop receives an appointment with the vehicle profile prefilled.
2. **History out:** the shop closes a job on a plate claimed by a consenting TireBook user → the service record (work, parts, cost, odometer, next-service date) appears in the owner's TireBook automatically.
3. **The loop:** Garazo's reminder fires → lands in TireBook free (or SMS) → one tap re-books.

Rule: Garazo must be 100% valuable standalone. The link is compounding upside, never a dependency.

## 13. Delivery pipeline

1. This BRD + `Garazo_Feature_Specs.md` → epic/task generation in the khatir/harness convention.
2. `Garazo_Design_Brief.md` → Claude Design → clickable prototype (screens & flows listed there).
3. Design tokens + BRD + specs + platform data model → Claude Code build.
4. MVP ships online-first; offline + sync land with the first paying cohort. Pilot per §8.
