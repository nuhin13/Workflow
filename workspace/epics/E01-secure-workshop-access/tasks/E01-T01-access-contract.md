---
id: E01-T01
epic: E01
type: feature
title: Define the secure-access API contract and regenerate clients
layer: cross-cutting
size: M
status: todo
owner_agent: developer-backend
preferred_agent: any
tier: deep
token_estimate: { tier: M, range: "60k-120k" }
priority: { moscow: must, p: P1 }
depends_on: []
blocks: [E01-T02, E01-T03, E01-T04, E01-T05, E01-T06]
traces_to:
  [
    FR-ACCESS-01,
    FR-ACCESS-02,
    FR-ACCESS-03,
    FR-ACCESS-04,
    FR-ACCESS-05,
    FR-ACCESS-06,
    FR-ACCESS-07,
    FR-ACCESS-11,
    FR-ACCESS-12,
    FR-ACCESS-13,
    FR-ACCESS-14,
    NFR-SEC-01,
    NFR-SEC-02,
    ADR-0004,
    ADR-0007,
    ADR-0008,
  ]
external_services: []
files:
  create:
    - packages/server-core/src/access/session-token.ts
    - packages/server-core/src/access/access-errors.ts
    - tests/contract/access-contract.spec.ts
    - tests/architecture/access-boundaries.spec.ts
  update:
    - contracts/openapi/garazo.v1.yaml
    - packages/api-client-typescript/src/generated/
    - apps/mobile/lib/core/api/generated/
    - packages/server-core/src/index.ts
    - packages/server-core/src/access/access-context.ts
feature_flags: []
ui_reference: "N/A — contract only; SCR-001/002/011 are implemented by T06–T09"
started_at:
completed_at:
executed_by:
reviewed_at:
reviewed_by:
review_outcome:
---

# E01-T01 · Define the secure-access API contract and regenerate clients

## 1. Feature goal

Extend the canonical OpenAPI contract with every access route E01 needs, so
the four backend tasks and four frontend tasks can be built in parallel against
one agreed wire format that neither side may change unilaterally.

## 2. Business logic

This task writes **no behaviour**. It writes the contract that makes behaviour
buildable in parallel, and the shared types that make the authorization rules
expressible.

Two rules from ADR-0007 shape every schema here:

1. **Firebase proves phone possession. It does not authorize anything.** The
   assertion is exchanged for a Garazo session; the assertion itself never
   appears in any other request, and no response echoes it.
2. **The owner-money grant is separate from the session.** Being signed in must
   not be expressible as "may see money". They are different tokens with
   different lifetimes, because Garazo runs on a shared workshop phone where a
   mechanic may hold the device while the owner is away (BRD Law 2, Q-004).

The contract must also make `NFR-SEC-01` structurally true: **no request may
carry a workshop identifier that selects which workshop is acted upon.** Scope
is resolved server-side from the session. A `workshopId` in a request body is
the single most likely way tenant isolation gets broken, so the contract simply
does not have one.

Q-005's answer is fixed and must be encoded exactly, not re-derived: five
invalid entries per failure cycle; cooldowns of 60, then 120, then 240 seconds
capped; registered-phone OTP recovery; successful PIN or recovery resets
escalation.

## 3. What this task DOES

- Add the ten access routes to `contracts/openapi/garazo.v1.yaml` with complete
  request/response schemas, status codes, and error codes.
- Add access error codes to the existing single error envelope — no second
  error shape.
- Regenerate both clients from the contract and commit them with zero drift.
- Add opaque session/grant token types and the access error vocabulary to
  `@garazo/server-core`.
- Add contract tests that fail if a schema leaks a secret, accepts a
  client-supplied workshop id, or lets an error distinguish account states.
- Add architecture tests that fail if a Firebase type reaches domain code or a
  route accepts tenant selection from the client.

## 4. What this task does NOT do (scope fence)

- Do not implement any route. Every path added here returns nothing until
  T03–T05 bind handlers; the contract is the deliverable.
- Do not create a table, migration, or repository. T02 owns the schema.
- Do not add a Firebase SDK, an OTP provider, a crypto library, a JWT library,
  or any dependency. Token *shape* is contract; token *minting* is T03.
- Do not implement SCR-001, SCR-002 or SCR-011. T06–T09 own the UI.
- Do not modify any E00 route, the error envelope's shape, or the correlation
  id contract.
- Do not hand-edit a generated client. A mismatch means the contract is wrong.
- Do not add a `workshopId` request parameter anywhere, for any reason.
- Do not implement admin authorization (E05) or offline sync (E06).

