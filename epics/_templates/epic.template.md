---
id: E<NN>
title: <epic title>
status: todo                # todo → in-progress → done → verified
type: feature               # feature | genesis
phase: MVP                  # MVP | P1 | P2 | P3
priority: { moscow: must, wsjf: 0 }   # wsjf=(value+time+risk)/size, 1–10 each
depends_on: []              # other epic ids
traces_to: []               # SRS Module / FR prefixes this epic covers (e.g. [Module-1, FR-AUTH])
external_services: []
ui_surface: []              # requester | agent | manager | admin | widget
design_reference: docs/design/README.md   # UI (Figma) is law — required if ui_surface is non-empty
---
# E<NN> · <epic title>

## Business goal
One paragraph: the user/business outcome this epic delivers.

## User-visible outcome
What a user can do after this epic that they couldn't before.

## Scope
**In scope**
- ...
**Out of scope**
- ... (deferred to E<YY>)

## Data-model changes
Tables/columns this epic introduces (high level — tasks carry migrations).

## API surface
Endpoints this epic owns (high level — tasks carry full contracts).

## UI screens
Which Figma screens this epic implements (see docs/design/README.md). Map each
screen → route → Figma frame so every frontend task inherits an exact
`ui_reference`. The design is **law**: built pages must match the Figma frame
in layout, chrome, structure, icons, copy, and hover/focus (not just
colors/fonts), reuse shared primitives, and use design tokens.

| Screen | Route | Figma frame | Task |
|---|---|---|---|
| <name> | /<route> | <figma frame link/name> | E<NN>-T<MM> |

## Acceptance criteria (epic-level, EARS)
- EARS-<AREA>-1: WHEN <trigger>, the system SHALL <behavior>   (FR-..., UC-...)
- EARS-<AREA>-2: IF <error>, THEN the system SHALL <response>  (FR-...)

## Task list
| Task | Title | Layer | Size | Depends on |
|------|-------|-------|------|-----------|
| E<NN>-T01 | <title> | backend | S | — |

## Test strategy
How this epic proves itself (unit/integration/E2E mix; the bug-sweep focus).

## Risks & mitigations
| Risk | Mitigation |
|------|-----------|
| <risk> | <mitigation> |

## Third-party touchpoints
Services used — must exist in the genesis inventory (ADR-0004).

## Open Questions
> Epic-level spec gaps to resolve BEFORE kickoff. Each carries an answer slot —
> fillable by a HUMAN or an AGENT, MANUALLY or AUTOMATICALLY. Keys are stable
> (`Status:` / `Answer:` / `Answered by:`) so tooling can find + fill them.
> Status: 🟡 open · 🟢 answered · ⚪ deferred.

- **OQ-E<NN>-1 — <short title>.** <the question / the gap>
  - **Status:** 🟡 open
  - **Answer:** _<empty — fill here>_
  - **Answered by:** _<human name | agent id> (manual|auto)_
  - **Date:** _<YYYY-MM-DD>_
- (none yet)

## Analyze report
<appended by /analyze — do not fill manually>

## Retro
→ retro.md (written by /retro after completion)
