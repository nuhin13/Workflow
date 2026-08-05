# Compose topologies

Two files, deliberately different.

| | `compose.production.yaml` | `compose.development.yaml` |
|---|---|---|
| Services | admin, API, worker — exactly three | those three **plus PostgreSQL** |
| Images | pulled by immutable reference | built from source |
| Database | managed, external, injected via `DATABASE_URL` | local container, named volume |
| Walking-skeleton probe | always off | on |
| Ports | internal only, fronted by ingress | bound to `127.0.0.1` |

## Why production has no database

The authoritative record of every workshop's jobs, bills and dues must survive
loss of the application VM. A `postgres` service here would put the only copy on
a single host — the exact failure ADR-0006 accepts single-VM hosting *because it
avoids*. `scripts/verify-compose.sh` and
`tests/infrastructure/compose-topology.spec.ts` both assert the service list, so
adding one fails CI rather than surviving review.

## Local use

```bash
make up       # build and start, wait for health
make verify   # the full smoke gate
make down     # stop; the database volume is PRESERVED
```

`make down` never deletes data. Discarding the local database is a separate,
deliberate command that `compose-down.sh` prints for you.

## Production use

Not from a script. Follow `infra/vm/deploy-runbook.md`. Several of its steps are
BLOCKED on decisions listed in `infra/vm/recovery-open-items.md`.
