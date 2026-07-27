# SCR-011 — Settings

- Traces from: FT-014 / FR-019; FT-015 / FR-020; FT-016 / FR-021;
  FT-017 / FR-022, FR-094; FT-020 / FR-030, FR-093; FT-022 / FR-031;
  FT-023 / FR-032; FT-024 / FR-033 ·
  Prototype: `prototype/SCR-011-settings.html`
- Provenance: locked HTML prototype v1 `data-screen-label="Settings"`
- Status: approved
- Last updated: 2026-07-27

## Purpose

The owner reviews plan, language, numerals, PIN, SMS credit, backup state, and
source-approved module teasers.

## Entry & exit

- Entry points: shell settings control, SMS credit control.
- Exit points: back returns to the prior shell screen; upgrade opens SCR-012.

## Layout

A dark header leads to a plan card, a grouped settings card, three locked P1
module teaser cards, and a backup status card.

## Content & data

| Element | Component | Data source | Notes |
|---|---|---|---|
| Plan | Content card, Button | Free or Pro entitlement | existing data remains |
| Language and numerals | Selection chip | region profile | Bangla or English |
| PIN and SMS | Content card, Button | owner setting, credit balance | PIN is never displayed |
| Module teasers | Content card, Status badge | mechanics, inventory, appointment source teasers | no detailed P1 design |
| Backup status | Feedback | online or source-teased Pro sync state | detailed offline UI deferred |

## States (all required)

- Default: current settings and plan.
- Loading: retain labels while values show progress.
- Empty: missing optional module or credit shows zero or coming-soon copy.
- Error: failed language, purchase, or plan change keeps prior setting.
- Edge (long text, many items, offline, permissions): language switch updates
  all released copy; saved data does not change; locked modules cannot open;
  offline and sync remain source teasers, not a full deferred design.

## Interactions

| Trigger | Behavior | Validation | Result |
|---|---|---|---|
| Change language | Apply approved profile | supported locale | all interface copy updates |
| Toggle numerals | Change presentation only | supported profile | data unchanged |
| Buy SMS or upgrade | Open paid offer | none | SCR-012 |
| Tap module teaser | Explain deferred module | none | no feature screen opens |

## Accessibility notes

Grouped settings have headings. Switches expose name and checked state. Module
teasers announce “coming soon” before their description.

## Open questions

| ID | Question | Status |
|---|---|---|
| N/A | P1 module details require later approved scope. | N/A |
