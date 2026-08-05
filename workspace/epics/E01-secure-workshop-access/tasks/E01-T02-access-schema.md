---
id: E01-T02
epic: E01
type: feature
title: Create the access schema and tenant policies
layer: infra
size: M
status: todo
owner_agent: developer-backend
preferred_agent: any
tier: deep
token_estimate: { tier: M, range: "60k-120k" }
priority: { moscow: must, p: P1 }
depends_on: [E01-T01]
blocks: [E01-T03]
traces_to:
  [FR-ACCESS-01, FR-ACCESS-03, FR-ACCESS-05, FR-ACCESS-11, FR-ACCESS-13, NFR-SEC-01, NFR-SEC-02, ADR-0005, ADR-0007]
external_services: [postgresql]
files:
  create:
    - infra/db/migrations/0002_access_workshop.up.sql
    - infra/db/migrations/0002_access_workshop.down.sql
    - packages/server-core/src/access/access.repository.ts
    - packages/server-core/src/access/postgres-access.repository.ts
    - packages/server-core/src/access/tenant-guard.ts
    - packages/server-core/src/access/tenant-guard.spec.ts
    - tests/integration/access-schema.spec.ts
    - tests/integration/tenant-isolation.spec.ts
  update:
    - infra/db/README.md
    - scripts/migrate-diagnostic.sh
    - packages/server-core/src/index.ts
    - Makefile
feature_flags: []
ui_reference: "N/A — schema and policy only"
started_at:
completed_at:
executed_by:
reviewed_at:
reviewed_by:
review_outcome:
---

# E01-T02 · Create the access schema and tenant policies

## 1. Feature goal

Create the tables that hold accounts, workshops, memberships, sessions and PIN
state, and make cross-workshop data access impossible at **two** layers rather
than one.

## 2. Business logic

This is the first real product schema. Everything from E02 onwards hangs off
`workshops` and `memberships`, so the shape chosen here is expensive to change
later — and the isolation guarantee established here is the one that keeps one
workshop's money out of another's screen for the life of the product.

`NFR-SEC-01` requires **zero** foreign-workshop records. This task provides
defence in depth:

1. **Application layer** — every access query goes through a repository that
   takes a server-resolved `WorkshopScope` and cannot be called without one.
2. **Database layer** — PostgreSQL row-level security, so a query that somehow
   escapes the repository still returns nothing.

Two layers because the application layer is where a future task will make a
mistake. RLS is the seatbelt for the day someone writes a raw query in a hurry
at the end of E08.

Nothing here stores a secret in a reversible form. Firebase assertions, OTPs,
PINs and session tokens are never retained raw — only one-way verifiers.

## 3. What this task DOES

- Add a reversible, human-gated migration creating the eight access tables.
- Enable row-level security on every workshop-scoped table with policies keyed
  to a session-local workshop setting.
- Implement the access repository interface and its PostgreSQL adapter.
- Implement the tenant guard that makes an unscoped query a compile-time and
  runtime error.
- Generalise the migration runner beyond the single diagnostic migration.
- Prove isolation with a two-workshop integration suite that attacks both
  layers.

## 4. What this task does NOT do (scope fence)

- Do not implement identity verification, session minting, PIN verification, or
  any route. T03–T05 own behaviour; this task owns storage and policy.
- Do not add a job, customer, vehicle, bill, due, reminder, plan, inventory or
  admin table. Those belong to their own epics.
- Do not add an ORM, query builder or migration framework — `pg` and SQL only,
  as E00 established.
- Do not store a PIN, OTP, assertion or session token in a reversible form.
- Do not seed a workshop, account or membership. Setup is T04's behaviour.
- Do not run the migration automatically at startup, ever.
- Do not weaken E00's diagnostic migration or its guard.

## 5. Files & changes

### Add

- `infra/db/migrations/0002_access_workshop.{up,down}.sql` — the access schema
  and its RLS policies, reversible.
- `packages/server-core/src/access/access.repository.ts` — the interface.
- `packages/server-core/src/access/postgres-access.repository.ts` — the adapter
  (an **adapter edge**; may import `pg`).
