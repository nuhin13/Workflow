# SCR-012 — Pro and SMS offer

- Traces from: FT-014 / FR-019; FT-015 / FR-020; FT-016 / FR-021;
  FT-017 / FR-022, FR-094 ·
  Prototype: `prototype/SCR-012-pro-offer.html`
- Provenance: locked HTML prototype v1 `data-screen-label="S11 Paywall"`
- Status: approved
- Last updated: 2026-07-27

## Purpose

The owner understands locked Pro value and can start the approved activation or
buy SMS credit.

## Entry & exit

- Entry points: Free cap warning, locked reminders, Settings plan or SMS action,
  zero-credit send attempt.
- Exit points: close returns to the opener; successful activation returns with
  Pro state; SMS purchase returns with updated credit.

## Layout

A near-full-height dark sheet presents a Pro badge, reminder proof, benefits,
the approved price card, activation action, and SMS pack card.

## Content & data

| Element | Component | Data source | Notes |
|---|---|---|---|
| Pro proof | Money summary | retained sent, returned, attributed outcome | masked here; PIN route reveals it |
| Benefits | Content card, Status badge | approved Pro entitlement copy | no new P1 promises |
| Price and activation | Content card, Button | approved price input | collection method remains a later contract |
| SMS pack | Content card, Button | approved pack and wallet | credit changes after success only |

## States (all required)

- Default: Free owner sees the offer with ROI proof masked.
- Loading: activation or purchase action shows progress and disables repeats.
- Empty: no reminder history uses benefit copy without fabricated ROI.
- Error: failed activation or purchase keeps Free and credit state unchanged.
- Edge (long text, many items, offline, permissions): long localized benefits
  scroll; canceled payment returns here; unauthorized users cannot buy or see
  protected ROI; offline cannot claim activation success.

## Interactions

| Trigger | Behavior | Validation | Result |
|---|---|---|---|
| Reveal proof | Open protected money context | valid owner PIN | SCR-010 |
| Unlock Pro | Start approved collection flow | authorized owner | entitlement after confirmed success |
| Buy SMS | Start approved credit flow | authorized owner | wallet increases after confirmed success |
| Close | Dismiss offer | none | return to opener |

## Accessibility notes

Focus starts at the offer heading, not close. Price includes period. Benefits
are a list. Purchase status is announced and repeat activation is disabled.

## Open questions

| ID | Question | Status |
|---|---|---|
| Q-004 | Offer proof stays masked outside the owner-PIN context. | answered |
