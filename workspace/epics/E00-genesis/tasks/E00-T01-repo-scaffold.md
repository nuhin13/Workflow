---
id: E00-T01
epic: E00
type: genesis
title: Scaffold repository and module boundaries
layer: cross-cutting
size: M
status: todo
owner_agent: developer-backend
preferred_agent: any
tier: build
token_estimate: { tier: M, range: "50k-100k" }
priority: { moscow: must, p: P2 }
depends_on: []
blocks: [E00-T02, E00-T03]
traces_to: [NFR-REL-01, NFR-I18N-01, NFR-A11Y-01, NFR-INDEPENDENCE-01, ADR-0001, ADR-0002]
external_services: []
files:
  create:
    - package.json
    - pnpm-lock.yaml
    - pnpm-workspace.yaml
    - .node-version
    - .flutter-version
    - apps/mobile/.metadata
    - apps/mobile/android/
    - apps/mobile/pubspec.yaml
    - apps/mobile/analysis_options.yaml
    - apps/mobile/l10n.yaml
    - apps/mobile/lib/main.dart
    - apps/mobile/lib/app/app.dart
    - apps/mobile/lib/core/design/generated/design_tokens.dart
    - apps/mobile/lib/l10n/app_bn.arb
    - apps/mobile/lib/l10n/app_en.arb
    - apps/mobile/test/app/app_test.dart
    - apps/admin/package.json
    - apps/admin/tsconfig.json
    - apps/admin/next.config.ts
    - apps/admin/src/app/layout.tsx
    - apps/admin/src/app/page.tsx
    - apps/api/package.json
    - apps/api/tsconfig.json
    - apps/api/src/main.ts
    - apps/api/src/app.module.ts
    - apps/worker/package.json
    - apps/worker/tsconfig.json
    - apps/worker/src/main.ts
    - apps/worker/src/worker.module.ts
    - packages/server-core/package.json
    - packages/server-core/tsconfig.json
    - packages/server-core/src/index.ts
    - packages/server-core/src/modules/module-boundary.ts
    - packages/server-core/src/ports/durable-job.port.ts
    - packages/server-core/src/ports/object-storage.port.ts
    - packages/server-core/src/ports/phone-identity.port.ts
    - packages/server-core/src/ports/sms-sender.port.ts
    - packages/design-tokens/package.json
    - packages/design-tokens/src/tokens.ts
    - scripts/check-toolchain.sh
    - scripts/generate-design-tokens.mjs
    - scripts/check-design-tokens.mjs
    - tests/contract/design-token-drift.spec.ts
    - tsconfig.base.json
    - eslint.config.mjs
    - prettier.config.mjs
  update:
    - Makefile
    - .gitignore
    - README.md
feature_flags: []
ui_reference: "N/A — application shells only; no product screen is implemented"
started_at:
completed_at:
executed_by:
reviewed_at:
reviewed_by:
review_outcome:
---
# E00-T01 · Scaffold repository and module boundaries

## 1. Feature goal

Create the accepted Flutter/Next.js/NestJS repository shape and enforce the
modular-monolith entry-point boundaries without implementing product behavior.

## 2. Business logic

This is supporting infrastructure for `NFR-REL-01`,
`NFR-INDEPENDENCE-01`, `NFR-I18N-01`, and `NFR-A11Y-01`; it does not claim
those product requirements are complete. Apply ADR-0001 and ADR-0002
literally: Flutter owner app, Next.js admin, NestJS API and separately runnable
worker, with shared server modules behind public interfaces. Apply
`conventions.md`.

The dependency list is a human gate. Before changing manifests or installing,
present exact versions/licenses for Flutter 3.44.x/Dart 3.12.x, Node 24 LTS,
pnpm, Next.js 16, React compatible with Next.js 16, NestJS 11, TypeScript,
ESLint, and Prettier. Do not add state, ORM, auth, queue, provider, telemetry,
or UI-component libraries.

## 3. What this task DOES

- Pin the two language runtimes and create the workspace/app/package skeletons,
  including the minimal Android host required to run the Flutter owner app.
- Create buildable owner-app and admin shells with approved design tokens, but
  no product navigation or feature data.
- Generate both Dart and TypeScript token targets from the approved
  `workspace/plan/01-design/tokens.json` source and reject drift.
- Add Bangla/English localization plumbing with non-product shell copy only.
- Create separate NestJS API and worker composition roots.
- Define provider-neutral port types and a module-boundary marker with no live
  adapter.
