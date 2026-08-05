---
id: E01-T04
epic: E01
type: feature
title: Implement workshop setup and server scope
layer: backend
size: M
status: todo
owner_agent: developer-backend
preferred_agent: any
tier: build
token_estimate: { tier: M, range: "60k-110k" }
priority: { moscow: must, p: P1 }
depends_on: [E01-T03]
blocks: [E01-T10]
traces_to: [FR-ACCESS-01, FR-ACCESS-02, FR-ACCESS-05, FR-ACCESS-06, NFR-SEC-01, NFR-I18N-02, NFR-I18N-03]
external_services: []
files:
  create:
    - packages/server-core/src/access/complete-workshop-setup.use-case.ts
    - packages/server-core/src/access/read-workshop-context.use-case.ts
    - packages/server-core/src/access/set-locale.use-case.ts
    - packages/server-core/src/access/vehicle-types.ts
    - packages/server-core/src/access/complete-workshop-setup.use-case.spec.ts
    - packages/server-core/src/access/set-locale.use-case.spec.ts
    - apps/api/src/access/workshop.controller.ts
    - tests/integration/workshop-setup.spec.ts
  update:
    - apps/api/src/access/access.module.ts
    - packages/server-core/src/index.ts
feature_flags: []
ui_reference: "N/A — backend for SCR-001 setup and SCR-011 language control"
started_at:
completed_at:
executed_by:
reviewed_at:
reviewed_by:
review_outcome:
---

# E01-T04 · Implement workshop setup and server scope

## 1. Feature goal

Turn an authenticated account with no workshop into an authorized workshop
context, and serve that context — and only that context — for the rest of the
session.

## 2. Business logic

This is where tenancy becomes real. After setup, the session carries a workshop
scope that every later epic reads and none of them may override.

Setup happens **once**. A second attempt is a conflict, not an overwrite: the
workshop's identity is what E02's jobs, E03's bills and E13's fleet accounts all
hang off, and silently replacing it would orphan real records.

`region_profile` is `BD` and the default locale is `bn`, assigned by the access
domain rather than taken from the client. `NFR-I18N-03` requires Bangladesh
presentation to come from the region profile, not from unrelated record fields
— so it is a workshop attribute, decided server-side.

Locale is presentation only. `NFR-I18N-02` requires that switching language
changes **zero** stored business value.

## 3. What this task DOES

- Implement one-time workshop setup: create workshop, vehicle types, owner
  membership, and attach the workshop to the session — in one transaction.
- Implement reading the server-resolved workshop context.
- Implement locale preference changes.
- Bind the three workshop/locale routes from T01's contract.

## 4. What this task does NOT do (scope fence)

- Do not implement identity or sessions (T03) or owner-PIN behaviour (T05).
- Do not add a job, customer, vehicle, bill or any operational record.
- Do not implement SCR-001, SCR-002 or SCR-011 (T07–T09).
- Do not translate any string. Locale is stored here; the app resolves copy.
- Do not allow a second setup to overwrite the first.
- Do not accept a workshop identifier from the client, anywhere.
- Do not add multi-branch or fleet concepts — E12 and E13.
- Do not change the contract.

## 5. Files & changes

### Add

- `complete-workshop-setup.use-case.ts` — the one-time transaction.
- `read-workshop-context.use-case.ts` — server-resolved read.
- `set-locale.use-case.ts` — presentation preference.
- `vehicle-types.ts` — the approved enumeration, from the design canon.
- Two co-located spec files.
- `apps/api/src/access/workshop.controller.ts`.
- `tests/integration/workshop-setup.spec.ts`.

### Update

- `apps/api/src/access/access.module.ts` — register the use cases.
- `packages/server-core/src/index.ts` — export them.

### Delete

- None.

> The diff may not exceed this list. QA enforces.

## 6. Database changes

None. T02's schema is used as-is.

Setup writes `workshops`, `workshop_vehicle_types`, `memberships` and updates
`application_sessions.workshop_id` **in one transaction**. A partial setup —
workshop without membership, or membership without session scope — leaves an
account permanently unable to reach its own data.

## 7. API changes

No contract change. Implements `GET /workshops/current`,
`PUT /workshops/current/setup`, `PATCH /access/preferences/locale`.

- `GET` returns `WORKSHOP.NOT_SET_UP` (409) when the session has no workshop.
- `PUT` returns `WORKSHOP.ALREADY_SET_UP` (409) on a second attempt.
- `PATCH` accepts only `bn` or `en`.

## 8. Functions

```yaml
functions:
  - signature: "CompleteWorkshopSetupUseCase.execute(context: RequestContext, input: SetupInput) -> Promise<WorkshopSummary>"
    params: { context: "authenticated session context", input: "validated name and vehicle types" }
    returns: "the created workshop context"
    purpose: "One-time, all-or-nothing workshop creation"
  - signature: "ReadWorkshopContextUseCase.execute(context: RequestContext) -> Promise<WorkshopSummary>"
    params: { context: "authenticated session context" }
    returns: "only the workshop this session is authorized for"
    purpose: "Serve tenancy from the session, never from a request parameter"
  - signature: "SetLocaleUseCase.execute(context: RequestContext, locale: 'bn' | 'en') -> Promise<Locale>"
    params: { context: "authenticated session context", locale: "requested presentation language" }
    returns: "the stored locale"
    purpose: "Change presentation without touching a business value"
  - signature: "assertApprovedVehicleTypes(values: string[]) -> void"
    params: { values: "requested vehicle types" }
    returns: "void; throws VALIDATION.INVALID_FIELD listing offending entries"
    purpose: "Keep the enumeration closed so E02 can rely on it"
```

