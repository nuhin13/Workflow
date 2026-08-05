# Unresolved production decisions

**These are gates, not gaps.** Every item below is a decision a human must make.
An agent may not choose one, and a runbook step that depends on one is marked
BLOCKED rather than guessed. Guessing here produces a plan that reads as
complete and fails on the day it is needed.

Nothing in this repository provisions infrastructure. E00 defines the container
contract and the operator procedures only.

## Open items

| # | Decision | Blocks | Why it cannot be guessed |
|---|---|---|---|
| 1 | Hosting supplier and region | Everything below | Bangladesh data-residency expectations and latency to Dhaka workshops are business decisions with legal weight. |
| 2 | Managed PostgreSQL supplier, tier and region | Deploy, restore, RPO/RTO | Determines backup mechanics, failover behaviour and cost per workshop. |
| 3 | Private object storage supplier and bucket policy | Media features (later epics) | Determines the private-access model; a wrong default makes customer vehicle photos public. |
| 4 | Container registry | Deploy, rollback, image digest pinning | Until a registry exists there is no immutable digest to pin, so images are tag-pinned. See item 11. |
| 5 | TLS termination and ingress | Public access | Certificate issuance/renewal ownership must be explicit or the site expires silently. |
| 6 | Secret manager and injection mechanism | Deploy | `DATABASE_URL` and later provider credentials must reach containers without ever touching git or a shell history. |
| 7 | RPO and RTO targets | Backup policy, restore drill | "How much money data may we lose, and for how long may a workshop be down" is a business answer, not a technical one. |
| 8 | Backup policy and restore verification cadence | Rebuild runbook | An unverified backup is not a backup. Cadence and ownership must be named. |
| 9 | Availability target | Topology | A single VM cannot meet a high target; if one is promised, ADR-0006 must be revisited. |
| 10 | Observability supplier | Log/metric shipping | Logs must leave the host to be useful after the host is gone. |
| 11 | Base image digest pinning | Reproducible deploys | Images pin `node:24.4-alpine` by tag. A tag can be repointed, so two "identical" deploys can differ and a rollback stops being exact. Resolve the digest from the chosen registry (item 4). |
| 12 | VM sizing | Resource limits | Compose limits are placeholders, not measured values. |

## What must survive loss of the VM

The single-VM topology (ADR-0006 Option 3) is acceptable ONLY while all of the
following live elsewhere. If any moves onto the VM, the topology decision must be
reopened.

- The authoritative database — managed PostgreSQL, off-host.
- Private objects — managed object storage, off-host.
- Source and image build inputs — this git repository.
- Secret and configuration recovery material — the secret manager (item 6).
- Backups and their restore procedure — off-host (items 7, 8).

The VM holds running containers and nothing that cannot be rebuilt from the
above.
