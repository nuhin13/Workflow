---
id: E01-T03
epic: E01
type: feature
title: Implement phone identity and application sessions
layer: backend
size: M
status: todo
owner_agent: developer-backend
preferred_agent: any
tier: deep
token_estimate: { tier: M, range: "70k-140k" }
priority: { moscow: must, p: P1 }
depends_on: [E01-T02]
blocks: [E01-T04, E01-T05]
traces_to: [FR-ACCESS-03, FR-ACCESS-04, FR-ACCESS-05, NFR-SEC-01, ADR-0004, ADR-0007]
external_services: [firebase-phone-identity]
files:
  create:
    - packages/server-core/src/access/verify-identity.use-case.ts
    - packages/server-core/src/access/session.service.ts
    - packages/server-core/src/access/token-digest.ts
    - packages/server-core/src/access/fake-phone-identity.adapter.ts
    - packages/server-core/src/access/firebase-phone-identity.adapter.ts
    - packages/server-core/src/access/verify-identity.use-case.spec.ts
    - packages/server-core/src/access/session.service.spec.ts
    - packages/server-core/src/access/token-digest.spec.ts
    - apps/api/src/access/access.controller.ts
    - apps/api/src/access/access.module.ts
    - apps/api/src/access/session.guard.ts
    - tests/integration/access-session.spec.ts
  update:
    - apps/api/src/app.module.ts
    - packages/server-core/src/index.ts
    - .env.example
    - docs/operations/configuration.md
feature_flags: []
ui_reference: "N/A — backend only"
started_at:
completed_at:
executed_by:
reviewed_at:
reviewed_by:
review_outcome:
---

# E01-T03 · Implement phone identity and application sessions

## 1. Feature goal

Exchange a verified phone assertion for a Garazo-owned application session, and
resolve every subsequent request's authority from that session alone.

## 2. Business logic

ADR-0007's central rule: **Firebase proves the user holds a phone. It grants
nothing.** Garazo decides what that phone may do. Those are separate steps and
must stay separate in the code, because the day the Bangladesh pilot fails and
Firebase is replaced, only one adapter should change.

The session is the only source of authority. Once issued, no request needs to
say who it is or which workshop it wants — and crucially, no request *can*.

`FR-ACCESS-04` requires that failed authentication show no workshop record.
That means more than "return 401": it means the failure path must not reveal
whether the number is registered at all. A distinguishable failure turns login
into a phone-number oracle that tells an attacker which numbers are Garazo
workshops.

No real Firebase credential exists in this environment. The port takes a fake
adapter locally and in tests; the real adapter is written behind the same port
and exercised only where credentials exist.

## 3. What this task DOES

- Implement `PhoneIdentityPort` twice: a deterministic fake for local and test
  runs, and the real Firebase adapter behind the identical interface.
- Implement identity exchange: verify assertion → find or create account →
  issue a rotated session.
- Implement session issue, restore, rotate and revoke, storing only digests.
- Implement the session guard that resolves `RequestContext` authority.
- Bind the three session routes from T01's contract.

## 4. What this task does NOT do (scope fence)

- Do not implement workshop setup (T04) or owner-PIN behaviour (T05).
- Do not change the contract. A mismatch returns to T01.
- Do not create a Firebase project, obtain a credential, or make a real
  provider call in any test.
- Do not add a JWT library, a session framework, or an auth framework. Node's
  built-in crypto covers what is needed; anything more is a dependency gate.
- Do not log an assertion, a token, a phone number, or a digest.
- Do not implement rate limiting on the login endpoint — declare it as a known
  gap for the epic's integration task rather than half-building it here.
- Do not let any Firebase type appear outside the Firebase adapter file.

## 5. Files & changes

### Add

- `verify-identity.use-case.ts` — the exchange, provider-agnostic.
- `session.service.ts` — issue, restore, rotate, revoke.
- `token-digest.ts` — one-way digest and constant-time comparison.
- `fake-phone-identity.adapter.ts` — deterministic local/test adapter.
- `firebase-phone-identity.adapter.ts` — the real one; the **only** file
  permitted to know Firebase exists.
- Three co-located spec files.
- `apps/api/src/access/{access.controller,access.module,session.guard}.ts`.
- `tests/integration/access-session.spec.ts`.

### Update

- `apps/api/src/app.module.ts` — register the access module and bind the
  identity port to the configured adapter.
