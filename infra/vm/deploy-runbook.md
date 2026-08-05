# Deploy runbook

Deploying is a deliberate operator action. CI verifies; it does not deploy and
holds no production credential (see `.github/workflows/ci.yml`).

**Status: NOT EXECUTABLE YET.** Steps marked BLOCKED depend on decisions in
`recovery-open-items.md`. Do not improvise a value to get past one.

## Before you start

- [ ] The change is merged and CI is green on that commit.
- [ ] You know the exact image references you are deploying.
- [ ] You know the currently running image references — you cannot roll back to
      a version you did not write down. Record them now, not later.
- [ ] Someone other than you knows a deploy is happening.

## Steps

1. **Record the current state.** On the VM:
   ```bash
   docker compose -f compose.production.yaml ps
   docker compose -f compose.production.yaml config | grep image:
   ```
   Save the output where it survives the VM (open item 10). This is your
   rollback target.

2. **Build and publish images** — BLOCKED on open item 4 (no registry chosen).
   Images must be immutable and identified by digest, so the thing you tested is
   provably the thing you ran.

3. **Confirm environment.** `DATABASE_URL`, `APP_ENV` and the three image
   references must come from the secret manager (BLOCKED on open item 6). Never
   paste a credential into a shell — it lands in history and in your scrollback.

4. **Migrate the database first, if the release includes a migration.** Follow
   the migration procedure for that release. Migrations must be backward
   compatible with the currently running code, because between step 4 and step 5
   both versions are live at once.

5. **Roll the services.**
   ```bash
   docker compose -f compose.production.yaml pull
   docker compose -f compose.production.yaml up --detach --wait --wait-timeout 300
   ```
   `--wait` blocks until health checks pass. If it times out, the deploy failed;
   go to `rollback-runbook.md`. Do not "wait a bit longer and hope".

6. **Verify, from outside the VM.**
   - `GET /api/v1/system/live` returns `{"status":"ok",…}`.
   - `GET /api/v1/system/ready` returns `{"status":"ready",…}` — this is the one
     that proves the managed database is actually reachable.
   - The admin shell loads.
   - Worker logs show `worker started`.
   Checking from inside the VM proves only that the VM can reach itself.

7. **Confirm the walking-skeleton route is absent.** In production
   `WALKING_SKELETON_ENABLED` is `false` and `APP_ENV` is `production`, so
   `POST /api/v1/system/walking-skeleton` must return 404. If it does not, stop
   and treat it as an incident: a diagnostic write path is exposed.

8. **Record the deploy** — what, when, by whom, and the previous image
   references.

## If anything looks wrong

Go to `rollback-runbook.md`. Rolling back a healthy-looking deploy costs
minutes; diagnosing a broken one in production while workshops are billing
customers costs a great deal more.
