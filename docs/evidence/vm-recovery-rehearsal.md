# Evidence — VM rebuild rehearsal

ADR-0006 accepts a single VM as a shared failure domain. That is only defensible
if nothing authoritative lives on it. This rehearsal tests that claim.

Run on 2026-08-05 with `make rehearse-rebuild`. **Nothing was provisioned and
nothing was modified** — a rehearsal that could damage an environment never gets
run, and an unrehearsed runbook is a hypothesis.

## Result

```
1. Rebuild inputs that must exist in SOURCE
  ok       production topology
  ok       API / worker / admin image definitions
  ok       configuration key inventory
  ok       host hardening steps
  ok       deploy / rebuild / rollback procedures
  ok       migration procedure

2. Nothing authoritative may live only on the VM
  ok       production topology declares no volume
  ok       database and object storage remain external
  ok       DATABASE_URL is required from the environment, not defaulted

3. Off-host material the rebuild depends on
  BLOCKED  container registry holding the exact running images (open item 4)
  BLOCKED  secret manager holding DATABASE_URL and credentials (open item 6)
  BLOCKED  verified backups of the managed database (open items 7, 8)
  BLOCKED  off-host log destination for post-mortem (open item 10)
  ok       unresolved-decision register

4. Runbook honesty
  ok       deploy / rebuild / rollback runbooks mark their unresolved steps

5. Rebuild is reproducible from source alone
  ok       production topology is version controlled

rehearse-vm-rebuild: 0 missing input(s), 4 step(s) blocked on an open decision
```

## What this proves

The **source side** is complete. Every file needed to rebuild the application
layer — topology, three image definitions, configuration inventory, hardening
checklist, and the deploy, rebuild and rollback procedures — exists in git and
is reproducible without anything a person remembers.

The production topology declares no volume and runs no data service, so losing
the VM loses running containers and nothing else.

## What this does NOT prove — read this part

**A real rebuild cannot be completed today.** Four steps are blocked on
decisions nobody has made:

| Blocked step | Consequence if the VM were lost right now |
|---|---|
| No container registry | The exact running images cannot be pulled. They would have to be rebuilt from source, which is slower and not byte-identical |
| No secret manager | `DATABASE_URL` could not be recovered from anywhere except someone's memory or laptop |
| No verified backups | If the managed database were also damaged, there is no tested restore path. An unverified backup is not a backup |
| No off-host logs | The post-mortem would have nothing to read, because the logs died with the host |

These are recorded in `infra/vm/recovery-open-items.md` as items 4, 6, 7, 8
and 10. They are **gates, not gaps**: an agent may not choose a supplier, a
retention policy, or an acceptable amount of data loss.

## The number that matters

`rebuild-runbook.md` step 10 asks for the wall-clock time from loss to service
restored. **It has not been measured**, because the rehearsal cannot complete
past the blocked steps.

Until it is measured on a real non-production host, any RTO figure would be a
guess. That measurement is the first thing to do after open items 1, 4 and 6 are
answered.
