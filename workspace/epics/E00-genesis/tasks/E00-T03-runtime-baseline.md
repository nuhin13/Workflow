---
id: E00-T03
epic: E00
type: genesis
title: Containerize runtime and CI baseline
layer: infra
size: M
status: todo
owner_agent: devops
preferred_agent: any
tier: build
token_estimate: { tier: M, range: "60k-130k" }
priority: { moscow: must, p: P2 }
depends_on: [E00-T01]
blocks: [E00-T04]
traces_to: [FR-ONLINE-01, FR-ONLINE-02, NFR-REL-01, NFR-SEC-01, ADR-0004, ADR-0005, ADR-0006]
external_services: [managed-postgresql-boundary, private-object-storage-boundary, off-host-observability-boundary]
files:
  create:
    - .github/workflows/ci.yml
    - .dockerignore
    - .env.example
    - apps/admin/Dockerfile
    - apps/api/Dockerfile
    - apps/worker/Dockerfile
    - infra/compose/compose.production.yaml
    - infra/compose/compose.development.yaml
    - infra/compose/README.md
    - infra/vm/hardening-checklist.md
    - infra/vm/deploy-runbook.md
    - infra/vm/rebuild-runbook.md
    - infra/vm/rollback-runbook.md
    - infra/vm/recovery-open-items.md
    - docs/operations/configuration.md
    - docs/operations/observability.md
    - docs/operations/third-party-services.md
    - packages/runtime-config/package.json
    - packages/runtime-config/tsconfig.json
    - packages/runtime-config/src/config.ts
    - packages/runtime-config/src/logger.ts
    - packages/runtime-config/src/index.ts
    - packages/runtime-config/src/config.spec.ts
    - packages/runtime-config/src/logger.spec.ts
    - scripts/compose-up.sh
    - scripts/compose-down.sh
    - scripts/verify-compose.sh
    - scripts/scan-secrets.sh
  update:
    - Makefile
    - apps/api/src/main.ts
    - apps/worker/src/main.ts
feature_flags: []
ui_reference: "N/A — infrastructure task"
started_at:
completed_at:
executed_by:
reviewed_at:
reviewed_by:
review_outcome:
---
# E00-T03 · Containerize runtime and CI baseline

## 1. Feature goal

Create the selected hardened-VM container contract, managed-data boundaries,
safe configuration/logging, CI gates, and rebuild/rollback instructions
without touching production infrastructure.

## 2. Business logic

Apply ADR-0006 Option 3 exactly: the production VM runs only the Next.js
admin, NestJS API, and NestJS worker in Docker Compose. Managed PostgreSQL and
private object storage remain external. Apply ADR-0004 by exposing provider
configuration only to adapters, and ADR-0005 by keeping binary storage out of
PostgreSQL.

The authoritative database, private objects, source, secret/config recovery
material, and backups must survive VM loss. Supplier, region, networking,
TLS/ingress, secrets manager, image registry, RPO/RTO, availability target,
backup policy, sizing, and production values are unresolved human-approved
contracts; record them as open operational items, do not choose them.

## 3. What this task DOES

- Add multi-stage, non-root Dockerfiles for admin, API, and worker.
- Add production Compose for those three services and development Compose with
  a local test-only PostgreSQL compatibility service.
- Add validated configuration and structured/redacted JSON logging shared by
  API/worker.
- Add health checks, resource boundaries placeholders, restart behavior, and
  graceful shutdown.
- Add CI for both toolchains, contract/architecture placeholders, secret scan,
  dependency audit, container build, and Compose smoke.
- Add supplier-neutral hardening/deploy/rebuild/rollback and observability
  runbooks.

## 4. What this task does NOT do (scope fence)

- Do not provision a VM, DNS, TLS, firewall, managed database, object bucket,
  registry, monitoring supplier, backup, or production environment.
- Do not create/commit a secret, real endpoint, credential, private key,
  Firebase config, customer data, or production Compose override.
- Do not put PostgreSQL or object storage on the production application VM.
- Do not run/create a database migration or add product schema.
- Do not implement OpenAPI/system routes (parallel T02), walking-skeleton code
  (T04), provider adapters, auth, queue library, or feature code.
- Do not edit state, traceability, AGENTS.md, harness, or upstream artifacts.

## 5. Files & changes

