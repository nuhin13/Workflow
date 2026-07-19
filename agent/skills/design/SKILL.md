---
name: design
description: Run the Claude-native design phase via the designer agent — design system + tokens.json, component library, screen specs, clickable HTML prototype. Subcommands - "/design" full pass, "/design sync" ripple token/system changes, "/design import" ingest external assets (e.g. Stitch exports), "/design SCR-###" one screen.
---

# /design — design system, screens, prototype

Parse `$ARGUMENTS`: (none)=full pass · `sync` · `import` · `SCR-###`.

**Full pass** (delegate to **designer** agent):
1. Preconditions: PRD + feature list approved. Read their Handoff blocks.
2. Produce in `project/01-design/`:
   - `tokens.json` (source of truth) + `design-system.md` (`templates/design-system.md`)
   - `components/*.html` — every component, all states, tokens-only styling
   - `screens/SCR-###-<slug>.md` (`templates/screen-spec.md`) — every FT with UI gets its
     screens; every screen traces to FT/FR
   - `prototype/` — one HTML per screen + `index.html` hub with working navigation
3. Present: screen index vs feature list coverage, prototype entry point
   (`open project/01-design/prototype/index.html`), batched questions.
4. On approval: Handoff, state → traceability phase, commit `design: system + screens`,
   then run `/trace` to index SCR rows.

**sync:** tokens.json or design-system.md changed → regenerate/update affected components,
screen specs, prototype pages in ONE commit (`design: sync <what changed>`). List every
touched file. Divergence found in the other direction → D-###.

**import:** read `project/assets/design-imports/*`, extract palette/type/spacing/components
into tokens.json + design system (provenance noted), rebuild affected screens, then `sync`.

**SCR-###:** single-screen create/revise; ripple spec ↔ prototype both directions; update
screen index + matrix.
