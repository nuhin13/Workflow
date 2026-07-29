# ADR-0008 — API style

- status: proposed
- date: 2026-07-29 | proposed_by: architect | decided_by: ⏳ human pending
- traces_to: [FR-ACCESS-05, FR-ONLINE-01–FR-ONLINE-03, FR-ADMIN-01–FR-ADMIN-08,
  FR-TIREBOOK-01–FR-TIREBOOK-03, NFR-SEC-01, NFR-REL-01, FC-011]

## Context

The owner app and admin portal need a stable, testable contract across
potentially different languages. Future TireBook exchange is explicitly
versioned, consented, and optional. Expected M+12 request load is 45
requests/second (`FC-011`), so API clarity, authorization, and compatibility
matter more than transport efficiency.

Official references checked 2026-07-29:
[OpenAPI Specification](https://spec.openapis.org/oas/latest.html),
[GraphQL specification](https://spec.graphql.org/),
and [gRPC overview](https://grpc.io/docs/what-is-grpc/).

## Options considered

1. **Versioned REST/JSON described by OpenAPI** — pros: language-neutral
   mobile/admin clients, broad HTTP tooling, generated clients, straightforward
   future external contracts; cons: endpoint/representation discipline and
   compatibility checks are required; exit cost: medium.
2. **GraphQL schema and operations** — pros: strong schema and client-selected
   fields, useful for admin read composition; cons: field-level authorization,
   query-cost controls, caching, and resolver behavior add complexity; exit
   cost: high.
3. **gRPC/Protocol Buffers** — pros: generated language-neutral types, compact
   transport, streaming; cons: browser/mobile gateway and manual debugging
   overhead with no `FC-011` performance need; exit cost: high.

Run cost is not meaningfully distinguished at `FC-011`; implementation and
contract risk dominate.

## Comparison matrix

| Criterion (weight) | REST/OpenAPI | GraphQL | gRPC |
|---|---:|---:|---:|
| Interoperability (25) | 5 (125) | 4 (100) | 5 (125) |
| Mobile/admin fit (20) | 5 (100) | 5 (100) | 3 (60) |
| Future external API fit (15) | 5 (75) | 3 (45) | 4 (60) |
| Contract testability (15) | 5 (75) | 4 (60) | 4 (60) |
| Authorization clarity (10) | 4 (40) | 3 (30) | 4 (40) |
| Operational simplicity (10) | 5 (50) | 3 (30) | 3 (30) |
| Exit cost (5) | 4 (20) | 2 (10) | 2 (10) |
| **Weighted total / 500** | **485** | **375** | **385** |

## Agent recommendation (advisory — NOT the decision)

Recommend Option 1 with one versioned OpenAPI source, generated client types,
stable domain error codes, explicit idempotency metadata for consequential
writes, and compatibility tests. Future TireBook gets a separately approved
contract rather than access to internal endpoints. Final call is yours.

## Decision

⏳ AWAITING HUMAN

## Consequences

N/A — pending human choice. Routes, request/response fields, pagination,
versioning details, idempotency header/name, error schema, and external API
fields remain unapproved task-level contracts.