### Add

- `.github/workflows/ci.yml` — pull-request CI, no deployment.
- `.dockerignore`, `.env.example`, three service Dockerfiles.
- `infra/compose/*` — production topology and local/test compatibility stack.
- `infra/vm/*` — supplier-neutral operator controls and unresolved
  human-contract register.
- `docs/operations/*` — config/log/third-party inventory.
- `packages/runtime-config/*` — schema validation and redacted logger.
- `scripts/*` — safe, non-destructive Compose/scan checks.

### Update

- `Makefile` — implement `up`, `down`, `verify` and Compose smoke targets.
- `apps/api/src/main.ts` — validated configuration, structured logger,
  graceful shutdown.
- `apps/worker/src/main.ts` — same plus worker-ready marker for health.

### Delete

- None.

> The diff may not exceed this list (lockfiles excepted). QA enforces.

## 6. Database changes

No migration or schema change.

`compose.development.yaml` may run an official PostgreSQL container for
development/integration compatibility only. It uses a named volume and a
non-secret local credential from `.env.example`; `compose-down.sh` must not
delete volumes. The production Compose file accepts an external managed
`DATABASE_URL` and contains no PostgreSQL service.

## 7. API changes

No new API contract. Container health uses T02's:

- `GET /api/v1/system/live` for API liveness.
- `GET /api/v1/system/ready` for dependency readiness.
- Admin container uses its root shell response.
- Worker health uses a local readiness marker written only after bootstrap.

Pagination/idempotency: N/A.

## 8. Functions

```yaml
functions:
  - signature: "loadRuntimeConfig(env: Record<string, string | undefined>) -> RuntimeConfig"
    params: { env: "untrusted process environment" }
    returns: "immutable validated config; throws ConfigError naming keys, never values"
    purpose: "Fail closed before process bootstrap"
  - signature: "createStructuredLogger(service: ServiceName, sink?: LogSink) -> Logger"
    params: { service: "admin|api|worker", sink: "injectable output for tests" }
    returns: "JSON logger with correlation and redaction"
    purpose: "One operational logging pattern"
  - signature: "redactLogFields(record: LogRecord) -> SafeLogRecord"
    params: { record: "structured candidate log" }
    returns: "record with secret, OTP, PIN, token, phone, protected-money and payload fields removed"
    purpose: "Prevent sensitive operational output"
  - signature: "installGracefulShutdown(app: ClosableApplication) -> void"
    params: { app: "API or worker composition root" }
    returns: "void"
    purpose: "Stop accepting/claiming work and close resources on SIGTERM"
  - signature: "markWorkerReady(path: string) -> Promise<void>"
    params: { path: "container-local fixed readiness marker path" }
    returns: "Promise<void> after atomic marker creation"
    purpose: "Worker container health without exposing an HTTP port"
  - signature: "verifyCompose() -> exit code"
    params: {}
    returns: "0 only when Compose validates, images build, services become healthy, and logs contain no known secret fixture"
    purpose: "Local/CI runtime smoke gate"
```

Runtime config key names (values are never committed):

- Common: `APP_ENV`, `LOG_LEVEL`.
- API: `API_PORT`, `DATABASE_URL`, `WALKING_SKELETON_ENABLED`.
- Worker: `DATABASE_URL`, `WORKER_CONCURRENCY` (E00 value `1`; not a future
  throughput commitment).
- Admin: `API_BASE_URL`.
- Boundary-only, unused until approved adapter tasks:
  `OBJECT_STORAGE_ENDPOINT`, `OBJECT_STORAGE_BUCKET`,
  `FIREBASE_PROJECT_ID`, `SMS_PROVIDER`.

Provider credential key names are intentionally absent until their approved
adapter task.

## 9. UI changes

No UI changes.

## 10. External services & feature flags

- Managed PostgreSQL: external production boundary only; supplier/region not
  selected.
- Private object storage: external boundary only; no adapter/credential.
- Off-host logs/metrics/alerts: interface/runbook only; supplier not selected.
- No feature flag introduced. T02 owns the diagnostic flag.

## 11. Challenges / Risks

- Compose can accidentally bundle PostgreSQL into production; a static test
  must reject any production `postgres`/object-store service.
- A configuration error can leak the value in logs; tests use secret fixtures
  and assert absence.
