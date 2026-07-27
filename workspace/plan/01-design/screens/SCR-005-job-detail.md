# SCR-005 — Job detail and billing

- Traces from: FT-005 / FR-006; FT-007 / FR-010, FR-011; FT-012 /
  FR-017; FT-013 / FR-018; FT-017 / FR-022, FR-094 ·
  Prototype: `prototype/SCR-005-job-detail.html`
- Provenance: locked HTML prototype v1 `data-screen-label="S3 Job detail"`;
  `data-screen-label="S4 Billing sheet"`; `data-screen-label="S4 Payment"`;
  `data-screen-label="S9 Next service sheet"`
- Status: approved
- Last updated: 2026-07-27

## Purpose

The workshop progresses a job, builds its bill, records payment, and sets the
next service at delivery.

## Entry & exit

- Entry points: SCR-002 or SCR-003 job row; SCR-004 successful save.
- Exit points: back returns to SCR-003; share opens SCR-006; delivery returns
  to the jobs board after the next-service sheet.

## Layout

A dark record header leads into a four-step status rail. Cards show problems,
optional media, promise, bill lines, payments, and history. Billing, payment,
and next service open as bottom sheets. The current valid action stays fixed.

## Content & data

| Element | Component | Data source | Notes |
|---|---|---|---|
| Job identity and status | App shell, Status badge | job, vehicle, customer | no private owner total in header |
| Problems and media | Content card | job capture | optional |
| Bill | Bill card, Button | work lines, prices, discount | calculation comes from recorded lines |
| Payment sheet | Numeric keypad, Selection chip | outstanding amount, method | owner PIN precedes due and amount reveal |
| Next-service sheet | Bottom sheet, Selection chip | delivery timing | optional timing is explicit |

## States (all required)

- Default: non-money job details stay visible; protected payment and due values
  require the owner PIN.
- Loading: job shell stays stable while cards show skeletons.
- Empty: no bill shows “not added”; no payments and no media remain valid.
- Error: failed status, bill, payment, or reminder action keeps prior state.
- Edge (long text, many items, offline, permissions): long lines truncate with
  detail access; repeated payment is blocked; zero due disables payment;
  offline online-first save never appears confirmed.

## Interactions

| Trigger | Behavior | Validation | Result |
|---|---|---|---|
| Advance status | Confirm next allowed state | valid transition | history and rail update |
| Add or edit bill | Open billing sheet | permitted job | lines and total update |
| Take payment | Request owner PIN, then open keypad | valid PIN and positive outstanding amount | payment and due update once |
| Deliver | Open next-service sheet | allowed delivery state | reminder timing and delivered state |
| Share | Open bill preview | saved bill | SCR-006 |

## Accessibility notes

The status rail announces current and completed steps. Sheets trap focus.
Amounts include currency and payment meaning. Save feedback uses a live region.

## Open questions

| ID | Question | Status |
|---|---|---|
| Q-004 | Payment and bill-due reveals now require the owner PIN. | answered |
