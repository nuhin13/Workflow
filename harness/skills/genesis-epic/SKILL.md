---
name: genesis-epic
description: Create Epic 00 from the accepted tech plan and product ADRs - implement structure, conventions, security baseline, and a deployable walking skeleton before feature work. Never re-decide accepted foundations.
---
# Epic 00 — Genesis / Walking Skeleton

No feature epic starts until Epic 00 is human-approved AND its walking
skeleton runs end-to-end. The epic file IS the checklist:
`workspace/epics/E00-genesis/epic.md` — every box maps to a task and a Decision record.

## Step 0 — verify the accepted foundation
Before E00 is specced, read the decided tech plan, domain model, and every
accepted product ADR under `workspace/plan/03-technical/decisions/`. If a
foundational area is absent, proposed, or contradictory, STOP and return it to
`/tech-plan`; E00 cannot fill or reopen that decision.

## What it must implement (nothing skipped, "N/A + why" allowed)
Accepted stack and architecture · folder structure · high-level design
patterns · coding patterns · ENUM pattern ·
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
0. Team Lead maps each accepted ADR consequence to an E00 task or records
   `N/A — reason`; no option comparison or new foundational recommendation is
   allowed in E00.
1. Tasks E00-T01..T05 execute the accepted decisions (see the epic folder).
2. Any newly discovered foundational conflict becomes an Open Question and a
   proposed superseding ADR owned by `/tech-plan`; implementation pauses.
3. **Epic 00 exit gate (human)** — feature epics shard ONLY when: the domain
   model is accepted, all referenced ADRs are accepted, conventions/tokens exist,
   CI is green, and the walking skeleton has been SEEN responding.
4. **Walking skeleton**: one request flows
   UI → API → DB → back, deployed (flag-gated ok), CI green, with one real
   test at every layer. Tiny but END-TO-END (Cockburn's definition).
5. Seed Graphiti with Entity/Decision/ThirdPartyService/File nodes; update
   the conventions block in /AGENTS.md.

## Rules
- Genesis decisions change ONLY via a new ADR superseding the old (never
  edit history) through `/tech-plan` + human approval.
- If the human already mandates parts (client stack), record them as ADRs
  marked `imposed` during `/tech-plan` — still written down, still traceable.
