# SCR-008 — Customer detail

- Traces from: FT-006 / FR-008, FR-009; FT-012 / FR-017; FT-013 /
  FR-018; FT-017 / FR-022, FR-094 ·
  Prototype: `prototype/SCR-008-customer-detail.html`
- Provenance: locked HTML prototype v1 `data-screen-label="S6 Customer detail"`
- Status: approved
- Last updated: 2026-07-27

## Purpose

The workshop reviews a customer’s vehicles, service history, due, and next
service timing.

## Entry & exit

- Entry points: SCR-007 customer row; due-related customer links from SCR-009.
- Exit points: back returns to the source list; call opens the device dialer.

## Layout

A dark customer header shows phone, a masked due cue, and call action. Each
vehicle card keeps non-money service details visible.

## Content & data

| Element | Component | Data source | Notes |
|---|---|---|---|
| Customer header | App shell, Status badge | customer and current due | amount stays masked |
| Vehicle card | Content card | linked vehicle | plate is primary |
| Service timeline | Status badge, Content card | delivered jobs and attribution | newest first |
| Next service | Status badge | queued reminder | timing only |

## States (all required)

- Default: one or more vehicle histories.
- Loading: keep customer identity while vehicle cards load.
- Empty: a vehicle with no delivered job states that history is empty.
- Error: isolate a failed vehicle history and offer retry.
- Edge (long text, many items, offline, permissions): many vehicles and visits
  scroll; unknown odometer shows a dash; non-owner access keeps due masked and
  never gains private money summaries.

## Interactions

| Trigger | Behavior | Validation | Result |
|---|---|---|---|
| Tap call | Open device dialer | available phone | external dialer |
| Review timeline | Read linked jobs | permitted record | same screen |
| Follow due context | Return or navigate to dues | outstanding balance | SCR-009 |

## Accessibility notes

Vehicle cards have headings. Timeline events use list semantics and readable
dates. Call control includes the customer name.

## Open questions

| ID | Question | Status |
|---|---|---|
| Q-004 | The due amount is masked; non-money vehicle and job history stays visible. | answered |
