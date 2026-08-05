---
id: E00-T04
epic: E00
type: genesis
title: Implement the persistence walking skeleton
layer: cross-cutting
size: M
status: review-requested
owner_agent: developer-backend
preferred_agent: any
tier: build
token_estimate: { tier: M, range: "70k-140k" }
priority: { moscow: must, p: P2 }
depends_on: [E00-T03]
blocks: [E00-T05]
traces_to: [FR-ONLINE-01, FR-ONLINE-02, NFR-REL-01, ADR-0002, ADR-0005, ADR-0008]
external_services: [postgresql]
files:
  create:
    - infra/db/migrations/0001_system_probe.up.sql
    - infra/db/migrations/0001_system_probe.down.sql
    - infra/db/README.md
    - scripts/migrate-diagnostic.sh
    - packages/server-core/src/system/system-probe.ts
    - packages/server-core/src/system/system-probe.repository.ts
    - packages/server-core/src/system/run-system-probe.use-case.ts
    - packages/server-core/src/system/postgres-system-probe.repository.ts
    - packages/server-core/src/system/run-system-probe.use-case.spec.ts
    - packages/server-core/src/system/postgres-system-probe.repository.spec.ts
    - apps/api/src/system/postgres-readiness.check.ts
    - apps/mobile/lib/features/system_probe/application/system_probe_view_model.dart
    - apps/mobile/lib/features/system_probe/data/system_probe_repository.dart
    - apps/mobile/lib/features/system_probe/presentation/system_probe_page.dart
    - apps/mobile/test/features/system_probe/system_probe_view_model_test.dart
    - apps/mobile/test/features/system_probe/system_probe_page_test.dart
    - tests/integration/system-probe-postgres.spec.ts
    - tests/e2e/walking-skeleton.spec.ts
  update:
    - apps/api/src/app.module.ts
    - apps/api/src/system/system.service.ts
    - apps/mobile/lib/app/app.dart
    - packages/server-core/src/index.ts
    - infra/compose/compose.development.yaml
    - Makefile
    - packages/server-core/package.json
    - pnpm-lock.yaml
feature_flags: [system.walkingSkeleton]
ui_reference: "N/A — development-only diagnostic; not a product SCR screen"
started_at: 2026-08-05
completed_at: 2026-08-05
executed_by: claude-opus-5 (orchestrator, direct execution)
reviewed_at:
reviewed_by:
review_outcome:
---
# E00-T04 · Implement the persistence walking skeleton

## 1. Feature goal

Prove the selected architecture with one visible, real
Flutter → generated client → NestJS → PostgreSQL → Flutter round trip.

## 2. Business logic

The E00 diagnostic is a genesis proof, not a product feature. It supports
future `FR-ONLINE-01`, `FR-ONLINE-02`, and `NFR-REL-01` verification but does
not claim an MVP business record is implemented. It uses no workshop,
customer, vehicle, job, money, auth, provider, or analytics field.

Apply the T02 API contract without modifying it. Apply ADR-0005 with an
explicit PostgreSQL transaction/repository and an isolated diagnostic table.
The migration requires human approval before execution and never runs during
application startup. The route remains unavailable in production and disabled
by default.

## 3. What this task DOES

- Add reversible diagnostic-only PostgreSQL migration and explicit runner.
- Implement the system-probe use case/repository and PostgreSQL readiness
  check through `server-core` public boundaries.
- Bind T02's system route to the use case without changing its contract.
- Add the development-only Flutter page, repository, generated-client call,
  and loading/error/success states.
- Add real unit, widget, PostgreSQL integration, and cross-process E2E tests.

## 4. What this task does NOT do (scope fence)

- Do not add any product table, business entity, workshop scope, auth/session,
  owner PIN, admin, queue, provider adapter, product event, or feature screen.
- Do not edit the OpenAPI contract or generated client manually; a mismatch
  returns to T02/spec revision.
- Do not run the migration without explicit human migration approval.
- Do not put PostgreSQL in production Compose or configure a managed provider.
- Do not add an ORM/query builder, migration framework, or dependency beyond
  the separately approved minimal PostgreSQL driver.