- `packages/server-core/src/access/tenant-guard.ts` — scope enforcement.
- `packages/server-core/src/access/tenant-guard.spec.ts` — unit tests.
- `tests/integration/access-schema.spec.ts` — migration and constraint tests.
- `tests/integration/tenant-isolation.spec.ts` — the two-workshop attack suite.

### Update

- `infra/db/README.md` — document migration 0002 and the RLS model.
- `scripts/migrate-diagnostic.sh` — generalise to run any numbered migration.
  **Keep its production refusal.** Rename its Makefile targets accordingly.
- `packages/server-core/src/index.ts` — export the repository interface and
  guard; do NOT export the PostgreSQL adapter to anything but composition roots.
- `Makefile` — `make migrate` / `make migrate-down` covering all migrations.

### Delete

- None.

> The diff may not exceed this list. QA enforces.

## 6. Database changes

Migration `0002_access_workshop`. **Human-gated: the diff must be approved
before it runs** (constitution rule 4).

```sql
accounts (
  account_id        uuid primary key,
  phone_digest      text not null unique,   -- one-way; never the raw number
  created_at        timestamptz not null,
  disabled_at       timestamptz
)

workshops (
  workshop_id       uuid primary key,
  name              text not null check (length(btrim(name)) between 1 and 120),
  region_profile    text not null default 'BD' check (region_profile = 'BD'),
  locale            text not null default 'bn' check (locale in ('bn','en')),
  created_at        timestamptz not null,
  setup_completed_at timestamptz
)

workshop_vehicle_types (
  workshop_id       uuid not null references workshops on delete cascade,
  vehicle_type      text not null,
  primary key (workshop_id, vehicle_type)
)

memberships (
  membership_id     uuid primary key,
  account_id        uuid not null references accounts on delete cascade,
  workshop_id       uuid not null references workshops on delete cascade,
  role              text not null check (role in ('owner','staff')),
  created_at        timestamptz not null,
  revoked_at        timestamptz,
  unique (account_id, workshop_id)
)

application_sessions (
  session_id        uuid primary key,
  token_digest      text not null unique,   -- one-way; the raw token is never stored
  account_id        uuid not null references accounts on delete cascade,
  workshop_id       uuid references workshops on delete cascade,  -- null until setup
  issued_at         timestamptz not null,
  expires_at        timestamptz not null,
  revoked_at        timestamptz
)

owner_pin_credentials (
  workshop_id       uuid primary key references workshops on delete cascade,
  pin_digest        text not null,          -- one-way, salted
  updated_at        timestamptz not null
)

owner_pin_failure_states (
  workshop_id       uuid primary key references workshops on delete cascade,
  consecutive_failures  smallint not null default 0 check (consecutive_failures >= 0),
  completed_cycles      smallint not null default 0 check (completed_cycles >= 0),
  cooldown_until        timestamptz,
  updated_at            timestamptz not null
)

owner_money_grants (
  grant_id          uuid primary key,
  token_digest      text not null unique,   -- one-way
  session_id        uuid not null references application_sessions on delete cascade,
  workshop_id       uuid not null references workshops on delete cascade,
  issued_at         timestamptz not null,
  expires_at        timestamptz not null,
  revoked_at        timestamptz
)
```

**Design notes that are requirements, not preferences:**

- `phone_digest`, `token_digest` and `pin_digest` are one-way. A database dump
  must not yield a phone number, a session token, or a PIN.
- `application_sessions.workshop_id` is nullable **because a signed-in account
  with no workshop is a real state** (first-time owner before setup). Modelling
  it as non-null would force a fake workshop row.
- `owner_money_grants.session_id` is a foreign key with `on delete cascade`, so
  revoking a session revokes its money grants automatically. Grants outliving
  their session is exactly the shared-phone leak this product must not have.
- `owner_pin_failure_states.completed_cycles` drives Q-005's 60/120/240
  escalation. It is stored, not derived, so escalation survives a restart —
  otherwise a restart resets an attacker's budget.

