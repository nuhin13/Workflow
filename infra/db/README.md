# Database migrations

## The rules

1. **Migrations never run at application startup.** They are run deliberately,
   by a person, with `scripts/migrate-diagnostic.sh`. Startup migration means
   several replicas racing the same change, and it means a container started
   with the wrong environment can migrate the wrong database.
2. **Every migration is reversible.** A migration you cannot undo is a decision
   you cannot revisit at 03:00.
3. **A down-migration verifies its target before destroying it.** Rollbacks
   happen when something has already gone wrong, usually fast; the guard in
   `0001_system_probe.down.sql` refuses to drop a table whose shape it does not
   recognise.
4. **Schema changes are a human gate** (constitution rule 4). The diff is
   reviewed and approved before it runs.
5. **Migrations must be backward compatible with the currently running code.**
   During a deploy both versions are live at once.

## Migrations

| ID | Purpose | Reversible | Product data |
|---|---|---|---|
| `0001_system_probe` | E00 walking-skeleton diagnostic | yes | none |
| `0002_access_workshop` | E01 access schema: accounts, workshops, memberships, sessions, owner-PIN state | yes | first product tables |

### 0001_system_probe

Creates one table, `system_probes`, holding a single counter row. It exists to
prove the architecture end to end: Flutter → generated client → NestJS →
PostgreSQL → back.

It is **not product data**. The primary key is constrained to the single value
`'walking-skeleton'` specifically so this cannot quietly become a generic
key-value or settings table — the failure mode where a "temporary" diagnostic
table accumulates real meaning and can no longer be dropped.

No seed row is inserted, so the first probe call exercises the INSERT path. A
seeded row would hide a broken insert forever.

### 0002_access_workshop

Creates the eight access tables (`accounts`, `workshops`,
`workshop_vehicle_types`, `memberships`, `application_sessions`,
`owner_pin_credentials`, `owner_pin_failure_states`, `owner_money_grants`) and
enables PostgreSQL row-level security on every workshop-scoped one of them
(`NFR-SEC-01`, `ADR-0005`).

**Two layers of isolation, on purpose.** The application repository
(`packages/server-core/src/access/`) requires a server-resolved
`WorkshopScope` for every scoped read/write — `tenant-guard.ts`'s
`withTenantScope` is the only way to obtain a scoped connection, and
`assertScoped` makes calling it without a real scope a thrown error, not a
silent empty result. RLS is the second, independent layer underneath: even a
raw query that bypasses the repository entirely still returns nothing,
because PostgreSQL itself filters every row by the transaction-local setting
`garazo.workshop_id`.

**Application role.** `POSTGRES_USER` (`garazo`, from
`infra/compose/compose.development.yaml`) is the cluster superuser and, like
every table owner, always bypasses RLS — a connection using it cannot prove
isolation even when RLS is correctly configured. The migration also creates
`garazo_app`, a non-superuser role with only `SELECT`/`INSERT`/`UPDATE`/`DELETE`
on the access tables, and the isolation test suite connects as this role.
Its password is a fixed, local-only placeholder (`garazo-app-local-dev`),
identical in every checkout and worthless to an attacker, exactly like
`POSTGRES_PASSWORD` above. **This is not a production credential.** Before
this role is used against a real database, an operator must rotate its
password out-of-band (`ALTER ROLE garazo_app WITH PASSWORD '...'`) as part of
the production deploy runbook — that rotation step is not implemented by this
migration or this task.

**The `garazo.bootstrap` escape hatch.** Two operations legitimately need to
run before any workshop scope can exist: creating the very first account +
workshop + membership (there is no workshop to scope to until that
transaction creates one) and resolving a session by its token digest (the
digest itself is the proof, and is what tells the server which scope to set
next). `workshops`, `workshop_vehicle_types`, `memberships`, and
`application_sessions` accept an additional transaction-local flag,
`garazo.bootstrap`, set only by those two `PostgresAccessRepository` methods
and never derived from client input. `owner_pin_credentials`,
`owner_pin_failure_states`, and `owner_money_grants` are written only once a
workshop scope already exists, so their policies are the plain
`workshop_id`-match comparison with no bootstrap clause. This is a deviation
beyond the literal policy description in `E01-T02` §6; see that task file's
Open Questions/Deviations section for the full rationale.

## Running

```bash
make up                                       # start the local stack
DATABASE_URL=... make migrate-diagnostic      # apply 0001 only
DATABASE_URL=... make migrate-diagnostic-down # revert 0001 only

DATABASE_URL=... make migrate                 # apply every migration, in order
DATABASE_URL=... make migrate-down            # revert every migration, in reverse order
DATABASE_URL=... make migrate MIGRATION=0002_access_workshop      # apply just 0002
DATABASE_URL=... make migrate-down MIGRATION=0002_access_workshop # revert just 0002
```

The runner refuses to execute against `APP_ENV=production`. Production
migrations follow `infra/vm/deploy-runbook.md`, where they are step 4 — before
the application rolls, because both versions run simultaneously during the
deploy.
