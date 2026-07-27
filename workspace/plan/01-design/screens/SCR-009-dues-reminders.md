# SCR-009 — Dues and reminders

- Traces from: FT-009 / FR-013; FT-012 / FR-017; FT-013 / FR-018;
  FT-015 / FR-020; FT-016 / FR-021; FT-017 / FR-022, FR-094 ·
  Prototype: `prototype/SCR-009-dues-reminders.html`
- Provenance: locked HTML prototype v1
  `data-screen-label="S7 Dues and reminders"`;
  `data-screen-label="S7 Bulk SMS confirm"`;
  `data-screen-label="S9 Reminder teaser (locked)"`;
  `data-screen-label="S9 Reminder ROI"`
- Status: approved
- Last updated: 2026-07-27

## Purpose

The owner reviews dues, sends allowed reminders, and manages Pro service
reminders and their return outcome.

## Entry & exit

- Entry points: SCR-002 dues or reminder cards, bottom navigation, SCR-008.
- Exit points: customer context opens SCR-008; locked reminder opens SCR-012;
  navigation opens another shell screen.

## Layout

An owner-PIN gate precedes a segmented dues and reminders view. Dues use sorted
customer cards and a bulk action. Pro reminders show ROI and the approved
queue. Bulk confirmation is a sheet.

## Content & data

| Element | Component | Data source | Notes |
|---|---|---|---|
| Owner gate | Numeric keypad, Feedback | owner authorization | masks every protected value |
| Dues list | Content card, Status badge | balances and reminder history | available after PIN success |
| Bulk confirm | Bottom sheet, Button | selected eligible dues, SMS credit | show recipients and cost |
| Reminder teaser | Money summary, Content card | retained ROI proof | no send controls for Free |
| Reminder queue | Content card, Button | schedule, entitlement, credit | send once |
| ROI | Money summary | sent, returned, attributed value | owner-facing aggregate |

## States (all required)

- Default: PIN gate with masked due and ROI placeholders.
- Loading: segment stays active while its list shows skeletons.
- Empty: no dues and no reminders each use specific positive copy.
- Error: failed send keeps credit and unsent state; failed ROI hides values.
- Edge (long text, many items, offline, permissions): large lists paginate;
  zero credits open SCR-012; duplicate taps send once; automated reminders
  require active Pro; unauthorized roles do not gain private ROI values.

## Interactions

| Trigger | Behavior | Validation | Result |
|---|---|---|---|
| Enter PIN | Unlock protected route | valid owner PIN | dues and ROI appear |
| Switch segment | Replace content area | valid segment | dues or reminders |
| Send one SMS | Confirm permitted reminder | credit and unsent state | record send and deduct once |
| Send all | Open bulk sheet | eligible due rows | confirm or cancel |
| Toggle auto-send | Change approved rule state | Pro entitlement | queue behavior updates |
| Unlock Pro | Open offer | Free plan | SCR-012 |

## Accessibility notes

The segment uses tab semantics. Due amount and age are both spoken. Bulk
confirmation lists scope before the destructive send action.

## Open questions

| ID | Question | Status |
|---|---|---|
| Q-004 | The whole due and ROI route now requires the owner PIN. | answered |
