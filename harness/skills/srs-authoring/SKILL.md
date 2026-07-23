---
name: srs-authoring
description: Run the SRS phase by drafting workspace/spec/srs.md from the approved business and design artifacts, then stop for human approval before traceability or planning. Also use for approved amendments and requirement conflicts.
---
# /srs-authoring — SRS gate (BRD → the law)

The SRS is the single build truth (constitution rule 1). It restates the BRD
in atomic, testable, id-stable form — it never invents scope.

## Pipeline gate

1. Preconditions: business and design phases are approved. Read their Handoff
   blocks and the current artifact versions in `workspace/state.yaml`.
2. Set `phase: srs` and `phases.srs.status: in-progress`.
3. The PM drafts `workspace/spec/srs.md` and
   `workspace/spec/feature-list.md` using the rules below.
4. Run the coverage and atomicity checks, update the traceability declarations,
   then present the SRS version, coverage summary, and open questions.
5. **STOP for the `srs_approval` human gate.** Neither `/trace`,
   `/tech-plan`, `/dev-plan`, `/epic`, nor `/build` may run while
   `artifacts.srs.approved` is unset.
6. On approval, record
   `artifacts.srs: {version: N, approved: <date>, derived_from: {...}}`, set
   `phases.srs.status: done`, set `phase: traceability`, append a history
   event, and commit `spec: approve SRS vN`.
7. Next: `/trace`.

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
- HUMAN approves and state records the approval before any planning command.