- Add root commands for approved install/build/lint/test/dev workflows while
  preserving harness targets.

## 4. What this task does NOT do (scope fence)

- Do not implement authentication, workshop setup, jobs, money, reminders,
  admin features, analytics, or NFR-ADOPTION-02.
- Do not add database schema/migration, REST endpoints, OpenAPI generation,
  Docker/Compose/CI, provider SDKs, a queue library, secrets, or production
  configuration; T02–T04 own those boundaries.
- Do not choose a mobile state-management package, ORM, Firebase SDK, object
  store, SMS provider, observability supplier, VM supplier, or queue library.
- Do not edit `AGENTS.md`, `harness/`, upstream approved artifacts, state, or
  traceability.

## 5. Files & changes

### Add

- All paths in frontmatter `files.create` — minimal compile/test skeleton,
  Android host, shared package boundaries, generated Dart/TypeScript token
  targets, localization boundary, and root TypeScript configuration.
- Lockfiles are created only after the exact dependency baseline is
  human-approved; any Flutter-generated Android file must stay within the
  listed `apps/mobile/android/` directory.

### Update

- `Makefile` — append stack commands without changing harness commands.
- `.gitignore` — add Flutter/Dart and generated-client/build outputs.
- `README.md` — add a short product-workspace bootstrap section.

### Delete

- None.

> The diff may not exceed this list (lockfiles excepted). QA enforces.

## 6. Database changes

No DB changes.

## 7. API changes

No API changes. API and worker processes may boot locally, but no HTTP route is
introduced until T02.

## 8. Functions

```yaml
functions:
  - signature: "checkToolchain() -> exit code"
    params: {}
    returns: "0 only when local Node, pnpm, Flutter, and Dart match the repository pins"
    purpose: "Make the clean-clone toolchain contract executable"
  - signature: "generateDesignTokens() -> exit code"
    params: {}
    returns: "0 only when approved design JSON generates deterministic Dart and TypeScript targets"
    purpose: "Keep both clients on the design canon without hand-copied values"
  - signature: "Future<void> main()"
    params: {}
    returns: "Future<void> — boots the Flutter shell"
    purpose: "Owner-app composition root with no product feature"
  - signature: "Widget buildGarazoApp()"
    params: {}
    returns: "Widget — localized, token-backed application shell"
    purpose: "Single testable Flutter shell factory"
  - signature: "Promise<void> bootstrapApi()"
    params: {}
    returns: "Promise<void> — starts the NestJS API composition root"
    purpose: "Keep HTTP startup separate from shared modules"
  - signature: "Promise<void> bootstrapWorker()"
    params: {}
    returns: "Promise<void> — starts the NestJS worker composition root"
    purpose: "Prove the worker is separately runnable"
  - signature: "registerModuleBoundary(name: string) -> ModuleBoundary"
    params: { name: "stable owning-module name; not a product state" }
    returns: "ModuleBoundary — immutable public marker"
    purpose: "Give architecture checks a stable public module declaration"
```

Port methods are interfaces only:

```yaml
functions:
  - signature: "DurableJobPort.enqueue(intent: DurableJobIntent) -> Promise<void>"
    params: { intent: "provider-neutral durable work identity and kind" }
    returns: "Promise<void> — resolves only after durable acceptance"
    purpose: "Reserve the accepted queue boundary without selecting a library"
  - signature: "PhoneIdentityPort.verify(assertion: string) -> Promise<PhoneIdentityResult>"
    params: { assertion: "opaque provider assertion supplied at the adapter edge" }
    returns: "Provider-neutral identity result; never workshop authorization"
    purpose: "Prevent Firebase types leaking into domain code"
  - signature: "SmsSenderPort.send(message: SmsMessage) -> Promise<SmsSendResult>"
    params: { message: "provider-neutral message identity and approved content reference" }
    returns: "Normalized result; no credit effect is performed here"
    purpose: "Reserve replaceable SMS adapter boundary"
  - signature: "ObjectStoragePort.put(object: PrivateObject) -> Promise<ObjectReference>"
    params: { object: "private binary stream plus server-resolved ownership context" }
    returns: "Provider-neutral private object reference"
    purpose: "Keep object binaries outside PostgreSQL"
```

The interface types must not invent product payload fields; use opaque
identities and technology-neutral primitives only.

## 9. UI changes

- **Design source:** approved design system and
  `workspace/plan/01-design/tokens.json`; no `SCR-###` is implemented.
