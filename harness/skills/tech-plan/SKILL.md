---
name: tech-plan
description: Run Phase 3 via the architect agent — technical plan with real multi-option pros/cons, Mermaid diagrams, forecast-cited sizing, recommendation per decision area, and ADRs for accepted decisions.
---

# /tech-plan — technical planning

1. Preconditions: Phase 0 artifacts + design + verified matrix. Read all Handoff blocks.
2. Delegate to the **architect** agent: produce `workspace/plan/03-technical/tech-plan.md` from
   `harness/templates/plan/tech-plan.md` (decision areas, 2–3 real options each with honest cons and
   exit costs, FC-### citations for all sizing, Mermaid diagrams, recommendation each).
   Produce the domain model and lifecycle analysis under
   `workspace/plan/03-technical/domain/`; foundational options must be grounded
   in that model, the SRS, and NFRs.
3. Present decisions to the human ONE AREA AT A TIME: options table + diagram +
   recommendation; capture accept/override. Overrides are recorded with the human's
   reasoning — never silently swapped.
4. Each accepted product decision →
   `workspace/plan/03-technical/decisions/ADR-NNNN-<slug>.md` from
   `harness/templates/plan/adr.md`, starting at ADR-0001. Harness decisions
   use `HADR-*` elsewhere and never share this sequence.
5. When all areas are decided: mark plan `decided`, complete §4 (target architecture) and
   §5 (conventions feed for Epic 00), Handoff, `phase: dev-plan`, commit
   `tech-plan: decided (ADR-001..NNN)`.
6. Mid-project re-entry (forecast change, failed assumption): architect reviews affected
   ADRs, supersedes as needed, and `/dev-plan` remaps affected epics.
7. Next: `/dev-plan`.
