# SCR-001 — Onboarding and phone access

- Traces from: FT-001 / FR-001; FT-002 / FR-002, FR-091; FT-017 /
  FR-022, FR-094 · Prototype: `prototype/SCR-001-onboarding.html`
- Provenance: locked HTML prototype v1 `data-screen-label="S10 Onboarding"`
- Status: approved
- Last updated: 2026-07-27

## Purpose

The owner verifies a phone, names the workshop, chooses vehicle types, and
enters the operational app.

## Entry & exit

- Entry points: first launch, signed-out launch, prototype reset.
- Exit points: verified setup opens SCR-002; failed access stays here.
- Prototype-only control: “start with demo data” is excluded from the product
  contract because it bypasses phone access.

## Layout

A dark onboarding shell holds the Garazo mark and progress dots. A rounded
white panel shows one step at a time. The primary button stays at the panel
bottom.

## Content & data

| Element | Component | Data source | Notes |
|---|---|---|---|
| Brand, tagline, progress | App shell, Status badge | static localized copy, current step | Bangla first |
| Phone and OTP | Form control, Button | owner phone, one-time code | Never expose another workshop |
| Workshop name | Form control | setup draft | required before completion |
| Vehicle types | Selection chip | approved type options | multi-select |
| Price presets | Content card | source sample presets | source reference only; SRS decides whether setup requires them |

## States (all required)

- Default: phone, OTP, workshop, vehicle type, and preset steps.
- Loading: send and verify actions show busy text without moving steps.
- Empty: missing required input keeps the action disabled and explains why.
- Error: invalid phone, expired OTP, or tenant failure stays on the same step.
- Edge (long text, many items, offline, permissions): long names wrap; repeated
  OTP requests are rate-limited; offline verification cannot reveal data.

## Interactions

| Trigger | Behavior | Validation | Result |
|---|---|---|---|
| Send OTP | Submit phone | supported, non-empty phone | show OTP step |
| Verify | Submit code | current valid code and tenant boundary | continue setup |
| Choose type | Toggle chip | at least one before finish | update selection |
| Start | Save setup | all required setup is valid | open SCR-002 |

## Accessibility notes

Focus follows the step order. Step changes move focus to the heading. Inputs
have persistent labels, numeric keyboards, and announced errors.

## Open questions

| ID | Question | Status |
|---|---|---|
| N/A | No screen-specific question. Authentication strategy remains a later human technical decision. | N/A |
