# ADR-0001 — Application stack

- status: accepted
- date: 2026-07-29 | proposed_by: architect | decided_by: project owner on 2026-07-30
- traces_to: [FR-ACCESS-01, FR-JOB-01, FR-OFFLINE-01, NFR-PERF-01,
  NFR-I18N-01, NFR-A11Y-01, SCR-001–SCR-014, FC-008, FC-011, FC-020]

## Context

Garazo needs a custom Android-first owner app, a separate responsive admin
surface, a transactional API, Bangla/English content, camera/media/share
integration, and a later approved offline path. The expected M+12 envelope is
30 peak concurrent users and 45 requests/second, so raw runtime throughput
does not distinguish the stacks (`FC-008`, `FC-011`, `FC-020`). The choice is
mainly mobile fidelity, buildability, and long-term toolchain cost.

Official references checked 2026-07-29:
[Flutter architecture](https://docs.flutter.dev/app-architecture/guide),
[Expo new architecture](https://docs.expo.dev/guides/new-architecture/),
[Android architecture](https://developer.android.com/topic/architecture),
[NestJS](https://docs.nestjs.com/).

## Options considered

1. **Flutter/Dart owner app + Next.js admin + NestJS/TypeScript API** —
   pros: strong custom UI, cross-platform option, conventional layered mobile
   architecture, BRD already names Flutter as an input; cons: permanent
   Dart/TypeScript split and little UI reuse with admin; exit cost: high after
   mobile features/local persistence land.
2. **Expo/React Native owner app + Next.js admin + NestJS/TypeScript API** —
   pros: one main language, maximum model/validation/tooling reuse, rapid web
   and mobile iteration; cons: native-module compatibility and upgrade work,
   dependency quality must be checked for every camera/share/offline package;
   exit cost: high.
3. **Kotlin/Jetpack Compose owner app + Next.js admin + Spring Boot/Kotlin
   API** — pros: direct Android platform access and first-party Android
   architecture; cons: Android-only owner client, separate web toolchain, and
   highest initial surface; exit cost: very high if cross-platform becomes
   necessary.

Build-cost ranks are relative only. All three can fit `FC-020`; hosting quotes
must later be checked against `FC-016`.

## Comparison matrix

Score: 1 weak to 5 strong; weighted points in parentheses.

| Criterion (weight) | Flutter + TS | Expo + TS | Kotlin + Spring |
|---|---:|---:|---:|
| Mobile UX and offline path (25) | 5 (125) | 4 (100) | 5 (125) |
| Backend/domain fit (20) | 4 (80) | 4 (80) | 5 (100) |
| Team/agent buildability (20) | 4 (80) | 5 (100) | 3 (60) |
| Admin reuse (10) | 3 (30) | 5 (50) | 2 (20) |
| Operational simplicity (10) | 4 (40) | 4 (40) | 3 (30) |
| Ecosystem and test tooling (10) | 5 (50) | 3 (30) | 5 (50) |
| Exit cost (5) | 3 (15) | 3 (15) | 2 (10) |
| **Weighted total / 500** | **420** | **415** | **395** |

## Agent recommendation (advisory — NOT the decision)

Recommend Option 1. It best matches the locked custom mobile design and keeps
future platform reach without imposing a native-only path. Its real cost is
the Dart/TypeScript split; choose Option 2 instead if the human prioritizes
one-language delivery over Flutter fidelity. Final call is yours.

## Decision

Option 1 — Flutter/Dart owner app, Next.js admin, and NestJS/TypeScript API
and worker.

Confirmed by the project owner on 2026-07-30.

## Consequences

- The Android-first owner application uses Flutter and Dart. Mobile
  architecture, state management, and local-persistence libraries remain
  implementation choices to be specified in approved tasks.
- The separate admin surface uses Next.js and TypeScript.
- The modular API and separately runnable worker use NestJS and TypeScript
  over the shared domain-module boundaries accepted in ADR-0002.
- Mobile and server/admin have separate language toolchains. CI, formatting,
  static analysis, testing, and dependency policy must cover both Dart and
  TypeScript.
- The cross-client reuse boundary is the versioned API contract and generated
  clients, not shared mobile/admin UI code.
- Camera, media, sharing, notifications, and future offline support must be
  wrapped behind app-owned interfaces so plugin choices do not leak through
  the domain.
- Exact framework versions, repository package layout, datastore, API style,
  authentication provider, queue, and hosting remain subject to later
  decisions or approved task contracts.