- Surface: Flutter owner shell and Next.js admin shell.
- Use generated token values only; no hardcoded brand color or spacing.
- Shell copy exists in both approved locale files and is selected through the
  Flutter localization boundary; it does not become business data.
- Required states: a static non-product “skeleton not configured” message.
- Navigation: none.

## 10. External services & feature flags

- None. No provider SDK or real service connection.
- New-dependency human gate: exact manifest baseline described in §2.

## 11. Challenges / Risks

- A scaffold generator may write paths not listed in §5; generate in a
  temporary location and copy only allowed files.
- Next/Nest/Flutter defaults can introduce conflicting lint/format rules.
- Do not let API and worker import each other's composition roots.
- Required config added here would violate L-process-005; this task should
  require none beyond safe local ports.

## 12. Implementation checklist  (live execution log)

- [ ] tests written FIRST and failing for EARS-E00-1/2
- [ ] exact dependency/version/license set presented and human-approved
- [ ] Node, pnpm, Flutter, and Dart versions pinned
- [ ] Android Flutter host builds from the pinned stable SDK
- [ ] Dart/TypeScript design-token generation is deterministic and drift-free
- [ ] Flutter and Next.js shells compile and consume generated design tokens
- [ ] Flutter shell resolves approved Bangla and English locale keys
- [ ] NestJS API and worker boot as separate entry points
- [ ] server-core public module and provider ports compile without SDK types
- [ ] Makefile preserves every existing harness target
- [ ] lint, format, unit test, and build commands pass for both toolchains

## 13. Test plan

### Automated

- `test_EARS_E00_1_each_entry_point_builds` → Flutter, admin, API, and worker
  compile from pinned toolchains.
- `test_EARS_E00_1_android_owner_shell_builds` → the minimal Android host
  compiles with the pinned Flutter SDK.
- `test_EARS_E00_1_design_token_targets_have_zero_drift` → regeneration from
  the approved token JSON changes neither Dart nor TypeScript output.
- `test_EARS_E00_2_api_worker_have_separate_composition_roots` → import graph
  contains no app-to-app dependency.
- `test_NFR_I18N_01_shell_uses_localization_boundary` → Flutter shell has
  Bangla/English localization plumbing without product copy.
- `test_NFR_A11Y_01_shell_has_named_root` → both shells expose a named,
  focusable root.

### Manual QA

1. Clean clone → approved install command completes with pinned runtimes.
2. Run API and worker separately → both remain alive without feature code.
3. Open Flutter/admin shells → token-backed placeholder appears with no
   product navigation or data.

## 14. Acceptance criteria (EARS)

- EARS-E00-1: WHEN the approved install, lint, test, and build commands run on
  a clean clone with pinned toolchains, the system SHALL build all four
  accepted application entry points.
- EARS-E00-2: WHEN architecture checks inspect imports, the system SHALL find
  separate API/worker roots and zero forbidden app-to-app or provider-SDK
  domain import.

## 15. Self-review (agent fills BEFORE status: review-requested)

- [ ] All checklist items done (with commit hashes)
- [ ] `make test && make lint` pass for affected apps
- [ ] Loading/error/empty states present (N/A — non-product shell)
- [ ] Audit entry on lifecycle writes (N/A — no lifecycle write)
- [ ] No secrets/PII logged
- [ ] Diff confined to §5 list; §4 respected

### Deviations from spec

(none)

### Files touched (actual)

- ...

## 16. Definition of Done

- [ ] All §14 criteria pass via tests named by EARS/trace ID
- [ ] UI fidelity: N/A — no product screen; tokens and accessible shell only
- [ ] Peer-AI review approved by a different model
- [ ] Task-level QA: N/A — no auth/payment/migration/security behavior
- [ ] Squash-merged to epic branch; tracker + metrics stamped
- [ ] Graphiti episode written or “graph not consulted” noted
- [ ] Human verified at E00 checkpoint

## 17. Notes for the implementing agent

- Official version sources checked during planning:
  <https://docs.flutter.dev/install/archive?tab=android>,
  <https://nodejs.org/en/about/previous-releases>,
  <https://docs.nestjs.com/migration-guide>, and
  <https://nextjs.org/docs/app/guides/upgrading>.
- Preserve the repository as a delivery harness plus product workspace; do
  not rewrite its root documentation.

## 18. Handoff

N/A unless blocked or frozen.

## Open Questions

- None. The dependency approval is an explicit human gate with a fully
  specified baseline, not an unresolved architectural choice.

## Feedback log

- (human feedback on this deliverable lands here)

## Run log

- (key evidence, decisions, test results, and session refs)