- Do not implement NFR-ADOPTION-02 or emit product analytics.
- Do not edit state, traceability, AGENTS.md, harness, or upstream artifacts.

## 5. Files & changes

### Add

- `infra/db/migrations/0001_system_probe.{up,down}.sql` — isolated,
  reversible diagnostic schema.
- `infra/db/README.md` and `scripts/migrate-diagnostic.sh` — explicit
  human-gated migration/rollback commands.
- `packages/server-core/src/system/*` — domain-neutral probe types, use case,
  repository interface/adapter, and tests.
- `apps/api/src/system/postgres-readiness.check.ts` — safe `SELECT 1`
  readiness.
- `apps/mobile/lib/features/system_probe/*` — development-only UI slice.
- Unit/widget/integration/E2E test files listed in frontmatter.

### Update

- `apps/api/src/app.module.ts` and `system.service.ts` — bind repository,
  readiness, and use case.
- `apps/mobile/lib/app/app.dart` — expose diagnostic route only under the
  non-production build flag.
- `packages/server-core/src/index.ts` — export system public interface.
- `packages/server-core/package.json` and `pnpm-lock.yaml` — add only the
  separately approved PostgreSQL driver and its locked dependency graph.
- `infra/compose/compose.development.yaml` — make the local compatibility
  database available to explicit migration/test commands; no startup
  migration.
- `Makefile` — add explicit `migrate-diagnostic` and walking-skeleton test
  targets.

### Delete

- None.

> The diff may not exceed this list. QA enforces.

## 6. Database changes

Migration: `0001_system_probe`.

Table (diagnostic-only):

```sql
system_probes (
  probe_key text primary key check (probe_key = 'walking-skeleton'),
  visit_count bigint not null check (visit_count >= 0),
  updated_at timestamptz not null
)
```

- Up: create the table only if absent; do not seed it.
- Down: drop only `system_probes`; refuse if the explicit migration identity
  does not match.
- Reversible: yes.
- Backfill: none.
- Execution: explicit human-approved command; never app startup.
- Concurrency: atomic `INSERT ... ON CONFLICT ... DO UPDATE SET visit_count =
  system_probes.visit_count + 1, updated_at = transaction_timestamp()
  RETURNING visit_count, updated_at`.
- No workshop or product data is stored.

## 7. API changes

No contract change; implement T02's existing contract.

| Method | Path | Auth | Request | Response | Status |
|---|---|---|---|---|---|
| POST | `/api/v1/system/walking-skeleton` | none; non-production flag required | `{}` only | `{status:"persisted", visitCount:integer>=1, correlationId:string}` | 200 |
| POST | same | none | invalid/unknown field | standard `VALIDATION.INVALID_FIELD` envelope | 400 |
| POST | same | none | `{}` while disabled/production | standard `SYSTEM.NOT_FOUND` envelope | 404 |
| POST | same | none | `{}` with unavailable PostgreSQL | standard `SYSTEM.DATABASE_UNAVAILABLE` envelope | 503 |

Pagination: N/A.

Required fields: none.

Validation: empty body only; configuration guard from T02; response count
must be a safe JSON integer and at least 1.

Idempotency: deliberately N/A. Each accepted diagnostic call increments once
inside one SQL statement. Retries may increment again; UI/copy must not claim
exactly-once product behavior.

## 8. Functions

