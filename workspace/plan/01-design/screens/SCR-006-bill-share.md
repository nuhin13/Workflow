# SCR-006 — Bill share preview

- Traces from: FT-008 / FR-012; FT-016 / FR-021; FT-017 /
  FR-022, FR-094 · Prototype: `prototype/SCR-006-bill-share.html`
- Provenance: locked HTML prototype v1 `data-screen-label="S5 Bill share preview"`
- Status: approved
- Last updated: 2026-07-27

## Purpose

The owner reviews a customer-safe bill and shares or saves it.

## Entry & exit

- Entry points: SCR-005 share action after a saved bill.
- Exit points: back returns to SCR-005; WhatsApp hands off to the device;
  SMS uses credit when supported; save stores the bill file.

## Layout

A dark full-screen route asks for the owner PIN before showing a bill with a
due. The unlocked view centers a white bill card and share actions.

## Content & data

| Element | Component | Data source | Notes |
|---|---|---|---|
| Workshop and customer | Bill card | workshop, customer, vehicle | customer receives no account requirement |
| Bill lines and totals | Bill card | saved job bill | due appears only after PIN success |
| Share actions | Button | device share, SMS wallet, local save | WhatsApp is primary |

## States (all required)

- Default: the PIN gate hides bill-due and share actions.
- Loading: preview generation shows progress before actions enable.
- Empty: a job without bill lines cannot enter this screen.
- Error: render or handoff failure keeps the preview and offers retry.
- Edge (long text, many items, offline, permissions): long bills paginate in
  export; canceled share returns here; missing WhatsApp offers system share;
  zero SMS credit opens SCR-012 without a sent record.

## Interactions

| Trigger | Behavior | Validation | Result |
|---|---|---|---|
| Enter PIN | Unlock protected bill | valid owner PIN | show bill and actions |
| WhatsApp | Create approved image or PDF and open share handoff | rendered bill | external chooser |
| SMS | Send supported bill link or payload | positive credit and send success | deduct once |
| Save | Save approved bill file | storage permission if needed | success notice |

## Accessibility notes

The preview has a linear reading order. Action labels name the channel.
Generation and share results are announced.

## Open questions

| ID | Question | Status |
|---|---|---|
| Q-004 | A bill with due now requires the owner PIN before preview or sharing. | answered |