- Container health can pass before dependencies are usable; readiness must be
  distinct from liveness.
- A single VM is a shared failure domain; runbooks must be executable from
  source and off-host material, not host-local state.
- A CI workflow can imply deployment authority; this task performs no deploy.

## 12. Implementation checklist  (live execution log)

- [ ] tests written FIRST and failing for EARS-E00-6/7/8
- [ ] three non-root, multi-stage Dockerfiles build
- [ ] production Compose contains exactly admin/API/worker application services
- [ ] development Compose adds only test-compatible dependencies
- [ ] configuration validation updates all launch paths and `.env.example`
- [ ] logger redaction tests cover every prohibited field category
- [ ] API/worker graceful shutdown and health behavior work
- [ ] CI gates both languages, contracts, architecture, secrets, dependencies, images, and Compose smoke
- [ ] supplier-neutral hardening/deploy/rebuild/rollback/runbook open items complete
- [ ] no real secret, endpoint, supplier, production value, or destructive volume command exists

## 13. Test plan

### Automated

- `test_EARS_E00_6_production_compose_has_only_application_services` → admin,
  API, worker present; PostgreSQL/object store absent.
- `test_ADR_0006_each_service_image_is_non_root_and_healthy` → inspect images
  and health states.
- `test_L_PROCESS_005_required_config_is_present_in_all_launchers` → config
  schema, example, Compose, CI, and docs match.
- `test_EARS_E00_7_logger_redacts_sensitive_fields` → seeded OTP/PIN/token/
  phone/money/provider payload never appears.
- `test_NFR_SEC_01_readiness_leaks_no_connection_detail` → failed DB produces
  only stable state/code.
- `test_EARS_E00_8_compose_down_preserves_named_volumes` → script omits
  destructive volume flags.

### Manual QA

1. Validate production Compose → exactly three application services and
   external data environment references.
2. Build/run as non-root → health transitions correctly.
3. Stop API/worker → graceful shutdown completes within documented limit.
4. Follow rebuild/rollback runbooks in non-production → identify every step
   that still requires a later supplier/RPO/RTO approval.

## 14. Acceptance criteria (EARS)

- EARS-E00-6: WHEN the production Compose definition is validated, it SHALL
  contain containerized admin, API, and worker services while PostgreSQL and
  private object storage remain external.
- EARS-E00-7: WHEN any service emits a structured log containing a prohibited
  sensitive fixture, the retained output SHALL contain zero prohibited value.
- EARS-E00-8: WHEN the non-production stack is built and started, each
  application container SHALL become healthy and SHALL stop gracefully
  without deleting retained development data.

## 15. Self-review (agent fills BEFORE status: review-requested)

- [ ] All checklist items done (with commit hashes)
- [ ] `make test && make lint` pass for affected code
- [ ] Loading/error/empty states: N/A — infrastructure
- [ ] Audit entry on lifecycle writes: N/A — no lifecycle write
- [ ] No secrets/PII logged
- [ ] Diff confined to §5 list; §4 respected

### Deviations from spec

(none)

### Files touched (actual)

- ...

## 16. Definition of Done

- [ ] All §14 criteria pass via tests named by EARS/trace ID
- [ ] UI fidelity: N/A — no UI
- [ ] Peer-AI review approved by a different model
- [ ] Task-level QA APPROVE — security/config/runtime foundation
- [ ] Squash-merged to epic branch; tracker + metrics stamped
- [ ] Graphiti episode written or “graph not consulted” noted
- [ ] Human verified at E00 checkpoint

## 17. Notes for the implementing agent

- Docker's production Compose guidance:
  <https://docs.docker.com/compose/how-tos/production/>.
- Dockerfile build and non-root behavior must be pinned/reproducible; do not
  use an unpinned floating runtime in a release artifact.
- `recovery-open-items.md` is deliberately explicit: unresolved production
  values are gates, not permission to guess.

## 18. Handoff

N/A unless blocked or frozen.

## Open Questions

- None for E00 implementation. Supplier, region, TLS/ingress, secret manager,
  registry, backup/RPO/RTO, availability target, observability supplier, and
  sizing are intentionally later human-approved production contracts.

## Feedback log

- (human feedback on this deliverable lands here)

## Run log

- (image digests, Compose evidence, security scan, and session refs)
