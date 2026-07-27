# SCR-004 — New job card

- Traces from: FT-004 / FR-003–FR-005, FR-090, FR-095; FT-017 /
  FR-022, FR-094; FT-019 / FR-025 ·
  Prototype: `prototype/SCR-004-new-job.html`
- Provenance: locked HTML prototype v1 `data-screen-label="S2 New job card"`
- Status: approved
- Last updated: 2026-07-27

## Purpose

The workshop creates a live job with only a plate and one problem icon.

## Entry & exit

- Entry points: SCR-003 primary action, SCR-002 quick actions.
- Exit points: saved job opens SCR-005; back returns to the source screen.

## Layout

A three-step light workspace sits under a dark header. Step one captures or
types the plate. Step two confirms problems and accepts optional media. Step
three confirms promised time and the summary. A fixed action advances or saves.

## Content & data

| Element | Component | Data source | Notes |
|---|---|---|---|
| Step indicator | Status badge | capture step | plate, problems, extras |
| Plate capture | Form control, Button | camera/OCR or manual entry | manual path stays prominent |
| Known vehicle | Content card | customer and vehicle match | prevents duplicates; any due value stays masked |
| Vehicle and problems | Selection chip | approved options | one problem required |
| Optional details | Selection chip, Form control | promised time, voice, media | always skippable |

## States (all required)

- Default: manual entry and capture action are both available.
- Loading: OCR and save show progress while preserving entered data.
- Empty: forward action stays disabled until plate or one problem is present.
- Error: OCR failure promotes manual entry; save failure keeps the draft.
- Edge (long text, many items, offline, permissions): denied camera or
  microphone never blocks minimum capture; known plates show the match; slow
  networks keep an explicit unsaved state.

## Interactions

| Trigger | Behavior | Validation | Result |
|---|---|---|---|
| Capture plate | Request camera and OCR | permission if used | fill editable plate |
| Type plate | Use manual control | non-empty plate | advance |
| Select problem | Toggle icon chip | one or more selected | enable next |
| Save | Submit minimum and optional fields | plate plus problem | SCR-005 |

## Accessibility notes

Every icon has a text label. Camera and microphone permissions explain a manual
alternative. Step changes announce progress and move focus to the step heading.

## Open questions

| ID | Question | Status |
|---|---|---|
| Q-004 | Known-customer due values stay masked during job capture. | answered |
