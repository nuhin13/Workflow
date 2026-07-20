# project/ — product workspace (phases 0–4)

**Why this exists.** Your product's definition, phase by phase — kept
apart from the harness (`agent/`) so the template stays reusable.

**What it does NOT cover.** The BRD (`docs/business/`), the SRS
(`spec/`), the work queue (`epics/`), and product code (Epic 00 decides
where that lives).

| Dir | Contents | Produced by |
|---|---|---|
| `00-business/` | idea.md, PRD, feature list, forecast (the BRD lives at `docs/business/BRD.md`) | /kickoff /prd /features /forecast |
| `01-design/` | design-system.md, tokens.json, `components/`, `screens/`, `prototype/` (Figma is law when linked — see `docs/design/README.md`) | /design |
| `02-traceability/` | `matrix.md` (BRD↔feature↔UI↔epic↔test join table), `discrepancies/` | /trace |
| `03-technical/` | tech plan + diagrams (ADRs live in `agent/memory/decisions/`) | /tech-plan |
| `04-plan/` | dev plan, epic map | /dev-plan |
| `assets/` | forecast data, imported design assets | any |
| `open-questions.md` | Q-### register | /question |

Epics and task specs live in `epics/` (the scheduler's work queue); the SRS
lives in `spec/srs.md`; product code lives where Epic 00's ADRs decide.