## 5. Files & changes

### Add

- `packages/server-core/src/access/session-token.ts` — opaque
  `SessionToken` / `OwnerGrantToken` types and their lifetimes.
- `packages/server-core/src/access/access-errors.ts` — the access error code
  vocabulary, shared by API and tests.
- `tests/contract/access-contract.spec.ts` — contract-shape assertions.
- `tests/architecture/access-boundaries.spec.ts` — tenant and provider rules.

### Update

- `contracts/openapi/garazo.v1.yaml` — the ten routes and their schemas.
- Both generated client trees — regenerated, never hand-edited.
- `packages/server-core/src/index.ts` — export the new access types.
- `packages/server-core/src/access/access-context.ts` — extend
  `AuthenticatedActor` and `WorkshopScope` only as the contract requires.

### Delete

- None.

> The diff may not exceed this list. QA enforces.

## 6. Database changes

None. T02 owns the access schema.

## 7. API changes

All routes are `/api/v1`, camelCase JSON, and use E00's single error envelope.
Every response carries `X-Correlation-Id`. No list endpoint exists, so
pagination is N/A throughout.

### Session lifecycle

| Method | Path | Auth | Request | Response | Status |
|---|---|---|---|---|---|
| POST | `/api/v1/access/sessions` | none | `{identityAssertion: string}` | `{session: SessionEnvelope, workshop: WorkshopSummary \| null}` | 200 |
| POST | `/api/v1/access/sessions` | none | invalid/expired assertion | `AUTH.INVALID_CREDENTIALS` | 401 |
| GET | `/api/v1/access/session` | session | none | `{session: SessionEnvelope, workshop: WorkshopSummary \| null}` | 200 |
| GET | `/api/v1/access/session` | none/expired | none | `AUTH.SESSION_INVALID` | 401 |
| DELETE | `/api/v1/access/session` | session | none | empty | 204 |

`workshop` is `null` when the account has completed no setup. That is how the
client knows to show SCR-001 setup rather than SCR-002 — it is **not** an error
state and must not be signalled by a 404.

### Workshop scope and setup

| Method | Path | Auth | Request | Response | Status |
|---|---|---|---|---|---|
| GET | `/api/v1/workshops/current` | session | none | `WorkshopSummary` | 200 |
| GET | `/api/v1/workshops/current` | session, no setup | none | `WORKSHOP.NOT_SET_UP` | 409 |
| PUT | `/api/v1/workshops/current/setup` | session | `{name: string, vehicleTypes: string[]}` | `WorkshopSummary` | 200 |
| PUT | `/api/v1/workshops/current/setup` | session, already set up | same | `WORKSHOP.ALREADY_SET_UP` | 409 |
| PATCH | `/api/v1/access/preferences/locale` | session | `{locale: "bn" \| "en"}` | `{locale: "bn" \| "en"}` | 200 |

**There is no `workshopId` parameter on any of these.** `current` means "the
workshop this session is authorized for", resolved server-side. A client cannot
name a workshop, so it cannot name someone else's.

### Owner-PIN grant

| Method | Path | Auth | Request | Response | Status |
|---|---|---|---|---|---|
| PUT | `/api/v1/access/owner-pin` | session | `{pin: string, recoveryAssertion?: string}` | 204 empty | 204 |
| POST | `/api/v1/access/owner-pin/verifications` | session | `{pin: string}` | `{grant: GrantEnvelope}` | 200 |
| POST | `/api/v1/access/owner-pin/verifications` | session | wrong pin | `AUTH.PIN_INVALID` + `{remainingAttempts}` | 401 |
| POST | `/api/v1/access/owner-pin/verifications` | session, cooling down | any | `AUTH.PIN_COOLDOWN` + `{retryAfterSeconds}` | 429 |
| DELETE | `/api/v1/access/owner-pin/grant` | session | none | empty | 204 |
| POST | `/api/v1/access/owner-pin/recoveries` | session | `{recoveryAssertion: string, newPin: string}` | 204 empty | 204 |
| POST | `/api/v1/access/owner-pin/recoveries` | session | invalid/expired assertion | `AUTH.RECOVERY_INVALID` | 401 |

### Schemas

