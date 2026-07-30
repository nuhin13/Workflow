---
id: E00-T02
epic: E00
type: genesis
title: Establish OpenAPI and generated clients
layer: cross-cutting
size: M
status: todo
owner_agent: developer-backend
preferred_agent: any
tier: build
token_estimate: { tier: M, range: "60k-120k" }
priority: { moscow: must, p: P2 }
depends_on: [E00-T01]
blocks: [E00-T03]
traces_to: [FR-ACCESS-05, FR-ONLINE-01, FR-ONLINE-02, NFR-SEC-01, NFR-REL-01, ADR-0002, ADR-0007, ADR-0008]
external_services: []
files:
  create:
    - contracts/openapi/garazo.v1.yaml
    - contracts/openapi/generator/dart.yaml
    - contracts/openapi/generator/typescript.yaml
    - scripts/generate-api-clients.sh
    - scripts/check-api-contract.sh
    - packages/api-client-typescript/package.json
    - packages/api-client-typescript/src/index.ts
    - packages/api-client-typescript/src/generated/
    - apps/mobile/lib/core/api/generated/
    - apps/api/src/common/errors/api-error.ts
    - apps/api/src/common/errors/api-error.filter.ts
    - apps/api/src/common/request/request-context.ts
    - apps/api/src/common/request/request-context.middleware.ts
    - apps/api/src/system/system.controller.ts
    - apps/api/src/system/system.service.ts
    - apps/api/src/system/system.module.ts
    - packages/server-core/src/access/access-context.ts
    - packages/server-core/src/access/owner-money-grant.ts
    - packages/server-core/src/access/admin-scope.ts
    - tests/architecture/module-boundaries.spec.ts
    - tests/contract/openapi-contract.spec.ts
    - tests/contract/generated-client-drift.spec.ts
  update:
    - apps/api/src/app.module.ts
    - apps/mobile/pubspec.yaml
    - apps/mobile/pubspec.lock
    - pnpm-lock.yaml
feature_flags: [system.walkingSkeleton]
ui_reference: "N/A — contract and security boundary; no product UI"
started_at:
completed_at:
executed_by:
reviewed_at:
reviewed_by:
review_outcome:
---
# E00-T02 · Establish OpenAPI and generated clients

## 1. Feature goal

Create one versioned REST/OpenAPI contract, generated Dart/TypeScript clients,
stable errors, and request/access boundaries so later tasks cannot invent
incompatible APIs.

## 2. Business logic

Apply ADR-0008: `contracts/openapi/garazo.v1.yaml` is canonical and generated
clients are not hand-edited. Apply ADR-0007 without implementing Firebase:
phone identity, Garazo session/workshop scope, admin scope, and owner-money
grant are separate types. Apply ADR-0002: transport code calls module public
interfaces only.

This task defines infrastructure routes plus the E00-only diagnostic contract.
It does not authorize any product entity/payload. A client workshop ID is
never authorization. All errors use `conventions.md` and expose no protected
data.

## 3. What this task DOES

- Define OpenAPI 3.x contract metadata, shared error/correlation schemas,
  liveness/readiness routes, and the gated walking-skeleton route.
- Generate compileable Dart and TypeScript clients from a pinned, approved
  generator and add deterministic drift checks.
- Implement process liveness and dependency-readiness transport boundaries.
- Define request context/access grant types and an error filter.
- Enforce module/public-import and no-provider-type architecture checks.

## 4. What this task does NOT do (scope fence)

- Do not implement the walking-skeleton database use case; T04 owns it.
- Do not implement Firebase, sessions/cookies/tokens, owner PIN, admin login,
  product endpoints, workshop records, provider adapters, or feature code.
- Do not select product pagination fields beyond the common
  `{items,nextCursor}` convention.
- Do not change Docker/Compose/CI/VM files owned by parallel T03.
- Do not add generator/runtime dependencies before human approval.
- Do not edit state, traceability, AGENTS.md, harness, or approved upstream
  artifacts.

## 5. Files & changes

### Add

- `contracts/openapi/garazo.v1.yaml` — canonical contract.
- `contracts/openapi/generator/*.yaml` — deterministic Dart/TypeScript output.
- `scripts/generate-api-clients.sh` and `scripts/check-api-contract.sh` —
  pinned generation and drift validation.
- Generated client trees listed in frontmatter; every generated file must stay
  inside those two output directories.
