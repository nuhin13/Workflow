# /epic-breakdown  (agent: pm)

PRECONDITION — the Epic 00 exit gate must be GREEN (domain model accepted,
ADRs accepted, walking skeleton deployed). Feature epics are built against
locked decisions, never against assumptions. If E00 isn't done, stop.

1. Read the LOCKED foundation: docs/domain/* (entities, flows, risks,
   constraints) + the accepted ADRs. These bound every epic.
2. Apply skills/epic-breakdown → draft feature epics from the SRS modules
   (E00 already exists). Each maps ~1:1 to a module; honor v2.1 amendments
   (no Module 2 / Admin, no Module 7, no Google OAuth).
3. Score every epic (skills/priority-scheduling: WSJF + MoSCoW + depends_on)
   and mark the wedge ★.
4. Coverage check: every functional SRS id lands in exactly one epic. Fix
   orphans. Confirm the dependency graph is acyclic.
5. **Recommend the first WAVE** — the PM proposes which epics to build now,
   based purely on the dependency graph (what's unblocked once E00 is done)
   and the wedge, with a one-line rationale per epic and an explicit "defer
   for now" list. Do NOT pick a fixed number; let the graph decide (often
   3–6). Tighter waves = faster feedback.
6. Write epics/README.md map table + the proposed wave. 🧍 HUMAN GATE:
   approve the map, the scores, AND the first wave before any sharding.
7. Seed Graphiti: Epic nodes + DEPENDS_ON edges.