## 9. UI changes

None. T07 renders setup, T08 the home guard, T09 the language control.

## 10. External services & feature flags

None.

## 11. Challenges / Risks

- **A partial setup transaction is unrecoverable for that account.** Workshop,
  vehicle types, membership and session scope must commit together or not at all.
- **Concurrent setup requests** from a double-tapped button could create two
  workshops for one account. The uniqueness constraint on
  `memberships(account_id, workshop_id)` does not prevent two *different*
  workshops; serialize on the account.
- A second setup silently overwriting the first would orphan every record later
  epics attach to the workshop.
- Locale is presentation. Any code path where changing it rewrites a business
  value violates `NFR-I18N-02`.
- `GET /workshops/current` will be called on nearly every app start; it must not
  become a slow join.

## 12. Implementation checklist  (live execution log)

- [ ] tests written FIRST and failing for FR-ACCESS-01/02/05/06
- [ ] setup is one transaction: workshop, vehicle types, membership, session scope
- [ ] a second setup attempt conflicts and changes nothing
- [ ] concurrent setup for one account produces exactly one workshop
- [ ] vehicle types validated against the approved enumeration
- [ ] region profile and default locale assigned server-side
- [ ] reads return only the session's own workshop
- [ ] locale change alters zero stored business value

## 13. Test plan

### Automated

- `test_FR_ACCESS_01_confirmed_setup_retains_the_workshop_context`
- `test_FR_ACCESS_02_setup_response_enables_opening_the_home_context` → the
  response carries everything SCR-002 needs, so no second call is required.
- `test_FR_ACCESS_05_reads_return_only_the_authorized_workshop` → with two
  workshops seeded, every read returns zero of the other's rows.
- `test_FR_ACCESS_01_setup_is_one_transaction` → a forced failure mid-setup
  leaves no workshop, no membership and no session scope.
- `test_FR_ACCESS_01_concurrent_setup_creates_exactly_one_workshop`
- `test_FR_ACCESS_01_second_setup_conflicts_and_changes_nothing`
- `test_NFR_I18N_02_locale_change_alters_no_stored_business_value` → snapshot
  every access row before and after; only `locale` differs.
- `test_NFR_I18N_03_region_profile_is_server_assigned` → a client-supplied
  region profile is ignored.
- `test_FR_ACCESS_01_rejects_unapproved_vehicle_types`

### Manual QA

1. Fresh account → `GET /workshops/current` returns 409 NOT_SET_UP.
2. Complete setup → context returned with `regionProfile: BD`, `locale: bn`.
3. Repeat setup → 409 ALREADY_SET_UP, nothing changed.
4. Switch to `en` → only presentation changes.

## 14. Acceptance criteria (EARS)

- **EARS-E01-T04-1** — WHEN a first-time owner confirms all required setup
  values, the system SHALL retain the workshop context. (`FR-ACCESS-01`)
- **EARS-E01-T04-2** — WHEN initial setup is saved, the system SHALL return the
  context needed to open `SCR-002` without a further call. (`FR-ACCESS-02`)
- **EARS-E01-T04-3** — WHILE a session is authenticated for one workshop, the
  system SHALL return only records authorized for that workshop.
  (`FR-ACCESS-05`)
- **EARS-E01-T04-4** — WHEN the owner selects Bangla or English, the system
  SHALL store that preference and SHALL change no stored business value.
  (`FR-ACCESS-06`, `NFR-I18N-02`)

## 15. Self-review (agent fills BEFORE status: review-requested)

- [ ] All checklist items done (with commit hashes)
- [ ] `make test && make lint` pass
- [ ] Loading/error/empty states: N/A — no UI
- [ ] Audit entry on lifecycle writes — creation timestamps set server-side
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
- [ ] **Task-level QA APPROVE — REQUIRED.** Establishes tenancy for every later
      epic
- [ ] Squash-merged to epic branch; tracker + metrics stamped
- [ ] Graphiti episode written or "graph not consulted" noted
- [ ] Human verified at E01 checkpoint

## 17. Notes for the implementing agent

- The approved vehicle types come from the design canon (`SCR-001`). Do not
  invent entries; if the list is unclear, raise an Open Question rather than
  guessing — E02 will depend on these values.
- Every scoped query goes through T02's `withTenantScope`. If you find yourself
  querying without it, the guard is telling you something.

## 18. Handoff

At `review-requested`, hand to a different-model peer, then to task-level QA.
T10's integration gate consumes this.

## Open Questions

- None, provided the approved vehicle-type enumeration is unambiguous in the
  design canon. If it is not, raise it before implementing.

## Feedback log

- (human feedback on this deliverable lands here)

## Run log

- (setup evidence, isolation evidence, and session refs)
