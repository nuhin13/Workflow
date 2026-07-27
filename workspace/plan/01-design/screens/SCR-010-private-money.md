# SCR-010 — Private money

- Traces from: FT-010 / FR-014, FR-091; FT-011 / FR-015, FR-016;
  FT-017 / FR-022, FR-094 ·
  Prototype: `prototype/SCR-010-private-money.html`
- Provenance: locked HTML prototype v1 `data-screen-label="S8 Money"`;
  `data-screen-label="S8 PIN gate"`;
  `data-screen-label="S8 Entries drill-down"`;
  `data-screen-label="S8 Quick expense"`
- Status: approved
- Last updated: 2026-07-27

## Purpose

The owner unlocks private money, reviews daily and monthly totals, and records
an expense.

## Entry & exit

- Entry points: SCR-002 money card, bottom money navigation, quick expense.
- Exit points: explicit lock returns to the PIN gate; navigation leaves and
  protects values according to the approved session rule.

## Layout

The locked state centers a four-digit keypad. The open state shows daily rows,
net money, monthly rows, expense action, and lock action. Entry details and
expense capture open as sheets.

## Content & data

| Element | Component | Data source | Notes |
|---|---|---|---|
| PIN gate | Numeric keypad, Feedback | owner authorization | no private value before success |
| Today and month | Money summary | income, expense, due, recovery ledger | reconciled categories |
| Entry detail | Bottom sheet, Content card | selected ledger category | no cross-workshop records |
| Quick expense | Bottom sheet, Numeric keypad, Selection chip | amount and category | one financial effect |
| Lock | Button | protected session | immediate mask |

## States (all required)

- Default: PIN gate when locked; summaries when authorized.
- Loading: authorization and ledger load reveal no amount.
- Empty: valid zero-value day states that no entries exist.
- Error: invalid PIN clears input and keeps all money hidden; ledger failure
  hides totals rather than showing stale values.
- Edge (long text, many items, offline, permissions): repeated invalid PIN is
  handled by the later security contract; large entry lists scroll; duplicate
  expense submit applies once; shared-device leave and timeout re-lock.

## Interactions

| Trigger | Behavior | Validation | Result |
|---|---|---|---|
| Enter PIN | Verify four digits | valid owner PIN | reveal current money |
| Tap category | Open entry sheet | authorized owner | filtered ledger rows |
| Add expense | Open keypad and category sheet | authorized owner | save once and recalculate |
| Lock | Clear protected view | none | PIN gate |

## Accessibility notes

The PIN has a hidden descriptive label and no spoken digits. Invalid PIN uses
text and live announcement. Currency rows include sign and category.

## Open questions

| ID | Question | Status |
|---|---|---|
| N/A | PIN retry, timeout, and recovery rules belong to SRS and the human-selected auth strategy. | N/A |
