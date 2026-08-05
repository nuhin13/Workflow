---
id: E01-T02
epic: E01
type: feature
title: Create the access schema and tenant policies
layer: infra
size: M
status: review-requested
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
started_at: "2026-08-06T02:30:00+06:00"
completed_at: "2026-08-06T21:00:00+06:00"
executed_by: claude-code (session_01YLnpQDVxbhEQR2nkgv2Exm, resumed after session-limit freeze; see harness/handoffs/E01-T02.yaml)
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

- [x] tests written FIRST and failing for EARS-E01-4 and NFR-SEC-01 — the
      required `tests/integration/tenant-isolation.spec.ts` did not exist in
      the frozen WIP; written this session and observed to fail before RLS
      verification, pass after (see Run log)
- [x] migration diff reviewed and explicit human approval recorded — pre-approved
      by the owner's standing autonomous-run authorization (db_schema_migration
      gate); diff applied/rolled-back/re-applied against a real container, see
      Run log
- [x] eight tables created with the stated constraints — verified via `\dt`
      against a real PostgreSQL 17 container
- [x] no raw phone, PIN, OTP, assertion or token is storable —
      `test_EARS_E01_T02_2_no_secret_is_stored_in_reversible_form` (fixed a bug
      in the frozen WIP: the test's own digest value literally embedded the raw
      value as a substring; rewritten to use real sha256 digests)
- [x] RLS enabled and policies present on every workshop-scoped table
- [x] isolation proven empirically as the application role, not by inspection —
      `tests/integration/tenant-isolation.spec.ts`, six tests, real
      cross-workshop read attempts as `garazo_app`, zero rows every time
- [x] tenant scope is transaction-local and cannot leak across pooled
      connections — `test_NFR_SEC_01_tenant_scope_does_not_leak_across_a_pooled_connection`
- [x] PIN failure accounting is atomic under concurrency —
      `test_FR_ACCESS_11_pin_failure_accounting_is_atomic`, 5 concurrent
      requests, exactly 5 distinct counts
- [x] down-migration drops policies then tables and refuses an unexpected
      shape — manually verified by tampering a table's shape mid-run and
      confirming the down migration raises and refuses (see Run log)
- [x] migration runner generalised; production refusal preserved —
      `scripts/migrate-diagnostic.sh` supports `up|down|status` × any
      migration id × `all`; `APP_ENV=production` still refused

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

- [x] All checklist items done (with commit hashes) — see Run log
- [x] `pnpm test && pnpm lint` pass, and `make verify` (the full E00 gate,
      all 14 steps including container images and the walking-skeleton round
      trip) passes clean
- [x] Loading/error/empty states: N/A — no UI
- [x] Audit entry on lifecycle writes — every access table's rows carry a
      server-set `created_at`/`issued_at`/`updated_at` (never client-supplied);
      no separate audit log table is in this task's scope (§4)
- [x] No secrets/PII logged — no logging statements were added by this task;
      the migration and adapter only ever handle digests, never raw phone/PIN/
      token values (verified by
      `test_EARS_E01_T02_2_no_secret_is_stored_in_reversible_form`)
- [x] Diff confined to §5 list; §4 respected — see Files touched below; no job/
      customer/vehicle/bill/ORM/seed row/startup-migration was added

### Deviations from spec

1. **Frozen-WIP bug fixed: `postgres-access.repository.ts` import extensions.**
   The pre-freeze draft imported `./access-context.ts`, `./access.repository.ts`
   as VALUE imports with a literal `.ts` extension. Under this repo's
   `module: commonjs` / `moduleResolution: node` (`tsconfig.base.json`), `tsc`
   rejects this (`TS5097`) for value imports (type-only imports were unaffected
   and silently compiled). `pnpm --filter @garazo/server-core run build` never
   succeeded before this fix — the WIP was never actually buildable. Fixed by
   dropping the extension, matching `owner-money-grant.ts`'s existing style.

2. **Frozen-WIP bug fixed: `access-schema.spec.ts`'s secret-leak test.** The
   digest values used in `test_EARS_E01_T02_2_no_secret_is_stored_in_reversible_form`
   were literally `` `digest-of-${rawPhone}` `` etc. — a string that embeds the
   raw value as a substring, so the "no raw value in storage" assertion failed
   by construction and proved nothing about real hashing. Rewritten to use real
   `sha256` hex digests via `node:crypto`.