- API common error/request context and system liveness/readiness files.
- Server access-boundary types and architecture/contract tests.

### Update

- `apps/api/src/app.module.ts` — register only the system module and request
  context/error filter.
- `apps/mobile/pubspec.yaml` — add only generator-required runtime support
  after human approval.
- `apps/mobile/pubspec.lock` and `pnpm-lock.yaml` — record only the approved
  generator/client dependency changes.
- `packages/api-client-typescript/src/index.ts` — export generated client.

### Delete

- None.

> The diff may not exceed this list. QA enforces.

## 6. Database changes

No DB changes. Readiness uses an injected `ReadinessCheck` port; T04 binds its
PostgreSQL implementation.

## 7. API changes

All responses set/return `X-Correlation-Id`; an invalid supplied value is
replaced with a server-generated opaque value.

| Method | Path | Auth | Request | Response | Status |
|---|---|---|---|---|---|
| GET | `/api/v1/system/live` | none | none | `{status:"ok", correlationId:string}` | 200 |
| GET | `/api/v1/system/ready` | none | none | `{status:"ready", checks:{database:"up"}, correlationId:string}` | 200 |
| GET | `/api/v1/system/ready` | none | none | standard error envelope, code `SYSTEM.NOT_READY` | 503 |
| POST | `/api/v1/system/walking-skeleton` | none; non-production flag required | empty JSON object; unknown fields rejected | `{status:"persisted", visitCount:integer>=1, correlationId:string}` | 200 |
| POST | `/api/v1/system/walking-skeleton` | none | empty object | standard envelope `SYSTEM.NOT_FOUND` when flag/environment disallows route | 404 |
| POST | `/api/v1/system/walking-skeleton` | none | empty object | standard envelope `SYSTEM.DATABASE_UNAVAILABLE` | 503 |

Pagination: N/A — no list endpoint.

Validation:

- Request body must be exactly `{}`; an absent body or any field returns 400
  `VALIDATION.INVALID_FIELD`.
- `X-Correlation-Id`, when accepted, is 1–128 printable ASCII characters and
  is never treated as identity/authorization.
- `visitCount` is a non-negative transport integer but successful persistence
  returns at least 1.
- Walking-skeleton route is enabled only when both environment is not
  `production` and flag `system.walkingSkeleton` is true.
- Idempotency: N/A — diagnostic increments on each accepted call. The contract
  states explicitly that it proves a database round trip, not product
  idempotency.

Error envelope:

```json
{"error":{"code":"SYSTEM.NOT_READY","messageKey":"errors.systemNotReady","correlationId":"opaque","fieldErrors":[]}}
```

No other top-level error shape is permitted.

## 8. Functions

```yaml
functions:
  - signature: "SystemController.live(context: RequestContext) -> LiveResponse"
    params: { context: "server-created correlation/access context" }
    returns: "LiveResponse — status ok and correlationId"
    purpose: "Process-only liveness; no downstream call"
  - signature: "SystemController.ready(context: RequestContext) -> Promise<ReadyResponse>"
    params: { context: "server-created request context" }
    returns: "ReadyResponse or standard 503 ApiError"
    purpose: "Dependency readiness without leaking config"
  - signature: "SystemController.walkingSkeleton(context: RequestContext, body: EmptyObject) -> Promise<WalkingSkeletonResponse>"
    params: { context: "request correlation context", body: "validated empty object" }
    returns: "Generated contract response; implementation injected by T04"
    purpose: "Transport boundary for the gated persistence probe"
  - signature: "SystemService.isLive() -> LiveResult"
    params: {}
    returns: "LiveResult — process-local result"
    purpose: "Keep liveness controller trivial"
  - signature: "SystemService.isReady() -> Promise<ReadinessResult>"
    params: {}
    returns: "Dependency-neutral readiness result"
    purpose: "Invoke the injected readiness port"
  - signature: "createRequestContext(headers: IncomingHeaders) -> RequestContext"
    params: { headers: "untrusted HTTP headers" }
    returns: "Immutable server-created context with safe correlation ID"
    purpose: "Centralize context creation and validation"
  - signature: "toApiError(error: unknown, context: RequestContext) -> ApiErrorEnvelope"
    params: { error: "unknown caught error", context: "safe request context" }
    returns: "Stable redacted envelope"
    purpose: "One error translation path"
  - signature: "generateApiClients() -> exit code"
    params: {}
    returns: "0 only when pinned generation succeeds"
    purpose: "Regenerate both clients from the canonical contract"
  - signature: "checkApiContract() -> exit code"
    params: {}
    returns: "0 only when contract validates and generated tree is clean"
    purpose: "CI compatibility/drift gate"
```

