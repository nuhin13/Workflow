# SCR-013 — End-of-day batch entry

- Traces from: FT-005 / FR-007; FT-010 / FR-014, FR-091; FT-017 /
  FR-022, FR-094 · Prototype: `prototype/SCR-013-batch-entry.html`
- Additive provenance: human-approved `Q-003` recommendation on 2026-07-27
- Status: approved
- Last updated: 2026-07-27

## Purpose

The owner records today’s completed jobs and related money after the workshop
rush.

## Entry & exit

- Entry points: SCR-002 quick actions and SCR-003 batch-entry action.
- Exit points: successful save opens SCR-003; cancel returns to the opener;
  a locked route stays at the owner-PIN gate.

## Layout

The Android owner shell starts with the owner-PIN gate. The unlocked flow has
three steps: job rows, related money, and review. Each row uses existing job,
form, chip, and money components. The business date stays visible.

## Content & data

| Element | Component | Data source | Notes |
|---|---|---|---|
| Owner gate | Numeric keypad, Feedback | owner authorization | no protected amount before success |
| Business date | Form control | current business date | required for every saved row |
| Job rows | Job row, Form control, Selection chip | plate, problem, work state, promised timing | produces the same job record as live entry |
| Related money | Money summary, Form control | recorded charges, payment, due | masked until PIN succeeds |
| Review | Content card, Status badge | valid and invalid draft rows | valid rows can be saved together |

## States (all required)

- Default: PIN gate first, then the job, money, and review steps.
- Loading: validation and save retain all draft rows and show busy feedback.
- Empty: no rows shows an add-job action; no related money remains a valid zero
  state when the row has no recorded money.
- Error: invalid rows name the missing plate or problem; failed save keeps every
  draft and does not duplicate accepted records.
- Edge (long text, many items, offline, permissions): rows scroll; long plates
  remain readable; a wrong PIN reveals no amount; online-first save is not
  confirmed while disconnected; non-owner users cannot enter the flow.

## Interactions

| Trigger | Behavior | Validation | Result |
|---|---|---|---|
| Enter owner PIN | Unlock route and amounts | valid owner PIN | show batch draft |
| Add job row | Append a compact job form | none | editable row |
| Continue | Validate current step | plate and problem per job | related money or review |
| Save valid rows | Submit jobs and related money with business date | valid rows, owner unlocked | same records as live entry |
| Cancel | Leave without saving | none | return to opener |

## Accessibility notes

Step changes announce the heading and row count. Each row has a unique label.
Errors link to the failing field. Protected amounts never enter the accessible
tree before PIN success.

## Open questions

| ID | Question | Status |
|---|---|---|
| Q-003 | The owner-app batch-entry recommendation was approved. | answered |
| Q-004 | Owner PIN protects all related money in this flow. | answered |
