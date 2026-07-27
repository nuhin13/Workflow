# SCR-003 — Jobs board

- Traces from: FT-004 / FR-003–FR-005, FR-090, FR-095; FT-005 /
  FR-006, FR-007; FT-014 / FR-019; FT-017 / FR-022, FR-094; FT-020 /
  FR-030, FR-093 · Prototype: `prototype/SCR-003-jobs-board.html`
- Provenance: locked HTML prototype v1 `data-screen-label="S1 Jobs board"`
- Status: approved
- Last updated: 2026-07-27

## Purpose

The workshop filters current jobs and starts a fast live job card.

## Entry & exit

- Entry points: SCR-002 job KPIs, jobs navigation, back from SCR-005.
- Exit points: new job opens SCR-004; a job row opens SCR-005; cap warning
  opens SCR-012.

## Layout

The app shell holds horizontal status chips, a Free cap warning, a full-width
new-job action, and stacked job rows. Bottom navigation stays visible.

## Content & data

| Element | Component | Data source | Notes |
|---|---|---|---|
| Status tabs | Selection chip, Status badge | job state counts | working, open, ready, today |
| Free cap | Feedback, Button | monthly job meter | appears near limit |
| Job list | Job row | filtered active jobs | plate, customer, problems, promise |
| New job and batch entry | Button | none | live entry opens SCR-004; approved additive batch entry opens SCR-013 |
| Sync hint | App shell, Feedback | Pro connectivity state | teaser only for FT-020 |

## States (all required)

- Default: selected filter and matching job rows.
- Loading: filters remain usable while rows show skeletons.
- Empty: selected filter shows a clear no-jobs message and new-job action.
- Error: retry preserves the selected filter.
- Edge (long text, many items, offline, permissions): plates stay primary;
  long names truncate; large lists scroll; online-first saves do not claim
  offline success.

## Interactions

| Trigger | Behavior | Validation | Result |
|---|---|---|---|
| Select tab | Filter rows | known job state | same screen updates |
| Tap new job | Start timed live capture | below Free cap | SCR-004 |
| Tap batch entry | Start the approved owner flow | valid owner PIN before money | SCR-013 |
| Tap row | Load selected job | permitted workshop record | SCR-005 |
| Tap cap warning | Explain plan | Free limit state | SCR-012 |

## Accessibility notes

Tabs expose selected state and counts. Each row has one descriptive link.
Status text accompanies every status color.

## Open questions

| ID | Question | Status |
|---|---|---|
| Q-003 | The approved owner-app batch flow is SCR-013. | answered |