Access types contain opaque IDs/expiry and no framework/provider type:
`RequestContext`, `AuthenticatedActor`, `WorkshopScope`, `OwnerMoneyGrant`,
`AdminScope`.

## 9. UI changes

No UI changes. Generated clients compile but are not invoked until T04.

## 10. External services & feature flags

- OpenAPI generator: exact pinned version/image and license require human
  dependency approval before use. Prefer the official OpenAPI Generator
  project and record its version:
  <https://openapi-generator.tech/docs/installation/>.
- `system.walkingSkeleton`: default `false`; non-production only; cannot be
  enabled by a product/admin remote flag.

## 11. Challenges / Risks

- Generated Dart/TypeScript output can be non-deterministic; pin generator,
  normalize paths, and compare clean output.
- A 404 flag path must not disclose that a diagnostic route exists.
- Request context types can accidentally imply authorization before auth is
  implemented. They must represent absent/unauthenticated state safely.
- Health endpoints must not expose hostnames, database URLs, versions, or
  stack traces.

## 12. Implementation checklist  (live execution log)

- [ ] tests written FIRST and failing for EARS-E00-3/4/5
- [ ] generator exact version/license human-approved
- [ ] canonical contract validates
- [ ] Dart and TypeScript clients generated deterministically
- [ ] API error/correlation behavior implemented and redacted
- [ ] liveness/readiness endpoints match contract
- [ ] access/grant types are separate and provider-neutral
- [ ] module/provider architecture tests reject forbidden imports
- [ ] generated-client drift test passes from clean tree

## 13. Test plan

### Automated

- `test_EARS_E00_3_openapi_generates_both_clients` → clean generation compiles
  Dart and TypeScript outputs.
- `test_EARS_E00_4_error_envelope_is_uniform_and_redacted` → 400/404/503 use
  one shape with no secret/protected field.
- `test_NFR_SEC_01_context_never_authorizes_client_scope` → supplied workshop
  identifier cannot populate server-resolved scope.
- `test_ADR_0002_forbidden_module_import_fails` → architecture fixture proves
  private/cyclic import detection.
- `test_ADR_0007_identity_session_owner_grant_admin_scope_are_distinct` →
  type/architecture test prevents substitution.
- `test_ADR_0008_generated_tree_has_zero_drift` → regeneration yields no diff.

### Manual QA

1. Run generation twice → second run changes zero file.
2. Call `/live` → 200 with only status and correlation.
3. Make readiness port fail → 503 uniform error, no dependency detail.
4. Enable/disable diagnostic flag in non-production → contract gives
   available/404 behavior; production always hides it.

## 14. Acceptance criteria (EARS)

- EARS-E00-3: WHEN the canonical OpenAPI generation command runs, the system
  SHALL produce compiling Dart and TypeScript clients with zero uncommitted
  drift on a second run.
- EARS-E00-4: WHEN any system route rejects or fails, the API SHALL return the
  one redacted error envelope with a safe correlation ID.
- EARS-E00-5: WHILE the environment is production or the diagnostic flag is
  false, the API SHALL expose no usable walking-skeleton route.

## 15. Self-review (agent fills BEFORE status: review-requested)

- [ ] All checklist items done (with commit hashes)
- [ ] `make test && make lint` pass for affected apps
- [ ] Loading/error/empty states: N/A — no UI
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
- [ ] Task-level QA APPROVE — security/authorization contract task
- [ ] Squash-merged to epic branch; tracker + metrics stamped
- [ ] Graphiti episode written or “graph not consulted” noted
- [ ] Human verified at E00 checkpoint

## 17. Notes for the implementing agent

- OpenAPI is the application contract. Future TireBook will get a separate
  contract; do not reserve its fields now.
- Official primary references:
  <https://spec.openapis.org/oas/latest.html>,
  <https://docs.nestjs.com/openapi/introduction>, and
  <https://openapi-generator.tech/docs/installation/>.

## 18. Handoff

N/A unless blocked or frozen.

## Open Questions

- None. The generator approval is an explicit dependency gate.

## Feedback log

- (human feedback on this deliverable lands here)

## Run log

- (contract version, generator version, checks, and session refs)
