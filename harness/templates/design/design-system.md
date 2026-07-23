# Design System — <Project Name>

- Traces from: PRD (`FR-###`), Feature list (`FT-###`)
- Companion files: `workspace/plan/01-design/tokens.json` (machine-readable),
  `workspace/plan/01-design/components/` (one HTML/CSS file per component),
  `workspace/plan/01-design/prototype/` (clickable screens)
- Last updated: YYYY-MM-DD

RULE: `tokens.json` is the source of truth. This document and every component/prototype file
derive from it. Changing a token ⇒ regenerate/update components and prototype in the same
commit (`/design sync`).

## 1. Brand & tone
Voice, personality, references. One short section.

## 2. Design tokens (mirrors tokens.json)
### Color
| Token | Light | Dark | Usage |
|---|---|---|---|
| `color.bg` | | | page background |
| `color.surface` | | | cards, panels |
| `color.text` / `.text-muted` | | | |
| `color.primary` / `.primary-text` | | | actions, links |
| `color.danger` / `.success` / `.warning` | | | states |
| `color.border` | | | |

### Typography
| Token | Value | Usage |
|---|---|---|
| `font.family.base` / `.mono` | | |
| `font.size.xs–3xl` (scale) | | |
| `font.weight.regular/medium/bold` | | |

### Spacing, radius, shadow, motion
4/8-based spacing scale, radius scale, elevation levels, transition durations.

## 3. Components
One row per component; each has a file in `components/` with usage notes + all states
(default, hover, focus, disabled, loading, error, empty).

| Component | File | States covered | Used on screens |
|---|---|---|---|
| Button | components/button.html | ✔ | SCR-### |

## 4. Layout & responsive rules
Grid, breakpoints, page shells (app shell, auth shell, …).

## 5. Interaction & accessibility standards
Focus order, keyboard rules, contrast floor (WCAG AA), error/empty/loading conventions.

## 6. Screen index
| ID | Screen | Spec | Prototype | Features |
|---|---|---|---|---|
| SCR-001 | | screens/SCR-001-….md | prototype/SCR-001-….html | FT-### |

## Handoff
