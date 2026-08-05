# ADR consequence audit

Every accepted architectural decision carries consequences. This table says, for
each one, whether E00 implemented it, deferred it to a **named** epic, or ruled
it not applicable — with evidence.

The point is `L-auth-002`: accepted sub-decisions get silently dropped. A vague
"later" is what this document exists to prevent, so every deferral names the
epic or the human contract that owns it.

**Status key** — ✅ implemented in E00 · ⏭️ mapped to a named later gate ·
🔒 unresolved human decision · N/A justified.

## ADR-0001 — Application stack

Flutter/Dart owner app, Next.js admin, NestJS/TypeScript API and worker.

| Consequence | Status | Evidence |
|---|---|---|
| Four entry points build from pinned toolchains | ✅ | `make toolchain`, `make build`; `test_EARS_E00_1_each_entry_point_builds` |
| Node 24.4.0, pnpm 11.20.0, Flutter 3.44.0, Dart 3.12.0 pinned | ✅ | `.node-version`, `.flutter-version`, `packageManager`, `scripts/check-toolchain.sh` |
| Android host exists for the owner app | ✅ | `apps/mobile/android/` |
| **APK/IPA compile unproven** | 🔒 | No Android `cmdline-tools`, no full Xcode on the build machine. Needs CI runners or a configured machine — first real device build gate |
| Two languages verified in CI | ✅ | `.github/workflows/ci.yml` jobs `typescript` and `flutter` |

## ADR-0002 — Architecture style

Modular monolith plus a separately runnable worker.

| Consequence | Status | Evidence |
|---|---|---|
| API and worker are separate composition roots | ✅ | `test_EARS_E00_2_api_worker_have_separate_composition_roots` |
| Neither imports the other's internals | ✅ | `test_ADR_0002_forbidden_module_import_fails` |
| Both stay resident and stop gracefully | ✅ | `test_EARS_E00_2_api_and_worker_stay_resident_as_separate_processes` |
| Consumers use the `@garazo/server-core` public surface only | ✅ | Architecture test rejects deep imports |
| Module boundaries declared | ✅ | `registerModuleBoundary` |
| Worker does real background work | ⏭️ | No queue consumer yet — arrives with ADR-0009's dependency gate; E04 is the first epic that needs one |

## ADR-0003 — Delivery methodology

Flow-based Kanban, thin vertical slices, WIP limits.

| Consequence | Status | Evidence |
|---|---|---|
| Work flows as one-task branches and worktrees | ✅ | `epic_00_task_01` … `_05`, squash-merged per task |
| Each task is a vertical slice | ✅ | T04 spans migration → adapter → API → generated client → UI |
| WIP limits respected | ✅ | E00 ran strictly serially, as its own tracker requires |
| Peer review on every task | 🔒 | **NOT DONE.** The owner directed single-platform execution, so no second model reviewed any E00 task (constitution rule 12) |

## ADR-0004 — Third-party service boundary

Provider ports/adapters in the owning modules; durable intent; normalized results.

| Consequence | Status | Evidence |
|---|---|---|
| Provider-neutral ports exist | ✅ | `packages/server-core/src/ports/` — durable-job, object-storage, phone-identity, sms-sender |
| No provider SDK type in domain code | ✅ | `test_ADR_0004_domain_code_has_no_provider_sdk_import`, with an enumerated adapter allowlist |
| Adapter edges are identifiable | ✅ | `postgres-*.ts`, `*.check.ts`, composition roots — the allowlist is asserted so it cannot spread |
| PostgreSQL reached only through an adapter | ✅ | `PostgresSystemProbeRepository`, `PostgresReadinessCheck` |
| Firebase / SMS / object-storage adapters | ⏭️ | Ports only. Firebase adapter is E01; SMS is E04; object storage is E02-T14 behind its own gate |
| Durable intent + normalized result records | ⏭️ | Port signatures reserve the shape. First real use is the SMS reminder adapter in **E04**; the durable-intent record lands with the queue tables in the same epic |

## ADR-0005 — Datastore

Managed PostgreSQL for structured records, private object storage for media.

| Consequence | Status | Evidence |
|---|---|---|
| PostgreSQL holds structured records | ✅ | `system_probes` via a real round trip |
| Binaries never stored in PostgreSQL | ✅ | No binary column exists; `ObjectStoragePort` reserves the boundary |
| Database is external to the application VM | ✅ | `test_EARS_E00_6_production_compose_has_only_application_services` |
| Migrations are explicit, reversible, human-gated | ✅ | `infra/db/migrations/0001_*`, `scripts/migrate-diagnostic.sh` refuses production |
| **Managed supplier, region, tier** | 🔒 | Open items 2 and 1 |
| **Object storage supplier and bucket policy** | 🔒 | Open item 3 |
| **Backup policy, RPO/RTO** | 🔒 | Open items 7 and 8 — an unverified backup is not a backup |

