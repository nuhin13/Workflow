---
name: genesis-epic
description: Create Epic 00 - the mandatory project genesis defining stack, structure, architecture, patterns, security, and the deployable walking skeleton before ANY feature work. Use at every project start, and when foundation decisions are missing or contested.
---
# Epic 00 — Genesis / Walking Skeleton

No feature epic starts until Epic 00 is human-approved AND its walking
skeleton runs end-to-end. The epic file IS the checklist:
`epics/E00-genesis/epic.md` — every box maps to a task and a Decision record.

## Step 0 — investigate before deciding (E00-T00)
The FIRST genesis task is a deep business/domain analysis on **opus**: model
every entity, lifecycle, end-to-end flow, failure mode and hard constraint
into `docs/domain/` BEFORE any technology choice. Architecture (T01),
conventions/DFDs (T02) and security/threat model (T04) all build on it. This
is the baseline of the baseline — spend the budget here.

## What it must decide (nothing skipped, "N/A + why" allowed)
Stack (+rationale) · monolith vs microservices · DDD/TDD/hybrid · folder
structure · high-level design patterns · coding patterns · ENUM pattern ·
naming conventions (vars/files/functions/branches) · route & navigation map ·
feature-level DFDs · **containerization (CONDITIONAL, v2 §10): if the tech plan
declares a server / database / queue, a `docker-compose.yml` + per-service
Dockerfile is a REQUIRED E00 deliverable and `docker compose up` must boot the
stack; a client-only project (mobile/desktop) does NOT require Docker — CI uses
the native toolchain)** · setup/shell scripts ·
CI + branch protection · third-party services inventory · security baseline
(authN/Z, input validation, secrets) · JWT/session strategy (TTLs, rotation,
storage) · error envelope + pagination style · observability wiring.

## Procedure
0. **Propose, don't decide.** For stack/architecture/methodology/security,
   the agent presents options with honest pros/cons, a comparison matrix
   against the SRS NFRs, and an advisory recommendation — then STOPS. The
   human chooses (ADR `Decision` stays `⏳ AWAITING HUMAN`, status `proposed`,
   until they do). Only after the human picks does the agent record the
   decision + consequences and set `accepted`.
1. Team Lead drafts each decision as an ADR
   (`harness/memory/decisions/ADR-NNNN-*.md`): context → options → decision →
   consequences. Stack choices must cite the SRS constraints (team skills,
   client infra, NFRs) — not fashion.
2. HUMAN approves every ADR (this is the highest-leverage human gate in the
   whole project).
3. Tasks E00-T01..T05 execute the approved decisions (see the epic folder).
4. **Epic 00 exit gate (human)** — feature epics shard ONLY when: the domain
   model is accepted, ADRs 0001..0007 are accepted, conventions/tokens exist,
   CI is green, and the walking skeleton has been SEEN responding.
5. **Walking skeleton**: one request flows
   UI → API → DB → back, deployed (flag-gated ok), CI green, with one real
   test at every layer. Tiny but END-TO-END (Cockburn's definition).
6. Seed Graphiti with Entity/Decision/ThirdPartyService/File nodes; update
   the conventions block in /AGENTS.md.

## Rules
- Genesis decisions change ONLY via a new ADR superseding the old (never
  edit history) + human approval.
- If the human already mandates parts (client stack), record them as ADRs
  marked `imposed` — still written down, still traceable.
