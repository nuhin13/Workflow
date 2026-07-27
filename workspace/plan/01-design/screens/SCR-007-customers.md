# SCR-007 — Customer and vehicle book

- Traces from: FT-006 / FR-008, FR-009; FT-017 / FR-022, FR-094 ·
  Prototype: `prototype/SCR-007-customers.html`
- Provenance: locked HTML prototype v1 `data-screen-label="S6 Customers"`
- Status: approved
- Last updated: 2026-07-27

## Purpose

The workshop finds customers and vehicles created through job activity.

## Entry & exit

- Entry points: SCR-002 customer card and back from SCR-008.
- Exit points: a result opens SCR-008; navigation opens another shell screen.

## Layout

The app shell holds a pill search control and stacked customer cards. Each card
shows identity, phone, vehicle summary, and a masked due badge when applicable.

## Content & data

| Element | Component | Data source | Notes |
|---|---|---|---|
| Search | Form control | customer name, phone, plate | one combined search |
| Customer rows | Content card, Status badge | linked customer and vehicles | due amount stays masked |
| Navigation | App shell, Bottom navigation | four core destinations | customer book is a secondary route, not a source tab |

## States (all required)

- Default: recent or matching customer rows.
- Loading: search remains visible while rows show skeletons.
- Empty: explain that records grow from saved jobs.
- Error: retry search without clearing the term.
- Edge (long text, many items, offline, permissions): debounce long lists;
  truncate models; exact plate matches rank first; online-first failure is clear.

## Interactions

| Trigger | Behavior | Validation | Result |
|---|---|---|---|
| Type search | Filter by supported identifiers | normalized input | matching rows |
| Tap customer | Load linked vehicles and history | permitted tenant record | SCR-008 |

## Accessibility notes

Search has a visible label. Results announce count changes without moving
focus. Customer cards use one descriptive link.

## Open questions

| ID | Question | Status |
|---|---|---|
| Q-004 | Customer due badges now show a masked value. | answered |