### Row-level security

Enable RLS on `workshops`, `workshop_vehicle_types`, `memberships`,
`application_sessions`, `owner_pin_credentials`, `owner_pin_failure_states`
and `owner_money_grants`. Policies compare the row's `workshop_id` to
`current_setting('garazo.workshop_id', true)`.

The application sets that setting per transaction from the **server-resolved**
scope, never from request input. `accounts` is not workshop-scoped and is
reachable only by account id from an authenticated path.

- Up: create tables, constraints, indexes, enable RLS, create policies.
- Down: drop policies then tables, in dependency order, guarded by a shape
  check like migration 0001. Refuse if the shape is unexpected.
- Backfill: none.
- Execution: explicit human-approved command. Never at startup.

## 7. API changes

None. This task exposes no route.

## 8. Functions

```yaml
functions:
  - signature: "AccessRepository.findAccountByPhoneDigest(digest: string) -> Promise<Account | null>"
    params: { digest: "one-way digest of the verified phone number" }
    returns: "the account or null; never throws on absence"
    purpose: "Account lookup without the raw phone number ever reaching storage"
  - signature: "AccessRepository.createAccountWithWorkshop(input: NewWorkshopInput) -> Promise<WorkshopSummary>"
    params: { input: "validated setup values; no client-supplied identifier" }
    returns: "the created workshop context"
    purpose: "One transaction creating account, workshop, membership together"
  - signature: "AccessRepository.findSessionByTokenDigest(digest: string) -> Promise<SessionRecord | null>"
    params: { digest: "one-way digest of the presented token" }
    returns: "session with its resolved workshop, or null"
    purpose: "Resolve authority from the session, never from request input"
  - signature: "AccessRepository.recordPinFailure(scope: WorkshopScope) -> Promise<FailureState>"
    params: { scope: "server-resolved workshop scope" }
    returns: "updated failure state including any cooldown"
    purpose: "Atomic failure accounting that concurrency cannot under-count"
  - signature: "withTenantScope<T>(pool, scope: WorkshopScope, work: (client) => Promise<T>) -> Promise<T>"
    params: { scope: "server-resolved scope", work: "queries to run inside it" }
    returns: "the work's result"
    purpose: "Set the RLS setting for one transaction; the ONLY way to query scoped tables"
  - signature: "assertScoped(scope: WorkshopScope) -> asserts scope is WorkshopScoped"
    params: { scope: "any workshop scope" }
    returns: "narrows the type; throws on 'none'"
    purpose: "Make an unscoped scoped-query a type error, not a runtime discovery"
```

## 9. UI changes

None.

## 10. External services & feature flags

- PostgreSQL only; local container for tests, managed in production (ADR-0005).
- No new dependency. `pg` is already approved and present.
- No feature flag.

## 11. Challenges / Risks

- **RLS is easy to enable and easy to bypass.** A connection that is superuser,
  or a table whose owner bypasses RLS, silently disables the policy. The test
  suite must connect as the application role and prove isolation empirically,
  not merely assert that policies exist.
- **`current_setting` leaks across pooled connections** if it is set outside a
  transaction. It must be transaction-local (`set_config(..., true)`), or one
  request will inherit another workshop's scope — the exact opposite of the
  goal.
- Failure-state counting must be atomic. A read-then-write lets a parallel
  attacker get more attempts than the policy allows.
- A nullable `workshop_id` on sessions invites `null`-handling bugs; the guard
  exists so that "unscoped" cannot be passed to a scoped query.
- The down-migration must drop policies before tables, or the drop fails
  halfway and leaves a partial schema.

## 12. Implementation checklist  (live execution log)

- [ ] tests written FIRST and failing for EARS-E01-4 and NFR-SEC-01
- [ ] migration diff reviewed and explicit human approval recorded
- [ ] eight tables created with the stated constraints
- [ ] no raw phone, PIN, OTP, assertion or token is storable
- [ ] RLS enabled and policies present on every workshop-scoped table
- [ ] isolation proven empirically as the application role, not by inspection
- [ ] tenant scope is transaction-local and cannot leak across pooled connections
- [ ] PIN failure accounting is atomic under concurrency
- [ ] down-migration drops policies then tables and refuses an unexpected shape
- [ ] migration runner generalised; production refusal preserved