- `packages/server-core/src/index.ts` — export the use case and service.
- `.env.example` and `docs/operations/configuration.md` — the identity
  adapter selector and session lifetime keys.

### Delete

- None.

> The diff may not exceed this list. QA enforces.

## 6. Database changes

None. T02's schema is used as-is. Sessions are written through T02's repository.

## 7. API changes

No contract change. Implements T01's `POST /access/sessions`,
`GET /access/session`, `DELETE /access/session` exactly.

Behaviour the contract implies and this task must honour:

- Session tokens are opaque, ≥256 bits of entropy, and stored only as digests.
- Issuing a session **rotates**: any previous session for that account is
  revoked. A stolen token stops working the moment the real owner signs in.
- `GET /access/session` returns `workshop: null` when setup is incomplete —
  a legitimate state, not an error.
- `DELETE` revokes; T02's cascade removes any owner-money grant with it.

## 8. Functions

```yaml
functions:
  - signature: "VerifyIdentityUseCase.execute(assertion: string) -> Promise<SessionIssued>"
    params: { assertion: "opaque provider assertion; never logged or stored" }
    returns: "issued session plus resolved workshop context, or a generic failure"
    purpose: "The one place identity becomes authority"
  - signature: "SessionService.issue(accountId: OpaqueId) -> Promise<SessionEnvelope>"
    params: { accountId: "server-resolved account" }
    returns: "opaque token and expiry; only the digest is persisted"
    purpose: "Mint a session and rotate away the previous one"
  - signature: "SessionService.restore(token: string) -> Promise<RequestContext>"
    params: { token: "presented bearer token" }
    returns: "authority resolved from storage, or anonymous"
    purpose: "Resolve authority from the session, never from request input"
  - signature: "SessionService.revoke(token: string) -> Promise<void>"
    params: { token: "presented bearer token" }
    returns: "void; idempotent"
    purpose: "Sign out, cascading to any owner-money grant"
  - signature: "digestToken(token: string) -> string"
    params: { token: "raw secret" }
    returns: "one-way digest suitable for storage and lookup"
    purpose: "Make a database dump useless for impersonation"
  - signature: "timingSafeEquals(a: string, b: string) -> boolean"
    params: { a: "candidate", b: "expected" }
    returns: "equality without leaking position through timing"
    purpose: "Stop a byte-by-byte comparison becoming a side channel"
  - signature: "FakePhoneIdentityAdapter.verify(assertion: string) -> Promise<PhoneIdentityResult>"
    params: { assertion: "test assertion of the documented shape" }
    returns: "deterministic verified phone, or a failure"
    purpose: "Let the whole epic be built and tested with no provider account"
```

## 9. UI changes

None.

## 10. External services & feature flags

- **Firebase Authentication** — real adapter written, never invoked in tests.
  ADR-0007 accepted it *conditionally* on a Bangladesh delivery, privacy,
  abuse and cost pilot. That pilot is a production gate and is **not** part of
  this task.
- Adapter selection is configuration: `IDENTITY_ADAPTER=fake|firebase`,
  defaulting to `fake`. Production must fail closed if `firebase` is selected
  without credentials — a silent fallback to the fake adapter in production
  would accept **any** assertion.
- No feature flag.

## 11. Challenges / Risks

- **A fake adapter reachable in production is a total authentication bypass.**
  It accepts assertions by construction. Configuration must refuse
  `IDENTITY_ADAPTER=fake` when `APP_ENV=production`, and a test must prove it.
- **Differentiated login failures leak account existence.** Unknown number, bad
  code and expired assertion must be identical in code, body and status —
  and close enough in timing not to be trivially distinguishable.
- Digest lookup with a non-constant-time comparison is a side channel.
- Session rotation must be atomic with issuance, or a crash between the two
  leaves either two live sessions or none.
- `restore()` runs on every request; an unindexed digest lookup becomes the
  slowest thing in the product.
- Firebase types must not escape their adapter, or replacing the provider stops
  being a one-file change and ADR-0004 is decorative.

## 12. Implementation checklist  (live execution log)

- [ ] tests written FIRST and failing for EARS-E01-1/2/3 and FR-ACCESS-03/04
- [ ] fake adapter is deterministic and documented
- [ ] production refuses the fake adapter and fails closed
- [ ] real Firebase adapter compiles and imports no Firebase type elsewhere
- [ ] session tokens ≥256 bits, stored only as digests
- [ ] issuing rotates and revokes the previous session atomically
- [ ] every pre-session failure is indistinguishable
- [ ] comparisons are constant-time
- [ ] no assertion, token, phone number or digest is logged
- [ ] revoking a session leaves no usable owner-money grant