```yaml
SessionEnvelope:
  required: [token, expiresAt]
  properties:
    token:      { type: string, minLength: 32, maxLength: 512 }
    expiresAt:  { type: string, format: date-time }
  additionalProperties: false

GrantEnvelope:
  required: [token, expiresAt]
  properties:
    token:      { type: string, minLength: 32, maxLength: 512 }
    expiresAt:  { type: string, format: date-time }
  additionalProperties: false

WorkshopSummary:
  required: [workshopId, name, vehicleTypes, locale, regionProfile]
  properties:
    workshopId:    { type: string }        # opaque; identifies, never authorizes
    name:          { type: string, maxLength: 120 }
    vehicleTypes:  { type: array, items: { type: string } }
    locale:        { type: string, enum: [bn, en] }
    regionProfile: { type: string, enum: [BD] }
  additionalProperties: false
```

`SessionEnvelope` and `GrantEnvelope` are **structurally identical on purpose**
but are separate schemas, so a generated client cannot pass one where the other
is required.

### Validation

- `identityAssertion` / `recoveryAssertion`: 1–4096 printable characters,
  opaque to Garazo. Never logged, never echoed, never stored raw.
- `pin` / `newPin`: exactly 4–6 digits. The contract states the shape; T05
  owns strength rules and hashing.
- `name`: 1–120 characters after trimming; must not be only whitespace.
- `vehicleTypes`: 1–12 entries from the approved enumeration; duplicates
  rejected.
- `locale`: exactly `bn` or `en`.
- Unknown properties are rejected on every request body (`additionalProperties:
  false`), consistent with E00.

### Error codes — added to the existing `ErrorCode` enum

| Code | Status | Meaning |
|---|---|---|
| `AUTH.INVALID_CREDENTIALS` | 401 | Identity exchange failed. **One code for every pre-session failure.** |
| `AUTH.SESSION_INVALID` | 401 | Missing, expired, or revoked session |
| `AUTH.PIN_INVALID` | 401 | Wrong PIN, cooldown not yet reached |
| `AUTH.PIN_COOLDOWN` | 429 | Cooldown active |
| `AUTH.PIN_NOT_SET` | 409 | No PIN established yet |
| `AUTH.RECOVERY_INVALID` | 401 | Recovery assertion invalid or expired |
| `AUTH.GRANT_REQUIRED` | 403 | Protected resource without a valid owner grant |
| `WORKSHOP.NOT_SET_UP` | 409 | Session has no workshop yet |
| `WORKSHOP.ALREADY_SET_UP` | 409 | Setup already completed |

Add `x-enum-varnames` for each, as E00 does — dotted values generate unusable
identifiers otherwise.

**`AUTH.INVALID_CREDENTIALS` is deliberately undifferentiated.** Unknown number,
known number with a bad code, and expired assertion must be indistinguishable in
code, message key, field errors, and status. Distinguishing them turns the login
endpoint into a phone-number oracle — an attacker learns which numbers are
registered Garazo workshops. Response timing should also not obviously differ;
T03 owns that.

`remainingAttempts` and `retryAfterSeconds` ARE disclosed, because the user
genuinely needs them and they reveal nothing about anyone else's account.

### Idempotency

- `PUT /workshops/current/setup` and `PUT /access/owner-pin` are idempotent by
  method.
- `POST /access/sessions` rotates: each call issues a new session and the
  previous one becomes invalid. Not idempotent, and the contract says so.
- `POST .../verifications` is not idempotent — it consumes a failure attempt.

## 8. Functions

```yaml
functions:
  - signature: "SessionToken (opaque type)"
    params: {}
    returns: "branded string; never parsed by application code"
    purpose: "Stop a session token being passed where a grant token is required"
  - signature: "OwnerGrantToken (opaque type)"
    params: {}
    returns: "branded string, structurally distinct from SessionToken"
    purpose: "Make 'signed in' and 'may see money' unequal at the type level"
  - signature: "AccessErrorCode (union)"
    params: {}
    returns: "the access error vocabulary shared by API and tests"
    purpose: "One definition, so contract and implementation cannot drift"
  - signature: "isPreSessionFailure(code: AccessErrorCode) -> boolean"
    params: { code: "any access error code" }
    returns: "true only for codes that must stay undifferentiated"
    purpose: "Let a test prove no pre-session path discloses account existence"
```

## 9. UI changes

None. The contract defines what T06–T09 consume.

## 10. External services & feature flags

- No provider is contacted. `identityAssertion` is opaque to this task.
- No feature flag is introduced.
- **No new dependency.** If token minting appears to need a library, that is a
  T03 decision behind its own dependency gate.

## 11. Challenges / Risks

- **A `workshopId` request field will feel convenient.** It is the exact shape
  that breaks tenant isolation. An architecture test rejects it.
