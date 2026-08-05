# Evidence — the walking skeleton

Captured on 2026-08-05 from the development stack on the build machine. Every
response below is a real one, copied from the terminal. Correlation IDs are
server-generated and carry no identity.

Reproduce with `docs/operations/local-development.md`.

## The gate

```
$ make verify
[01] pinned toolchain matches            [08] formatting
[02] install (frozen lockfile)           [09] build all entry points
[03] flutter dependencies                [10] secret scan
[04] design tokens: zero drift           [11] node test suites
[05] OpenAPI contract + client drift      [12] flutter test suites
[06] eslint                              [13] container images + compose smoke
[07] flutter analyze                     [14] walking skeleton round trip

verify-clean-clone: all 14 steps passed
```

106 node assertions and 19 Flutter tests. Every step runs even after one fails,
so a bad run reports everything wrong at once rather than one thing per
six-minute round.

## Toolchain

```
node     v24.4.0
pnpm     11.20.0
flutter  3.44.0 (stable) · Dart 3.12.0
docker   28.5.1
```

All four match the repository pins; `make toolchain` fails otherwise.

## The stack

```
$ docker compose -f infra/compose/compose.development.yaml up --build --wait
 Container garazo-dev-postgres-1  Healthy
 Container garazo-dev-api-1       Healthy
 Container garazo-dev-admin-1     Healthy
```

Every container runs as the non-root user `garazo`.

## Liveness — process only, no downstream call

```
$ curl -s http://127.0.0.1:3000/api/v1/system/live
{"status":"ok","correlationId":"d07bf818-43c7-402d-9080-ea97f0a468c5"}
```

Exactly two fields. Nothing about the host, the build, or the database.

## Readiness — the database is genuinely reachable

```
$ curl -s http://127.0.0.1:3000/api/v1/system/ready
{"status":"ready","checks":{"database":"up"},"correlationId":"c8749326-..."}
```

Coarse `up`/`down` only. No hostname, URL, or driver version.

## The round trip

```
$ curl -s -X POST .../api/v1/system/walking-skeleton -d '{}'
{"status":"persisted","visitCount":1,"correlationId":"38a90412-..."}

$ curl -s -X POST .../api/v1/system/walking-skeleton -d '{}'
{"status":"persisted","visitCount":2,"correlationId":"0b213632-..."}
```

That is Flutter's generated client path exercised end to end: request →
NestJS → PostgreSQL upsert → committed count → response. The count is read back
from the database with `RETURNING`, not computed in the application.

Each request gets a distinct correlation ID, so a user's report can be tied to
one log line.

## Validation rejects unknown fields

```
$ curl -s -X POST .../api/v1/system/walking-skeleton -d '{"x":1}'
{"error":{"code":"VALIDATION.INVALID_FIELD","messageKey":"errors.validationInvalidField",
          "correlationId":"3517b6d4-...","fieldErrors":[{"field":"x","messageKey":"..."}]}}
[400]
```

The contract says the body is exactly `{}`. Silently ignoring unexpected input
is how a client and server drift apart without either noticing.

## Database unavailable — no false success

With PostgreSQL stopped:

```
{"error":{"code":"SYSTEM.DATABASE_UNAVAILABLE","messageKey":"errors.systemDatabaseUnavailable",
          "correlationId":"51d65776-...","fieldErrors":[]}}
[503]        api container state: running
```

Two things matter here. There is **no fabricated success**, and the API is
**still running** — an unhandled `pg` pool error used to kill the process
outright, which would have turned every database restart into an API outage.

No host, port, driver message or credential appears in the body.

## Atomicity under concurrency

25 concurrent increments against real PostgreSQL return exactly the values
1…25, and the committed row reads 25.

A read-then-write implementation passes every sequential check above and fails
this one: two callers read 4, both write 5, and one round trip disappears with
no error anywhere.

## Persistence survives a restart

The API container is restarted mid-suite and the count continues from where it
was. This is the difference between a real round trip and a convincing mock.

## The UI

`/dev/walking-skeleton` in the Flutter owner app, non-release builds only:

- **idle** — "Persistence check not run"
- **loading** — progress shown, button **disabled** (the probe is not
  idempotent, so a second tap would persist a second visit)
- **success** — "Persisted. Visit count: N" plus the correlation ID
- **error** — "Persistence check failed" and a correlation ID, with no stack,
  host or configuration

Accessible: named action, named live-region status. Bangla and English both
resolve through `AppLocalizations`. All four states have widget tests.

## What this does NOT prove

- **No product behaviour exists.** No auth, workshop, customer, job, bill or
  due. The only table is a diagnostic counter.
- **No APK or IPA was compiled.** Android `cmdline-tools` and a full Xcode are
  absent on this machine, so a real device build is still unproven.
- **Nothing about production.** No supplier, no managed database, no TLS, no
  secret manager. See `infra/vm/recovery-open-items.md`.
- **This is not idempotent.** Each accepted call increments. That is deliberate
  and must not be described as exactly-once behaviour.