## 13. Test plan

### Automated

- `test_FR_ACCESS_03_valid_assertion_creates_an_authenticated_session`
- `test_FR_ACCESS_04_failed_authentication_returns_no_workshop_record` → the
  failure body contains no workshop, account or phone information.
- `test_EARS_E01_1_all_pre_session_failures_are_indistinguishable` → unknown
  number, bad assertion and expired assertion produce byte-identical bodies
  and the same status.
- `test_EARS_E01_2_firebase_identity_is_never_workshop_authorization` → a
  verified assertion for an account with no membership yields a session whose
  workshop scope is `none`.
- `test_EARS_E01_3_no_external_call_is_made_with_the_fake_adapter` → network
  attempts fail the test.
- `test_NFR_SEC_01_production_refuses_the_fake_identity_adapter` → the process
  exits non-zero rather than booting.
- `test_ADR_0007_session_rotation_invalidates_the_previous_token`
- `test_NFR_SEC_02_no_secret_appears_in_any_log_line` → seeded assertion,
  token and phone number appear zero times in captured output.
- `test_ADR_0004_no_firebase_import_outside_its_adapter`
- `test_FR_ACCESS_05_restored_session_scope_comes_only_from_storage` → a forged
  workshop id in headers or body changes nothing.

### Manual QA

1. Sign in with the fake adapter → session issued, `workshop: null`.
2. Sign in again → the first token stops working.
3. Sign out → the token stops working; repeat is still 204.
4. Set `IDENTITY_ADAPTER=fake` with `APP_ENV=production` → refuses to boot.

## 14. Acceptance criteria (EARS)

- **EARS-E01-T03-1** — WHEN a registered owner completes valid phone
  authentication, the system SHALL create an authenticated session whose
  authority is resolved only from server-side storage. (`FR-ACCESS-03`)
- **EARS-E01-T03-2** — IF phone authentication fails for any reason, THEN the
  system SHALL return one indistinguishable failure and SHALL disclose no
  workshop or account information. (`FR-ACCESS-04`)
- **EARS-E01-T03-3** — WHILE the environment is production, the system SHALL
  refuse to start with the fake identity adapter selected.
- **EARS-E01-T03-4** — WHEN a session is issued, the system SHALL invalidate
  the account's previous session.

## 15. Self-review (agent fills BEFORE status: review-requested)

- [ ] All checklist items done (with commit hashes)
- [ ] `make test && make lint` pass
- [ ] Loading/error/empty states: N/A — no UI
- [ ] Audit entry on lifecycle writes — session issue/revoke timestamps set
      server-side
- [ ] No secrets/PII logged
- [ ] Diff confined to §5 list; §4 respected

### Deviations from spec

(none)

### Files touched (actual)

- ...

## 16. Definition of Done

- [ ] All §14 criteria pass via tests named by EARS/trace ID
- [ ] UI fidelity: N/A
- [ ] Peer-AI review approved by a different model
- [ ] **Task-level QA APPROVE — REQUIRED.** Authentication surface
- [ ] **skills/security-review pass recorded** — this is an auth task
- [ ] Squash-merged to epic branch; tracker + metrics stamped
- [ ] Graphiti episode written or "graph not consulted" noted
- [ ] Human verified at E01 checkpoint

## 17. Notes for the implementing agent

- The fake adapter is not a shortcut; it is how this epic is buildable at all
  without a provider account. Document its assertion format so every later test
  can use it.
- Rate limiting is deliberately excluded and must be recorded as a known gap.
  Do not half-build it.
- `node:crypto` provides `randomBytes`, `createHash` and `timingSafeEqual`.
  Nothing else is needed.
- ADR-0007 and the Q-005 answer are the authority on behaviour; do not re-derive.

## 18. Handoff

At `review-requested`, hand to a different-model peer, then to task-level QA
**and** a security review pass. This is the authentication surface; both are
required before T04 and T05 build on it.

## Open Questions

- None for implementation. The Firebase production pilot remains an open
  ADR-0007 condition and is not resolved by this task.

## Feedback log

- (human feedback on this deliverable lands here)

## Run log

- (adapter evidence, session behaviour, security-review ref, and session refs)