- **Differentiated auth errors will feel more helpful.** They turn login into a
  phone-number oracle. `L-auth-003`.
- **Session and grant tokens are structurally identical.** Without separate
  schemas and branded types, a generated client will happily send one for the
  other and the mistake will only show up as a privacy bug.
- The generated Dart enum for dotted codes is unusable without
  `x-enum-varnames`; E00 hit this already.
- `workshop: null` is a legitimate state, not an error. Modelling it as a 404
  would make "new user" and "broken session" indistinguishable to the client.

## 12. Implementation checklist  (live execution log)

- [ ] tests written FIRST and failing for EARS-E01-1/2 and NFR-SEC-01
- [ ] ten routes added with complete schemas and status codes
- [ ] `additionalProperties: false` on every request body
- [ ] access error codes added to the ONE envelope with `x-enum-varnames`
- [ ] no route anywhere accepts a client-supplied workshop identifier
- [ ] `SessionToken` and `OwnerGrantToken` are separate, non-substitutable types
- [ ] pre-session failures collapse to one indistinguishable code
- [ ] both clients regenerate with zero drift; neither hand-edited
- [ ] `make contract` and `make verify` pass

## 13. Test plan

### Automated

- `test_EARS_E01_1_pre_session_failures_are_indistinguishable` → every
  pre-session failure yields identical code, messageKey, fieldErrors and status.
- `test_NFR_SEC_01_no_route_accepts_a_client_supplied_workshop_id` → scans every
  path, parameter and request schema in the contract for a workshop identifier.
- `test_ADR_0007_session_and_grant_tokens_are_not_substitutable` → the generated
  clients expose distinct types; a type-level test fails if one is assignable to
  the other.
- `test_ADR_0007_no_firebase_type_reaches_domain_code` → extends E00's provider
  check to the new access files.
- `test_ADR_0008_access_contract_generates_both_clients_with_zero_drift` →
  regeneration is byte-identical.
- `test_NFR_SEC_02_no_schema_exposes_a_secret_or_money_value` → no response
  schema contains an assertion, PIN, digest, or any money field.
- `test_EARS_E01_1_error_codes_are_complete_and_named` → every code in the table
  exists in the enum with a readable generated identifier.

### Manual QA

1. Regenerate clients twice → second run changes zero files.
2. Read the contract as a client author: is `workshop: null` obviously "not set
   up yet" rather than an error?
3. Attempt to express "act on workshop X" using only the contract. It must be
   impossible.

## 14. Acceptance criteria (EARS)

- **EARS-E01-T01-1** — WHEN the access contract is generated, the system SHALL
  produce compiling Dart and TypeScript clients with zero drift on a second run.
- **EARS-E01-T01-2** — WHERE any request schema is defined, the contract SHALL
  contain no property by which a client selects the workshop acted upon.
- **EARS-E01-T01-3** — WHEN any pre-session identity exchange fails, the
  contract SHALL define exactly one indistinguishable failure response.
- **EARS-E01-T01-4** — WHERE a session token and an owner-money grant token are
  both defined, the contract SHALL define them as separate types that cannot be
  substituted for one another.

## 15. Self-review (agent fills BEFORE status: review-requested)

- [ ] All checklist items done (with commit hashes)
- [ ] `make verify` passes
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
- [ ] **Task-level QA APPROVE — REQUIRED.** This defines the authorization
      contract every later epic consumes
- [ ] Squash-merged to epic branch; tracker + metrics stamped
- [ ] Graphiti episode written or "graph not consulted" noted
- [ ] Human verified at E01 checkpoint

## 17. Notes for the implementing agent

- The contract is the parallelism. T02–T05 and T06–T09 run against it
  simultaneously, so a change here after they start invalidates work on both
  sides. Get it right before merging.
- Read `packages/server-core/src/access/*` from E00 first. The four access
  types already exist; extend them, do not duplicate them.
- `contracts/openapi/garazo.v1.yaml` already carries the E00 system routes and
  the error envelope. Add to it; do not restructure it.
- OpenAPI: <https://spec.openapis.org/oas/latest.html>.

## 18. Handoff

At `review-requested`, hand to a different-model peer with `make contract`
output, then to task-level QA. Both are required before T02–T09 begin, because
every one of them consumes this contract.

## Open Questions

- None. Q-005 fixes the PIN behaviour; ADR-0007 fixes the identity boundary.
  Token format and lifetime values are T03 implementation choices within this
  contract.

## Feedback log

- (human feedback on this deliverable lands here)

## Run log

- (contract version, generator output, drift check, and session refs)
