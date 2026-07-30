# ADR-0006 — Hosting and runtime

- status: accepted
- date: 2026-07-29 | proposed_by: architect | decided_by: project owner on 2026-07-30
- traces_to: [FR-ONLINE-01–FR-ONLINE-03, NFR-REL-01, NFR-SEC-01,
  FC-008, FC-010, FC-011, FC-016, FC-020, FC-021]

## Context

The runtime must host an API, background work, structured data, private media,
and observability. Expected M+12 load is 30 peak concurrent accounts and 45
requests/second; the aggressive case is 68 peak concurrent accounts
(`FC-008`, `FC-011`, `FC-020`, `FC-021`). Monthly product infrastructure has
an approved but low-confidence envelope of ৳30,000–৳90,000 at M+12
(`FC-016`). Current region availability, data handling, and quotes require
human review.

Official references checked 2026-07-29 and rechecked 2026-07-30:
[Cloud Run overview](https://cloud.google.com/run/docs/overview/what-is-cloud-run),
[GKE Autopilot](https://cloud.google.com/kubernetes-engine/docs/concepts/autopilot-overview),
[Docker Compose production](https://docs.docker.com/compose/how-tos/production/),
and [Cloud SQL PostgreSQL](https://cloud.google.com/sql/postgresql).

## Options considered

1. **Managed container platform (reference: Cloud Run) plus managed SQL/object
   storage** — pros: low platform administration, standard container exit
   path, API/worker revisions and autoscaling controls; cons: provider
   coupling, cold-start/minimum-instance trade-off, SQL connection planning;
   exit cost: medium.
2. **Managed Kubernetes (reference: GKE Autopilot) plus managed SQL/object
   storage** — pros: workload flexibility, service extraction, mature
   orchestration; cons: manifests, cluster concepts, and operational surface
   exceed the forecast need; exit cost: medium.
3. **Single hardened VM with Docker Compose plus managed SQL/object storage**
   — pros: simple topology, predictable always-on host, strong provider
   portability; cons: patching, host failover, safe deploys, scaling, and
   monitoring become operator work; exit cost: medium.

All cost comparisons are relative; acceptance requires current quotes against
`FC-016`.

## Comparison matrix

| Criterion (weight) | Managed containers | Managed Kubernetes | VM + Compose |
|---|---:|---:|---:|
| Operational simplicity (25) | 5 (125) | 3 (75) | 2 (50) |
| Forecast-scale fit (20) | 5 (100) | 2 (40) | 4 (80) |
| Resilience controls (15) | 4 (60) | 5 (75) | 2 (30) |
| Portability (15) | 4 (60) | 4 (60) | 5 (75) |
| Cost-envelope fit (15) | 4 (60) | 2 (30) | 4 (60) |
| Team/agent buildability (10) | 5 (50) | 2 (20) | 4 (40) |
| **Weighted total / 500** | **455** | **300** | **335** |

## Agent recommendation (advisory — NOT the decision)

Recommend Option 1 after a Bangladesh-facing latency/region review and current
quote. Use standard containers, managed SQL/object storage, bounded
autoscaling, and explicit connection limits. The forecast does not justify
Kubernetes, while a single VM creates avoidable human operations. Final call
is yours.

## Decision

Option 3 — Single hardened VM with Docker Compose plus managed PostgreSQL and
private object storage.

Confirmed by the project owner on 2026-07-30. The owner selected direct
control, predictable always-on operation, and provider portability over the
advisory recommendation for managed containers.

## Consequences

- The Next.js admin, NestJS API, and separately runnable NestJS worker are
  deployed as containers on one hardened VM using a production Compose
  definition.
- PostgreSQL and private object storage remain managed services and are not
  hosted on the application VM.
- The team owns operating-system and container-runtime patching, firewall and
  access hardening, deploy safety, process supervision, monitoring, capacity,
  incident response, and host recovery.
- One host failure can interrupt the admin, API, and worker together. Recovery
  automation, tested rebuild instructions, health checks, rollback, and
  off-host configuration/backups are required before production.
- Standard container images and external managed data services preserve a
  later migration path to managed containers. Such a migration requires a new
  ADR.
- Initial scaling is bounded by the VM. Sustained resource pressure,
  unacceptable recovery time, or availability needs beyond one host trigger a
  hosting review rather than unplanned service splitting.
- Managed containers and managed Kubernetes are rejected for the initial
  runtime.
- Region, VM supplier, environments, networking, TLS/ingress mechanism,
  availability target, backup/RPO/RTO, secret manager, image registry,
  observability supplier, and exact sizing remain later human-approved
  contracts.
