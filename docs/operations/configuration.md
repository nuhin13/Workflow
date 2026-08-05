# Configuration

Every key is validated at startup by `packages/runtime-config`. A process with
missing or malformed configuration **fails to start** rather than booting and
failing later under traffic.

Configuration errors name the KEY and never the VALUE — a bad `DATABASE_URL` is
precisely where a password would otherwise be printed into a log or a CI
transcript.

## Keys

| Key | Services | Required | Notes |
|---|---|---|---|
| `APP_ENV` | all | yes | `development` \| `test` \| `staging` \| `production` |
| `LOG_LEVEL` | all | yes | `debug` \| `info` \| `warn` \| `error` |
| `API_PORT` | api | yes | 1–65535 |
| `DATABASE_URL` | api, worker | yes | Managed PostgreSQL in production. Never committed. Never logged. |
| `WALKING_SKELETON_ENABLED` | api | yes | Must be `false` in production — the process refuses to boot otherwise |
| `WORKER_CONCURRENCY` | worker | yes | E00 uses `1`; not a throughput commitment |
| `API_BASE_URL` | admin | yes | Internal service URL |

## Boundary keys — named, not yet used

Declared so operators can see what is coming. Each is read only by its own
adapter, in its own approved task (ADR-0004).

`OBJECT_STORAGE_ENDPOINT`, `OBJECT_STORAGE_BUCKET`, `FIREBASE_PROJECT_ID`,
`SMS_PROVIDER`.

**No credential key exists yet, deliberately.** Adding one before its adapter
task creates a slot people will fill with a real secret that nothing consumes.

## Where values come from

- Local: copy `.env.example` to `.env`. Every value in the example is a safe
  placeholder.
- Production: the secret manager, injected into the container environment.
  BLOCKED on open item 6 in `infra/vm/recovery-open-items.md`.

Never a committed file, never a shell command line.