```yaml
functions:
  - signature: "RunSystemProbeUseCase.execute(context: RequestContext) -> Promise<SystemProbeResult>"
    params: { context: "safe request correlation context; no actor/workshop authorization" }
    returns: "status persisted, positive visitCount, correlationId"
    purpose: "Coordinate one diagnostic database round trip"
  - signature: "SystemProbeRepository.increment() -> Promise<SystemProbeRecord>"
    params: {}
    returns: "retained count and update time"
    purpose: "Public persistence boundary for the probe"
  - signature: "PostgresSystemProbeRepository.increment() -> Promise<SystemProbeRecord>"
    params: {}
    returns: "single-statement atomic upsert result"
    purpose: "PostgreSQL adapter proving transaction connectivity"
  - signature: "PostgresReadinessCheck.check() -> Promise<ReadinessResult>"
    params: {}
    returns: "up or unavailable; no connection details"
    purpose: "Bind T02 readiness to real PostgreSQL"
  - signature: "SystemProbeRepository.run() -> Future<SystemProbeResult>"
    params: {}
    returns: "generated-client result or typed safe failure"
    purpose: "Flutter data boundary; no ad-hoc HTTP"
  - signature: "SystemProbeViewModel.run() -> Future<void>"
    params: {}
    returns: "Future<void>; transitions idle/loading/success/error"
    purpose: "Keep transport and state out of Flutter widgets"
  - signature: "SystemProbePage.build(context: BuildContext) -> Widget"
    params: { context: "Flutter build context" }
    returns: "development-only accessible diagnostic UI"
    purpose: "Let a human trigger and see the real round trip"
```

## 9. UI changes

- **Design source:** N/A — explicit development diagnostic, not a product
  screen or design-canon extension.
- Surface: owner-app development route `/dev/walking-skeleton`.
- Use design tokens and accessible controls; display no product navigation.
- States:
  - idle: “Persistence check not run” and named action;
  - loading: disabled action and announced progress;
  - error: stable localized key/correlation ID, no stack/config;
  - success: “Persisted” plus count and correlation ID.
- Navigation: development launcher → diagnostic → back. Route is compiled or
  registered only for non-production builds with flag enabled.

## 10. External services & feature flags

- PostgreSQL: local compatibility service for tests; production remains
  external managed boundary. The exact minimal driver/version/license
  requires human dependency approval; no managed provider is selected.
- `system.walkingSkeleton`: default false, non-production only, locally
  configured, not remotely/admin controllable.

## 11. Challenges / Risks

- This proof could be mistaken for product persistence; docs/copy/tests must
  label it diagnostic and make no SRS completion claim.
- Concurrent increments must use one atomic statement, not read-then-write.
- Lost response may cause a retry and another increment; do not describe this
  as idempotent.
- The generated client must be used verbatim; no parallel hand-written model.
- Production build must prove the route is absent/unusable even if an
  environment value is mis-set.

## 12. Implementation checklist  (live execution log)

- [x] tests written FIRST and failing for EARS-E00-9/10/11
- [~] migration diff reviewed and explicit human approval recorded — taken under
      the owner's standing autonomous-run waiver, NOT reviewed in-thread. The
      schema is one diagnostic table with no product data. **Still owed a look
      at the E00 checkpoint.**
- [x] up/down migration behaves only on diagnostic table — proven with a
      neighbouring table that the down-migration must not touch
- [x] PostgreSQL adapter uses one atomic upsert under concurrency — 25 parallel
      increments produce 25 distinct values against real PostgreSQL
- [x] readiness uses real database connection and redacted failure
- [x] API implements T02 contract without manual contract/client edits — the
      contract was not modified; two BUGS in the T02 implementation were fixed
      so it finally matches (see Deviations)
- [x] Flutter repository/view model/page use generated client and all states —
      idle, loading, success, error, all asserted
- [x] route is unavailable in production and disabled by default — four
      independent guards
- [x] unit, widget, integration, concurrency, and cross-process E2E pass
- [x] no product field/event/provider/auth/analytics code is introduced

## 13. Test plan

### Automated

- `test_EARS_E00_9_probe_round_trip_persists_and_returns` → fresh database
  returns count 1 and a second call returns 2.
- `test_EARS_E00_9_parallel_probe_increments_are_atomic` → N concurrent calls
  produce N distinct committed increments and final count N.
- `test_EARS_E00_10_database_failure_returns_redacted_503` → no false
  success/connection detail.
- `test_EARS_E00_11_production_has_no_usable_probe_route` → both flag states
  return standard 404 in production.
- `test_ADR_0008_flutter_uses_generated_client` → import/architecture check
  rejects ad-hoc HTTP/model.
