# Idea — Garazo

- Status: captured at kickoff
- Profile: `medium` (human-selected)
- Source inputs: approved BRD v1 and approved HTML prototype v1
- Captured: 2026-07-26

## Working name

Garazo.

## One-liner

A mobile-first management app for Bangladesh's informal vehicle workshops to
manage jobs, customers, billing, dues, daily cash, and service reminders.

## Target users

The buyer and primary user is the Bangla-speaking owner or ustad of an informal
bike, CNG, car, or truck workshop. Head mechanics are secondary users with
limited views. Customers do not install the app; they receive bills, reminders,
and optional service-history links.

The initial beachhead is independent bike workshops, followed by CNG/auto and
car workshops. Authorized dealer service centers and ERP-led formal workshops
are explicitly outside the target market.

## Problem

Most target workshops run from paper khata, wall notes, and memory. That causes
lost job details, forgotten dues, weak daily cash visibility, and missed repeat
service. Existing garage ERPs are too formal and sales-heavy for these shops.
Garazo must create the first job card quickly, work in Bangla, and show direct
financial value through recovered dues and returning customers.

## Product idea

The launch product combines:

- Fast job cards with plate capture, problem icons, voice notes, and optional
  details.
- A customer and vehicle book that builds from job activity.
- Billing, payments, dues, WhatsApp sharing, and SMS.
- Owner-private money summaries protected by a PIN.
- Service reminders with measurable returned-customer revenue.
- Expenses and remotely configured monetization.

Paid follow-on modules cover mechanics and salary, inventory, appointments, and
reports. Multi-branch, fleet accounts, TireBook integration, and VAT invoices
are deferred until demand validates them.

## Known constraints

- Bangladesh-first and global-ready, with Bangla and English support.
- Mobile-first and Android-first; the BRD's Flutter direction must be recorded
  through the human foundational-decision gate during `/tech-plan`.
- The minimum job card needs only a plate and one problem icon.
- Median job-card creation must be 45 seconds or less.
- Owner money data must be private from mechanic-level users.
- Manual plate entry must remain available when OCR fails.
- The product must remain useful without TireBook or another ecosystem product.
- Offline and multi-device synchronization are paid capabilities planned for
  the first paying cohort.

## Success in six months

- Reach 100 workshops with at least 10 job cards by month 4, with no more than
  5% needing support.
- Have 30% of active shops send at least one service reminder per month by
  month 6.
- Keep median new-job-card time at 45 seconds or less.
- Show a rising monthly `reminder_returned` count.
- Validate recovered dues, reminder ROI, yearly pricing, and wholesaler-led
  distribution through the pilot.

## Locked v1 input baseline

Per the project owner's answer to `Q-001`, BRD v1 and HTML prototype v1 are the
complete planning inputs for v1. The companion documents named inside the BRD
are not part of this version. No missing companion document blocks planning.

The v1 source files are locked. Any addition, removal, or content change to the
BRD or HTML prototype creates v2 and must trigger the normal version and
traceability ripple.

## PRD precondition

`Q-002` records the human decision required before `/prd`: whether to create a
BRD v2 that adds only the harness-required IDs, metadata, and Handoff while
preserving the locked v1 business content and meaning.
