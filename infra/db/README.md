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

## Running

```bash
make up                                 # start the local stack
DATABASE_URL=... make migrate-diagnostic     # apply
DATABASE_URL=... make migrate-diagnostic-down # revert
```

The runner refuses to execute against `APP_ENV=production`. Production
migrations follow `infra/vm/deploy-runbook.md`, where they are step 4 — before
the application rolls, because both versions run simultaneously during the
deploy.