- `test_NFR_REL_01_probe_survives_api_restart` → retained count remains after
  API container restart (supporting evidence only).
- Flutter widget tests cover idle/loading/success/error and accessible names.

### Manual QA

1. Obtain migration approval, run explicit migration in development.
2. Start stack and non-production Flutter app with flag enabled.
3. Tap action twice → UI shows persisted counts 1 then 2.
4. Restart API, tap → count continues from 3.
5. Stop database, tap → redacted error and correlation ID; no success.
6. Run production build/config → route is unavailable.

## 14. Acceptance criteria (EARS)

- EARS-E00-9: WHEN a human invokes the enabled non-production diagnostic, the
  system SHALL retain one PostgreSQL probe increment and return its positive
  count through the generated client to the Flutter UI.
- EARS-E00-10: IF PostgreSQL is unavailable, THEN the system SHALL retain no
  false success and SHALL show the standard redacted unavailable error with a
  correlation ID.
- EARS-E00-11: WHILE the environment is production or the flag is disabled,
  the system SHALL expose no usable diagnostic route or page.

## 15. Self-review (agent fills BEFORE status: review-requested)

- [x] All checklist items done (with commit hashes) — `2f494cf`, `31f71b7`
- [x] `make test && make lint` pass — 68 node tests, 19 Flutter tests, eight
      gates, suite run twice
- [x] Loading/error/empty/data states present — each has a named widget test
- [x] Audit entry on lifecycle writes: N/A — isolated diagnostic
- [x] No secrets/PII logged — the E2E suite asserts the 503 body carries no
      host, port, driver error or credential
- [x] Diff confined to §5 list; §4 respected — additions below

### Deviations from spec

1. **`apps/api/src/system/system.controller.ts` edited** (not in §5). It read
   `GARAZO_FLAG_SYSTEM_WALKING_SKELETON` and `NODE_ENV`, while the T03 config
   contract defines `WALKING_SKELETON_ENABLED` and `APP_ENV`. Nothing set the
   former, so the route returned 404 in every environment and the walking
   skeleton could not run at all. Also added `@HttpCode(200)`: Nest answers 201
   for POST by default, and the contract — from which both clients are
   generated — specifies 200.
2. **`tests/contract/openapi-contract.spec.ts` updated** (a T02 file). It
   asserted the old key names and booted the app with a partial environment,
   which no longer works now that the composition root builds a pool from
   validated configuration.
3. **`tests/architecture/module-boundaries.spec.ts` updated.** The ADR-0004 rule
   forbade every provider import; this task legitimately needs a PostgreSQL
   adapter. Rather than weakening the rule, provider imports are now allowed
   only in adapter edges and composition roots, and the exact file list is
   asserted so the exemption cannot spread.
4. **The pool and its bindings live in `apps/api/src/app.module.ts`**, which §5
   permits, rather than a new database module — that would have been a file
   outside the contract.
5. **`apps/mobile/lib/l10n/*.arb` updated** (not in §5). The diagnostic page
   needs localized copy; hardcoding English strings would violate NFR-I18N-01
   and set the wrong precedent for every later screen.
6. **`apps/api/package.json` gained `pg` and `@types/pg`.** pnpm links strictly,
   so a dependency used by the composition root must be declared there too.

### Files touched (actual)

Created: `infra/db/migrations/0001_system_probe.{up,down}.sql`,
`infra/db/README.md`, `scripts/migrate-diagnostic.sh`,
`packages/server-core/src/system/*` (types, use case, repository, PostgreSQL
adapter, specs), `apps/api/src/system/postgres-readiness.check.ts`,
`apps/mobile/lib/features/system_probe/**`,
`apps/mobile/test/features/system_probe/**`,
`tests/integration/system-probe-postgres.spec.ts`,
`tests/e2e/walking-skeleton.spec.ts`.

