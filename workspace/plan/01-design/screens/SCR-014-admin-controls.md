# SCR-014 — Authorized admin controls

- Traces from: FT-018 / FR-024, FR-091 ·
  Prototype: `prototype/SCR-014-admin-controls.html`
- Additive provenance: human-approved `Q-003` recommendation on 2026-07-27
- Status: approved
- Last updated: 2026-07-27

## Purpose

An authorized support operator manages the approved remote controls within a
clear product or workshop scope.

## Entry & exit

- Entry points: separate authorized admin sign-in and support-admin navigation.
- Exit points: sign out leaves the admin surface; each control returns to the
  same scoped view after an audited result.

## Layout

A responsive admin shell separates navigation from the active work area. A
scope bar stays above five approved areas: configuration, feature flags and
kill switches, referral audit, support lookup, and product metrics.

## Content & data

| Element | Component | Data source | Notes |
|---|---|---|---|
| Authorization shell | Admin shell, Feedback | support-operator session | unauthorized users see no controls |
| Scope bar | Form control, Status badge | product or selected workshop scope | required before a scoped change |
| Configuration | Content card, Form control | approved remote pricing/configuration | change is auditable |
| Flags and kill switches | Content card, Selection chip | approved feature controls | intended scope only |
| Referral audit | Content card | referral audit records | read-only in this design |
| Support lookup | Form control, Content card | authorized workshop lookup | only permitted support data |
| Product metrics | Content card | approved product metrics | no new metric capability |

## States (all required)

- Default: authorized operator, visible scope, and the five approved areas.
- Loading: preserve the scope label while a selected area loads.
- Empty: lookup, referral audit, and metrics explain that no scoped records
  match.
- Error: authorization failure hides all controls; update failure keeps the
  prior value and shows no success audit result.
- Edge (long text, many items, offline, permissions): tables scroll; long
  workshop names wrap; every mutation confirms scope; offline changes are
  blocked; an operator without the required permission sees no control.

## Interactions

| Trigger | Behavior | Validation | Result |
|---|---|---|---|
| Select scope | Set product or workshop context | authorized scope | all areas show that scope |
| Change configuration | Confirm new approved value | authorization and scope | retained audited change |
| Change flag or kill switch | Confirm the control and scope | authorization and intended scope | retained audited change |
| Search support | Query authorized support records | permitted lookup | scoped result or empty state |
| Open audit or metrics | Load the selected read view | authorization and scope | scoped records |

## Accessibility notes

The active scope is announced before controls. Tables use headers and captions.
Toggle labels include feature and scope. Confirmations return focus to the
changed control and announce the audit result.

## Open questions

| ID | Question | Status |
|---|---|---|
| Q-003 | The separate authorized admin recommendation was approved. | answered |