## 13. Test plan

### Automated

- `test_EARS_E01_4_cross_workshop_queries_return_zero_rows` → two workshops
  seeded; every scoped read from workshop A returns zero of B's rows.
- `test_NFR_SEC_01_rls_blocks_a_query_that_escapes_the_repository` → a raw
  query as the application role, bypassing the repository, still returns
  nothing without the scope setting.
- `test_NFR_SEC_01_tenant_scope_does_not_leak_across_pooled_connections` → set
  scope, return the connection to the pool, acquire again, assert no scope.
- `test_EARS_E01_4_unscoped_query_is_rejected` → `assertScoped` throws for a
  `none` scope and the repository refuses the call.
- `test_FR_ACCESS_11_pin_failure_accounting_is_atomic` → N concurrent failures
  produce exactly N counted failures and one correct cooldown.
- `test_NFR_SEC_02_no_secret_is_stored_in_reversible_form` → inspect column
  values after writing a known PIN/token/phone; none of the plaintexts appear.
- `test_EARS_E01_4_revoking_a_session_revokes_its_money_grants` → cascade holds.
- `test_ADR_0005_down_migration_removes_only_access_tables` → a neighbouring
  table survives; `system_probes` from E00 is untouched.

### Manual QA

1. Apply 0002 to a disposable database; inspect the schema.
2. Connect as the application role and attempt to read another workshop's rows
   directly. Confirm zero.
3. Roll back 0002 and confirm E00's diagnostic table still works.

## 14. Acceptance criteria (EARS)

- **EARS-E01-T02-1** — WHEN any access query runs for one workshop, the system
  SHALL return zero records belonging to another workshop, at both the
  application and PostgreSQL policy layers.
- **EARS-E01-T02-2** — WHERE a secret is stored, the system SHALL store only a
  one-way verifier, such that a full database dump yields no phone number, PIN,
  OTP, assertion or session token.
- **EARS-E01-T02-3** — WHEN a session is revoked, the system SHALL leave no
  usable owner-money grant derived from it.
- **EARS-E01-T02-4** — WHEN concurrent invalid PIN attempts occur, the system
  SHALL count every attempt exactly once.

## 15. Self-review (agent fills BEFORE status: review-requested)

- [ ] All checklist items done (with commit hashes)
- [ ] `make test && make lint` pass
- [ ] Loading/error/empty states: N/A — no UI
- [ ] Audit entry on lifecycle writes — access records are lifecycle records;
      confirm creation timestamps exist and are set server-side
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
- [ ] **Task-level QA APPROVE — REQUIRED.** Schema migration and the tenant
      isolation guarantee
- [ ] **Human migration approval recorded before execution**
- [ ] Squash-merged to epic branch; tracker + metrics stamped
- [ ] Graphiti episode written or "graph not consulted" noted
- [ ] Human verified at E01 checkpoint

## 17. Notes for the implementing agent

- Read `infra/db/migrations/0001_system_probe.*` first. Match its style: shape
  guard on the way down, no seed rows, comments explaining *why*.
- Isolation must be proven by attacking it, not by asserting policies exist.
  Write the attack first and watch it succeed before RLS, then fail after.
- PostgreSQL RLS: <https://www.postgresql.org/docs/current/ddl-rowsecurity.html>
- `set_config(name, value, true)` is the transaction-local form. The `true`
  matters more than anything else in this task.

## 18. Handoff

At `review-requested`, hand to a different-model peer with the migration diff
and the isolation suite output, then to task-level QA. The human migration
approval is a separate gate and must be recorded before the migration runs
anywhere that matters.

## Open Questions

- None. The schema follows the epic's ERD; digest algorithm and session
  lifetime are T03 implementation choices within this shape.

## Feedback log

- (human feedback on this deliverable lands here)

## Run log

- (migration approval, isolation evidence, and session refs)
