# SCR-002 — Workshop dashboard

- Traces from: FT-003 / FR-023, FR-092, FR-096; FT-005 / FR-006; FT-009 /
  FR-013; FT-010 / FR-014, FR-091; FT-011 / FR-015; FT-013 / FR-018;
  FT-014 / FR-019; FT-017 / FR-022, FR-094; FT-019 / FR-025, FR-097 ·
  Prototype: `prototype/SCR-002-dashboard.html`
- Provenance: locked HTML prototype v1 `data-screen-label="Dashboard"`;
  `data-screen-label="Quick actions sheet"`; `data-screen-label="Notifications sheet"`
- Status: approved
- Last updated: 2026-07-27

## Purpose

The workshop sees urgent work and moves into jobs, dues, customers, reminders,
or protected money.

## Entry & exit

- Entry points: SCR-001 completion, home navigation, back from a detail.
- Exit points: KPI and row links open SCR-003, SCR-007, SCR-009, or SCR-010;
  settings opens SCR-011; paid prompts open SCR-012; batch entry opens SCR-013.

## Layout

The app shell frames KPI cards, job status chips, ready jobs, protected monthly
money, reminder ROI, top dues, and customer count. The bottom bar stays fixed.
Quick actions and notifications open as sheets.

## Content & data

| Element | Component | Data source | Notes |
|---|---|---|---|
| KPI grid | Money summary, Content card | job, money, due, SMS aggregates | money is masked while locked |
| Ready and overdue jobs | Job row, Status badge | current jobs | maximum four preview rows |
| Reminder ROI | Money summary | reminder outcomes | always masked here; PIN route reveals it |
| Top dues | Content card, Button | highest customer balances | amount stays masked here |
| Shell and navigation | App shell, Bottom navigation | workshop, plan, SMS credit | notification and settings controls |

## States (all required)

- Default: live operational previews with due and ROI values masked.
- Loading: keep the shell and show card skeletons.
- Empty: each list explains that no urgent job or due exists.
- Error: affected card shows retry; private money never appears in error text.
- Edge (long text, many items, offline, permissions): truncate shop and plate
  labels; cap previews; show online-first failure; non-owner sees masked money.

## Interactions

| Trigger | Behavior | Validation | Result |
|---|---|---|---|
| Tap job KPI or row | Open linked operational view | permitted record | destination screen |
| Tap due or ROI | Open a protected route | valid owner PIN required before reveal | SCR-009 gate |
| Tap money | Request PIN | owner authorization | SCR-010 locked or open |
| Tap center action | Open quick actions sheet | none | live entry or SCR-013 batch entry |
| Tap bell | Open notification sheet | none | recent operational notices |

## Accessibility notes

KPI labels include value meaning. Masked money reads “locked,” not bullets.
Sheets trap focus and return focus to their opener.

## Open questions

| ID | Question | Status |
|---|---|---|
| Q-003 | Batch entry was added as SCR-013 after human approval. | answered |
| Q-004 | Due and ROI values stay masked; SCR-009 requires the owner PIN. | answered |
