# Rebuild runbook — total VM loss

The single-VM topology (ADR-0006 Option 3) accepts that this host can be lost.
It is acceptable only because nothing authoritative lives here: the database and
private objects are managed services, and everything else is rebuilt from git.

**Status: NOT EXECUTABLE YET** — most steps are BLOCKED on
`recovery-open-items.md`.

**Rehearsed in E00-T05** with `make rehearse-rebuild` (dry-run; nothing
provisioned or modified). Every SOURCE input this runbook needs exists and is
version controlled, and the production topology was confirmed to hold no volume
and no data service. Four steps remain blocked — registry, secret manager,
verified backups, off-host logs. Full result:
`docs/evidence/vm-recovery-rehearsal.md`.

**The RTO in step 10 has not been measured**, because the rehearsal cannot
complete past those blocked steps. Any figure quoted before that measurement is
a guess.

## What you are rebuilding

Running containers, and nothing else. If any step below feels like it is
recovering data from the host, stop: something authoritative was placed on the
VM and ADR-0006 must be reopened.

## Steps

1. **Confirm the data survived.** Before rebuilding anything, verify the managed
   PostgreSQL instance and the object storage bucket are intact and reachable.
   Rebuilding an application in front of a lost database wastes the time you
   should be spending on the restore.

2. **Provision a replacement host** — BLOCKED on open items 1 and 12.

3. **Harden it** using `hardening-checklist.md`, before anything is exposed.

4. **Install Docker Engine and the Compose plugin.**

5. **Fetch `compose.production.yaml`** from this repository at the tag that was
   running. Do not reconstruct it from memory.

6. **Restore configuration and secrets** from the secret manager — BLOCKED on
   open item 6. This is why secret recovery material must never live only on the
   VM: if it did, this step would be impossible right now.

7. **Pull the exact image references** that were running — BLOCKED on open
   item 4.

8. **Start the stack** and verify exactly as in deploy step 6.

9. **Repoint DNS / ingress** to the new host — BLOCKED on open item 5.

10. **Record the wall-clock time from loss to service restored.** That number is
    your real RTO. Compare it to the target once one exists (open item 7); if it
    is worse, the topology or the target has to change.

## Rehearsal

Do this on a non-production host before you need it. A runbook that has never
been executed is a hypothesis. Note every step where you had to improvise — each
one is either a missing open item or a missing instruction.