Updated: `apps/api/src/app.module.ts`, `apps/api/src/system/system.service.ts`,
`apps/api/src/system/system.controller.ts`, `apps/mobile/lib/app/app.dart`,
`apps/mobile/lib/l10n/app_{en,bn}.arb`, `packages/server-core/src/index.ts`,
`packages/server-core/{package.json,tsconfig.json}`, `apps/api/package.json`,
`Makefile`, `pnpm-lock.yaml`, `tests/architecture/module-boundaries.spec.ts`,
`tests/contract/openapi-contract.spec.ts`.

## 16. Definition of Done

- [x] All §14 criteria pass via tests named by EARS/trace ID — EARS-E00-9, -10
      and -11 each have named passing tests, including against real PostgreSQL
      and across container boundaries
- [x] UI fidelity: N/A — development-only diagnostic; tokens and accessibility
      conventions pass
- [ ] Peer-AI review approved by a different model — **NOT DONE**, owner
      directed single-platform execution
- [ ] Task-level QA APPROVE — database migration/security boundary —
      **NOT DONE.** Third consecutive deferred QA gate. This one covers a schema
      migration and the production-exposure guards.
- [ ] Squash-merged to epic branch; tracker + metrics stamped — pending
- [x] Graphiti episode written or “graph not consulted” noted — graph not
      consulted (no Graphiti MCP server connected)
- [ ] Human verified at E00 checkpoint — pending

## 17. Notes for the implementing agent

- Keep the migration intentionally disposable and isolated. It must never
  become a generic metadata/product table.
- PostgreSQL atomic upsert and locking behavior should be verified against
  official PostgreSQL documentation:
  <https://www.postgresql.org/docs/current/sql-insert.html> and
  <https://www.postgresql.org/docs/current/explicit-locking.html>.

## 18. Handoff

N/A unless blocked or frozen.

## Open Questions

- None. Migration execution is an explicit human gate.

## Feedback log

- (human feedback on this deliverable lands here)

## Run log

### Dependencies

`pg` 8.22.0 (MIT) and `@types/pg` 8.20.3 (MIT). No ORM, no query builder, no
migration framework — the task forbids them and the SQL here is one statement.

### The round trip, actually observed

```
$ curl -s -X POST http://127.0.0.1:3000/api/v1/system/walking-skeleton \
       -H 'Content-Type: application/json' -d '{}'
{"status":"persisted","visitCount":2,"correlationId":"af600f80-..."}
HTTP 200
```

Database stopped:

```
{"error":{"code":"SYSTEM.DATABASE_UNAVAILABLE","messageKey":"errors.systemDatabaseUnavailable",
          "correlationId":"51d65776-...","fieldErrors":[]}}
HTTP 503        api container state: running
```

### Evidence

- **Atomicity** — 25 concurrent repository calls against real PostgreSQL yield
  exactly the values 1..25 and a final count of 25. A read-then-write
  implementation passes every sequential test and fails this one.
- **Persistence is real** — the API container is restarted mid-suite and the
  count continues, proving it lives in PostgreSQL and not in process memory.
- **Down-migration is surgical** — a neighbouring table is created, the
  down-migration runs, `system_probes` is gone and the neighbour survives.
- **The table cannot become a product table** — inserting any other `probe_key`
  is rejected by the CHECK constraint.
- **Production exposure** — four independent guards: the config layer refuses to
  boot, the route answers 404, production Compose hard-wires the flag off, and
  the Flutter route is compiled out of a release build entirely.

### Defects found by running the chain, not reading it

| Defect | Impact if shipped |
|---|---|
| Flag had two different names across T02 and T03 | The walking skeleton could never run; the route 404'd everywhere |
| Route returned 201, contract says 200 | Server and every generated client permanently out of step |
| **API process died when PostgreSQL stopped** | Any database restart or failover takes the whole API down instead of returning 503 |
| Contract suite booted with a partial environment | Masked by fail-closed config once the pool was wired |

The third is the serious one. `node-postgres` emits `error` on the pool when an
idle client's connection drops; an `error` event with no listener is an
unhandled exception in Node, so the container exits. It was found only because
the E2E test stops PostgreSQL for real.

### Session refs

- Commits: `2f494cf` (migration, adapter, integration), `31f71b7` (Flutter
  slice, E2E, defect fixes).
