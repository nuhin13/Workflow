# Rollback runbook

**Restore service first. Diagnose second.** A running old version is worth more
than a correct explanation of the new one.

**Status: NOT EXECUTABLE YET** — depends on the registry and secret decisions in
`recovery-open-items.md`.

## When to roll back

Roll back on any of: health checks not passing after a deploy, a sharp rise in
error responses, money values wrong or missing, or the owner-PIN protection not
behaving. Do not wait for a root cause.

## Application rollback (no migration in the release)

This is the easy case, which is why the previous image references are recorded
in step 1 of the deploy runbook.

1. Set the three image variables back to the recorded previous references.
2. ```bash
   docker compose -f compose.production.yaml up --detach --wait --wait-timeout 300
   ```
3. Verify as in deploy step 6.
4. Record what happened.

## Rollback when the release included a migration

**Do not roll the database back by default.** A down-migration discards data
written since the deploy — real jobs, real bills, real payments taken by real
workshops. Prefer to roll the APPLICATION back and leave the schema forward,
which is why migrations are required to be backward compatible.

Only consider a schema rollback when the migration itself is destroying or
corrupting data. In that case:

1. Stop the application containers first, so nothing writes during the change.
2. Follow the release's documented down-migration.
3. Restore from backup only if the down-migration cannot preserve the data —
   BLOCKED on open items 7 and 8 (no RPO/RTO target, no verified backup policy).
4. Restart the previous application version.
5. Treat data written between the bad deploy and the restore as at risk, and say
   so explicitly to whoever handles affected workshops.

## After any rollback

- [ ] Note the exact times: deploy, detection, rollback complete. The gap
      between detection and recovery is your real RTO.
- [ ] File the failure so the next release does not repeat it.
- [ ] Do not redeploy the same images without a change and a reason.
