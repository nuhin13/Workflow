# Graphiti schema for the harness (custom entity & edge types)

## Entities
| Type | Key fields |
|---|---|
| Epic | id (E03), title, status, wsjf |
| Task | id (E03-T07), type (feature/bug/genesis), status, model |
| Bug  | id (E03-B02), severity, priority |
| Decision | adr (ADR-0007), status, area |
| File | path |
| API  | method + endpoint |
| Function | qualified name + signature |
| Lesson | id (L-area-012), area, recurrence |
| Agent | role (qa, developer-backend, …) |
| ThirdPartyService | name, purpose, env |

## Edges
DEPENDS_ON (Task→Task, Epic→Epic) · TOUCHES (Task→File) ·
IMPLEMENTS (Function→API) · SUPERSEDES (Decision→Decision) ·
LEARNED_FROM (Lesson→Task|Bug) · ASSIGNED_TO (Task→Agent) ·
VERIFIED_BY (Task→Agent) · BLOCKS (Bug→Task) · USES (Epic→ThirdPartyService)

## Episode conventions (what add_memory ingests)
- One episode per completed task / retro / accepted ADR. Name entities with
  their canonical ids above so extraction dedupes cleanly.
- Episode body ≤ 10 lines: what changed, why, ids touched.
- Source tag: `harness:<task-or-event-id>` (lets you purge by source).