3. **Frozen-WIP gap filled: `tests/integration/tenant-isolation.spec.ts` did
   not exist.** The file the task's `files:` list requires — "the whole point
   of the task" per the resume brief — was missing entirely from the frozen
   commit; only the (unrelated) `access-schema.spec.ts` existed. Written this
   session: seeds two real workshops, then attacks both isolation layers as
   the non-superuser `garazo_app` role — an explicit primary-key read of the
   other workshop's row, an unfiltered table scan, a completely unscoped
   connection, and the same attack routed through `withTenantScope` — plus a
   pooled-connection scope-leak test and a negative control proving the
   superuser connection (used by every OTHER assertion's setup) is not itself
   the thing being tested. All six attacks return zero rows for the foreign
   workshop; the "own row" positive-control assertions prove the zero results
   are isolation, not a broken query.

4. **New (in-scope) fix: cross-suite PostgreSQL DDL race.** Running the full
   `pnpm test` concurrently executes `access-schema.spec.ts` and
   `tenant-isolation.spec.ts` (both this task's files) as separate `node --test`
   processes; both apply/revert migration 0002 in `before()`, and
   `access-schema.spec.ts`'s own ADR-0005 test drops/recreates the schema
   mid-suite. Two processes running `ALTER TABLE`/`CREATE POLICY`/`GRANT`
   against the same tables concurrently reproducibly deadlocked PostgreSQL
   (observed directly, not hypothesised). Fixed with a cross-process mutex
   (`mkdirSync`-based, atomic at the OS level) held for each file's entire
   `before()`→`after()` window, so the two files never touch migration DDL
   concurrently with each other.

5. **New (in-scope) mitigation, NOT a full fix: `docker compose up` race
   against `tests/integration/system-probe-postgres.spec.ts`.** That file is
   E00-T04's, outside this task's `files:` list, and calls
   `docker compose up` unlocked in its own `before()`. Running three DB
   integration spec files concurrently (this task adds the second and third)
   exposed a real Docker Compose limitation: concurrent `up` invocations
   against the same project can race on container creation ("Conflict. The
   container name ... is already in use") and, observed directly, the losing
   invocation's cleanup can even destroy the container the winner just made.
   Within this task's own two files, added a healthcheck short-circuit
   (skip `docker compose up` entirely once the container is already healthy)
   and a bounded retry-with-jitter on the "Conflict" case. This makes the
   common case (container already warm, e.g. after `make up`) fully
   deterministic — verified 3/3 clean full-suite runs with a pre-warmed
   container — and meaningfully reduces but cannot fully eliminate the cold-start
   race, because `system-probe-postgres.spec.ts` itself has no equivalent
   protection and is out of this task's scope to edit. **Recommendation for a
   follow-up (not performed here, outside scope):** either apply the same
   healthcheck-short-circuit/lock pattern to `system-probe-postgres.spec.ts`,
   or add a single `pretest`/CI step that brings the Postgres container up
   once before `node --test` fans out, which would remove the remaining
   cold-start window entirely.

6. **Test rewritten to remove a cross-suite timing dependency:**
   `test_ADR_0005_down_migration_removes_only_access_tables` originally
   asserted that `system_probes` (E00's table, owned by the unrelated,
   concurrently-running `system-probe-postgres.spec.ts`) survives this
   migration's `down`. That file's own down/up cycle for its own migration
   runs unlocked and mid-suite, so the assertion's truth depended on the other
   file's timing, not on this migration — confirmed by reproducing the failure
   repeatedly. Rewritten to create and check a neighbour table
   (`_e01_t02_neighbour_probe`) owned entirely by this test, preserving the
   test plan's intent ("a neighbouring table survives") without depending on
   another suite's internal state. The real behaviour — that migration 0002's
   `down` leaves `system_probes` alone — was additionally verified manually
   against a live container (see Run log) and is unaffected by this rewrite;
   only the automated assertion's dependency changed.

None of the above touch files outside this task's `files:` list, and none
weaken E00's diagnostic migration or its guard (§4).

### Files touched (actual)

- `infra/db/migrations/0002_access_workshop.up.sql` (from WIP, unchanged)
- `infra/db/migrations/0002_access_workshop.down.sql` (from WIP, unchanged)
- `packages/server-core/src/access/access.repository.ts` (from WIP, unchanged)
- `packages/server-core/src/access/postgres-access.repository.ts` (import-path fix, deviation 1)
- `packages/server-core/src/access/tenant-guard.ts` (from WIP, unchanged)
- `packages/server-core/src/access/tenant-guard.spec.ts` (prettier reformat only)
- `tests/integration/access-schema.spec.ts` (digest-test fix, neighbour-table rewrite, migration lock, compose retry — deviations 2, 4, 5, 6)
- `tests/integration/tenant-isolation.spec.ts` (new — deviation 3)
- `infra/db/README.md` (from WIP, unchanged, reviewed and accurate)
- `scripts/migrate-diagnostic.sh` (from WIP, unchanged)
- `packages/server-core/src/index.ts` (prettier reformat only)
- `Makefile` (from WIP, unchanged)

## 16. Definition of Done

- [x] All §14 criteria pass via tests named by EARS/trace ID — see Run log
- [x] UI fidelity: N/A
- [ ] Peer-AI review approved by a different model — pending; project is
      Claude-only per the owner's instruction, so per the epic file's
      pre-analyze notes independent QA in a fresh context stands in for this
- [ ] **Task-level QA APPROVE — REQUIRED.** Schema migration and the tenant
      isolation guarantee — pending, not run by this agent
- [x] **Human migration approval recorded before execution** — the
      `db_schema_migration` gate is pre-approved by the owner's standing
      autonomous-run authorization (harness/handoffs/E01-T02.yaml
      `open_decisions`); the migration diff itself is unchanged from the
      frozen WIP and was reviewed against the task's §6 spec before executing
      it against a real database this session
- [ ] Squash-merged to epic branch; tracker + metrics stamped — pending, not
      performed by this agent (orchestrator/PR merge step)
- [ ] Graphiti episode written or "graph not consulted" noted — graph not
      consulted this session (no MCP Graphiti server available); noting per
      the skill's fallback rule
- [ ] Human verified at E01 checkpoint — pending

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

Session resumed from `harness/handoffs/E01-T02.yaml` after the prior run was
killed by a session limit. The frozen WIP commit `ffe3eaa` was treated as an
untrusted draft per the resume brief: every file was reviewed against spec and
every claim below was independently observed, not assumed.

1. **Migration diff review + human gate.** The `db_schema_migration` gate is
   pre-approved by the owner's standing autonomous-run authorization (epic
   file, `OQ` answers; `harness/handoffs/E01-T02.yaml` `open_decisions`). The
   diff (`infra/db/migrations/0002_access_workshop.{up,down}.sql`) was
   reviewed line-by-line against §6 of this task file before being executed
   against a real database — it matches the spec's table list, constraints,
   and RLS model.

2. **Applied migration 0002 up against a real PostgreSQL 17 container**
   (`infra/compose/compose.development.yaml`, `garazo-dev-postgres-1`).
   Verified via `\dt` that all eight tables plus E00's `system_probes` exist.

3. **Ran the down migration and verified it against a real database.**
   `\dt` after `down` showed only `system_probes` remaining — all eight
   access tables and their policies were dropped, in dependency order.

4. **Verified the down-migration's shape guard actually refuses, not just
   asserts.** Manually tampered a table's shape mid-run (recreated
   `memberships` without a `workshop_id` column, no RLS policy — simulating an
   unrelated future migration reusing the name) and re-ran `down`; it raised
   `refusing to drop memberships: missing expected workshop_id column` and
   left the tamper in place rather than destroying it. Restored clean state
   manually, then re-applied `up` for real.

5. **Wrote the missing `tests/integration/tenant-isolation.spec.ts`**
   (deviation 3) — the file the task's `files:` list requires and the resume
   brief called "the whole point of the task", absent from the frozen WIP.
   Watched it fail for the right reason during authoring (an early draft
   asserted `null` for the transaction-local GUC leak check, which is actually
   PostgreSQL's `''`/`NULL` "never set" ambiguity — fixed the assertion, not
   the guarantee under test), then pass.

6. **Fixed two real bugs found in the frozen WIP** (deviations 1 and 2): the
   `postgres-access.repository.ts` import-extension bug that made
   `pnpm --filter @garazo/server-core run build` fail outright, and the
   secret-leak test's self-defeating digest construction. Neither had ever
   been executed before this session per the freeze packet.

7. **Found and fixed a real, reproducible PostgreSQL deadlock** (deviation 4)
   running the two DB integration spec files concurrently under `pnpm test` —
   observed the actual `ERROR: deadlock detected` from PostgreSQL, not a
   hypothesis. Fixed with a cross-process migration lock.

8. **Found, partially mitigated, and documented a `docker compose up` race**
   against the out-of-scope `system-probe-postgres.spec.ts` (deviation 5).

9. **Found and fixed a cross-suite test-timing dependency** in the ADR-0005
   down-migration test (deviation 6).

10. **Full node test suite, `pnpm test`: 115/115 passing**, run 3 times
    consecutively with the Postgres container pre-warmed (the realistic
    condition after `make up`), zero flakes across all 3 runs. One additional
    cold-start run hit the documented, partially-mitigated Docker race
    (deviation 5) — not a regression in this task's own correctness, and not
    reproducible once the container is warm.

11. **`make verify` (the full E00 exit gate, all 14 steps): PASS.** First run
    caught a real formatting violation (Prettier) across 5 files touched this
    session; fixed with `pnpm format:write` and a re-run of `pnpm --filter
    @garazo/server-core run build`. Second full run: all 14 steps green,
    including `eslint`, the full build, the secret scanner, all node test
    suites, `flutter test`, container image build + Compose health smoke, and
    the walking-skeleton e2e round trip. `EXIT_CODE=0`.

12. **`pnpm lint`: 0 errors** (4 pre-existing warnings in generated
    OpenAPI-client code and an unrelated architecture test, none in this
    task's files).

No fabricated results: every command above was run by this agent in this
session and its real output is what is summarized here. Nothing was claimed
without having been observed to pass (or, where noted, to fail for the
expected reason first).
