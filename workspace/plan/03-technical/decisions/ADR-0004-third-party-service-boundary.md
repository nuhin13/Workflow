# ADR-0004 — Third-party service boundary

- status: accepted
- date: 2026-07-29 | proposed_by: architect | decided_by: project owner on 2026-07-30
- traces_to: [FR-ACCESS-03, FR-REMINDER-02–FR-REMINDER-05,
  FR-PLAN-09–FR-PLAN-12, FR-SHARE-01–FR-SHARE-02, FR-ONLINE-03,
  FR-TIREBOOK-01–FR-TIREBOOK-03, FC-012, FC-015, FC-020]

## Context

Garazo crosses phone identity, SMS, private object storage, Android sharing,
and future TireBook boundaries. A successful SMS consumes one credit exactly
once, external failures must not corrupt core state, and TireBook must remain
optional. Expected M+12 messaging volume is only 5,600 sends/month
(`FC-012`, `FC-020`); reliability and replaceability matter more than
throughput.

Relevant official references checked 2026-07-29:
[Firebase phone authentication](https://firebase.google.com/docs/auth/android/phone-auth),
[Auth0 SMS passwordless](https://auth0.com/docs/authenticate/passwordless/authentication-methods/sms-otp),
and [Cloud Tasks retry controls](https://cloud.google.com/tasks/docs/configure-retry-task).

## Options considered

1. **Provider ports/adapters in the owning modules with durable intent and
   normalized result records** — pros: provider failure is testable, domain
   state is provider-neutral, replacement is localized; cons: more interfaces,
   fixtures, and mapping code; exit cost: low to medium.
2. **Direct SDK calls inside application use cases** — pros: smallest happy
   path and fastest prototype; cons: SDK types/failures spread into domain
   logic, retries scatter, and replacement becomes a rewrite; exit cost: high.
3. **Separate integration service from day one** — pros: deployment/failure
   isolation and centralized supplier behavior; cons: distributed state,
   another deployment, contract versioning, and operations with no
   `FC-012` capacity need; exit cost: medium to high.

Supplier charges remain governed by `FC-015` and the infrastructure envelope
by `FC-016`; this ADR contains no quote.

## Comparison matrix

| Criterion (weight) | Ports/adapters | Direct SDK | Integration service |
|---|---:|---:|---:|
| Transactional reliability (25) | 5 (125) | 2 (50) | 3 (75) |
| Provider replaceability (20) | 5 (100) | 1 (20) | 4 (80) |
| Testability (20) | 5 (100) | 2 (40) | 4 (80) |
| Operational simplicity (15) | 4 (60) | 5 (75) | 2 (30) |
| Initial speed (10) | 3 (30) | 5 (50) | 2 (20) |
| Exit cost (10) | 4 (40) | 1 (10) | 3 (30) |
| **Weighted total / 500** | **455** | **245** | **315** |

## Agent recommendation (advisory — NOT the decision)

Recommend Option 1. Keep provider ports in the domain-owning module, store
consequential intent/results durably, and make adapters replaceable. This adds
real code up front but directly protects credits, reminders, standalone
operation, and future consented integration. Final call is yours.

## Decision

Option 1 — Provider ports/adapters in the owning modules with durable intent
and normalized result records.

Confirmed by the project owner on 2026-07-30.

## Consequences

- Each external capability has a provider-neutral port owned by its Garazo
  domain module and one or more replaceable adapters.
- Firebase identity, business SMS, private object storage, Android sharing,
  and future TireBook provider types and payloads must not leak into domain
  records or API contracts.
- Consequential external work is represented by a durable intent before
  execution. Attempts and results are normalized and retained where required
  for retry, audit, credit, and support evidence.
- Provider callbacks and failures are treated as untrusted input, mapped to
  stable domain outcomes, and processed idempotently.
- Credentials and provider configuration stay outside domain code and follow
  the later approved secrets and production-configuration contracts.
- Direct SDK calls inside application use cases and a separate integration
  service are rejected for the initial architecture.
- Replacing a provider should require a new adapter and compatibility tests,
  not changes to billing, reminders, identity mapping, or workshop records.
- Vendors, credentials, payload fields, retention, SDK dependencies, and
  provider contracts remain separate later decisions or human-approved tasks.
