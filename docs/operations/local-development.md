# Local development

From a fresh clone to a working round trip.

## Install these first

| Tool | Version | Why this exact one |
|---|---|---|
| Node | 24.4.0 | pinned in `.node-version` |
| pnpm | 11.20.0 | pinned in `package.json` → `packageManager`; enable with `corepack enable pnpm` |
| Flutter | 3.44.0 | pinned in `.flutter-version` (brings Dart 3.12.0) |
| Docker + Compose | any current | runs PostgreSQL and the service images |
| Java | 17+ | the OpenAPI generator runs on the JVM |

`make toolchain` checks all of them and fails loudly on a mismatch. A machine
that "mostly matches" produces builds nobody else can reproduce.

## First run

```bash
make toolchain   # verify versions
make install     # pnpm install + flutter pub get
make verify      # the whole gate: lint, tests, images, round trip
```

`make verify` takes several minutes because it builds container images and
starts a real stack. That is the point — it is the same thing CI runs.

## Seeing the walking skeleton

```bash
make up                                                  # start the stack
DATABASE_URL=postgres://garazo:garazo-local-dev@127.0.0.1:5432/garazo \
  make migrate-diagnostic                                # apply the diagnostic table

curl -X POST http://127.0.0.1:3000/api/v1/system/walking-skeleton \
     -H 'Content-Type: application/json' -d '{}'
# {"status":"persisted","visitCount":1,"correlationId":"..."}
```

In the app:

```bash
make dev-mobile     # then navigate to /dev/walking-skeleton
```

That route exists **only** in non-release builds — it is compiled out entirely
of a release binary.

## Everyday commands

| Command | Does |
|---|---|
| `make up` / `make down` | start / stop the stack. `down` never deletes your data |
| `make test` | node + Flutter suites |
| `make test-skeleton` | just the integration and end-to-end suites |
| `make lint` / `make format` | eslint + `flutter analyze` / Prettier |
| `make tokens` | regenerate design tokens and assert zero drift |
| `make api` / `make contract` | regenerate API clients / assert zero drift |
| `make scan` | secret scan over tracked files |
| `make verify` | everything, in the order CI runs it |

## Things that will confuse you once

- **Generated code is not versioned in two places.** `AppLocalizations` and the
  Dart API client are generated; run `flutter pub get` and `make api` after a
  fresh clone or `flutter analyze` will report missing files.
- **`make down` keeps your database.** Discarding it is a separate, deliberate
  command that `compose-down.sh` prints for you.
- **The API refuses to start without configuration.** That is intentional. The
  error names the missing keys.
- **Migrations never run on startup.** Apply them yourself with
  `make migrate-diagnostic`.
- **The probe is not idempotent.** Each accepted call increments. Two taps means
  two rows' worth of counting, and the UI disables the button mid-flight for
  exactly that reason.

## When something fails

`make verify` runs every step even after one fails, then lists what broke.
Start from the first failure — a broken toolchain makes everything below it
meaningless.
