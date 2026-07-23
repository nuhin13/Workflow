---
name: srs-authoring
description: Draft workspace/spec/srs.md from the BRD - atomic testable requirements with stable ids, module structure, NFRs, use cases, amendment protocol. Use for the first act of the project (BRD to SRS), for any SRS amendment, and whenever a requirement is untestable or two requirements conflict.
---
# SRS Authoring (BRD → the law)

The SRS is the single build truth (constitution rule 1). It restates the BRD
in atomic, testable, id-stable form — it never invents scope.

## Structure of workspace/spec/srs.md
1. **Header**: version, date, BRD version it derives from, approval line.
2. **Amendments block** (top of file, newest first): `AMD-<n> · date ·
   what changed · why · approved by`. Amendments are the ONLY way the SRS
   changes after approval.
3. **Modules** mirroring the BRD's module list 1:1. Per module:
   - Functional requirements: `FR-<AREA>-NN` — keep the BRD's ids where they
     exist; never renumber existing ids.
   - Use cases: `UC-<module>.<n>` — actor, trigger, main flow, error flows.
4. **NFRs**: `NFR-<AREA>-NN` — quantified (p95 ms, RPO/RTO, WCAG level…),
   each testable or measurable.
5. **Out of scope**: explicit, from BRD §4.2 — the anti-scope-creep fence.

## Atomicity rules
- One requirement = one verifiable behavior. "and" in a SHALL = split it.
- Every FR carries the M/S/C priority from the BRD (MoSCoW seed).
- Every FR must be EARS-expressible (skills/ears-authoring smell test: can
  you write a failing test from the sentence alone?).
- Ambiguity in the BRD → Open Question to the human, never a guess. Record
  the answer as part of the SRS (or an amendment if already approved).

## Traceability
BRD id → SRS FR/UC id → epic `traces_to` → task `traces_to` → EARS id →
test name → commit. The SRS is the hinge: an FR id that later changes
meaning breaks the whole chain — hence amendments-only.

## Definition of done (before requesting human approval)
- Every BRD in-scope module + requirement is covered; nothing added.
- Ids atomic, unique, stable; priorities carried over.
- NFRs quantified. Glossary terms defined (workspace/spec/glossary.md).
- feature-list.md derived (one line per FR, grouped by module).
- 🧍 HUMAN approves → SRS becomes law; /epic-breakdown may run.
