# workspace/plan/ — product workspace (phases 0–4)

**Why this exists.** Your product's definition, phase by phase — kept
apart from the harness (`harness/`) so the template stays reusable.

**What it does NOT cover.** The BRD (`workspace/docs/business/`), the SRS
(`workspace/spec/`), the work queue (`workspace/epics/`), shared assets
(`workspace/assets/`), open questions (`workspace/open-questions.md`), and
product code (Epic 00 decides where that lives).

| Dir | Contents | Produced by |
|---|---|---|
| `00-business/` | idea.md, PRD, feature list, forecast (the BRD lives at `workspace/docs/business/BRD.md`) | /kickoff /prd /features /forecast |
| `01-design/` | design-system.md, tokens.json, `components/`, `screens/`, `prototype/` (Figma is law when linked — see `workspace/docs/design/README.md`) | /design |
| `02-traceability/` | `matrix.md` (BRD↔feature↔UI↔epic↔test join table), `discrepancies/` | /trace |
| `03-technical/` | tech plan, domain model, diagrams, and product `decisions/` ADRs | /tech-plan |
| `04-dev/` | dev plan, epic map | /dev-plan |

Epics and task specs live in `workspace/epics/` (the scheduler's work queue); the SRS
lives in `workspace/spec/srs.md`; product code lives where Epic 00's ADRs decide.