## ADR-0006 — Hosting and runtime

Single hardened VM with Docker Compose; managed PostgreSQL and object storage.

| Consequence | Status | Evidence |
|---|---|---|
| Exactly three application containers in production | ✅ | Asserted by test and by `verify-compose.sh` |
| Images are non-root, multi-stage, health-checked | ✅ | `test_ADR_0006_each_service_image_is_non_root`; live stack shows user `garazo` |
| Nothing authoritative on the VM | ✅ | No volume, no data service; `scripts/rehearse-vm-rebuild.sh` |
| Rebuild/rollback/deploy runbooks exist and are honest | ✅ | `infra/vm/*`; every unresolved step marked BLOCKED |
| Hardening checklist | ✅ | `infra/vm/hardening-checklist.md` — container items done, host items pending a host |
| **Supplier, region, sizing** | 🔒 | Open items 1 and 12 |
| **TLS/ingress, secret manager, registry** | 🔒 | Open items 5, 6, 4 |
| **Base image digest pinning** | 🔒 | Open item 11. Tag-pinned today; a digest must come from the chosen registry and was deliberately **not invented** |
| **Availability target** | 🔒 | Open item 9 — a single VM cannot meet a high one; if one is promised, this ADR reopens |
| **Observability supplier** | 🔒 | Open item 10 — logs must leave the host to survive it |

## ADR-0007 — Authentication and session

Firebase phone OTP for identity; Garazo owns authorization, session, and the
separate owner-PIN grant. **Accepted conditionally**, pending a Bangladesh
delivery, privacy, abuse and cost pilot.

| Consequence | Status | Evidence |
|---|---|---|
| Identity, workshop scope, owner-money grant and admin scope are distinct types | ✅ | `test_ADR_0007_identity_session_owner_grant_admin_scope_are_distinct` |
| A client-supplied identifier is never authority | ✅ | `test_NFR_SEC_01_context_never_authorizes_client_scope` |
| Unauthenticated/unscoped states are representable | ✅ | `anonymous`, `none`, `locked` are first-class, not nulls |
| Owner-money grant is workshop-scoped and expiring | ✅ | `grantsMoneyAccess` checks kind, workshop and expiry together |
| No Firebase type in domain code | ✅ | `PhoneIdentityPort` only |
| Phone OTP, sessions, owner PIN implemented | ⏭️ | **E01.** The Q-005 answer fixes the exact relock/cooldown/recovery behaviour |
| **Bangladesh delivery / privacy / abuse / cost pilot** | 🔒 | Condition of the acceptance. Must complete before production; failing it means replacing one adapter, not rewriting the product |

## ADR-0008 — API style

Versioned REST/JSON described by OpenAPI.

| Consequence | Status | Evidence |
|---|---|---|
| One canonical contract | ✅ | `contracts/openapi/garazo.v1.yaml` |
| Clients generated, never hand-written | ✅ | `test_ADR_0008_generated_tree_has_zero_drift`, `test_ADR_0008_flutter_uses_the_generated_client` |
| Generator pinned | ✅ | OpenAPI Generator 7.24.0 via `openapitools.json` |
| One redacted error envelope | ✅ | `test_EARS_E00_4_error_envelope_leaks_no_internal_detail` |
| Versioned path prefix | ✅ | `/api/v1/...` |
| Correlation id on every response, never identity | ✅ | Contract-level test plus source assertion |
| Product endpoints | ⏭️ | E01 onward. E00 authorizes no product payload |

## ADR-0009 — Background jobs and queue

Database-backed durable queue in PostgreSQL, using a maintained worker library.
Accepts the **pattern**, not a specific dependency.

| Consequence | Status | Evidence |
|---|---|---|
| Provider-neutral durable-job port exists | ✅ | `DurableJobPort` |
| Worker runs as a separate process | ✅ | Proven resident and separately stoppable |
| Queue tables and consumer | ⏭️ | First epic that needs background work — E04 (reminders) |
| **Concrete queue library** | 🔒 | Explicitly still human-gated by the ADR itself. `WORKER_CONCURRENCY=1` is a skeleton value, not a throughput commitment |

## Summary

| Status | Count |
|---|---|
| ✅ implemented and evidenced in E00 | 38 |
| ⏭️ mapped to a named later epic | 9 |
| 🔒 unresolved human decision | 18 |

**No consequence is unaccounted for.** The 🔒 rows are the honest cost of
E00: real decisions that a human still owes, each recorded in
`infra/vm/recovery-open-items.md` or in its ADR. None of them blocks local
verification; several block production.

Two 🔒 rows are process debt rather than product decisions and deserve separate
attention at the checkpoint:

- **Peer review did not happen on any E00 task** (ADR-0003, constitution rule 12).
- **Task-level QA is deferred on T02, T03 and T04**, which together define the
  authorization boundary, secret handling, log redaction, production topology
  and the first schema migration.
