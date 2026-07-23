# workspace/spec/ — the canonical build specification

Empty on purpose. `/srs-authoring` generates it after the business and design
artifacts are approved and before traceability or planning.

| File (to be created) | Source | Who |
|---|---|---|
| `srs.md` | `workspace/docs/business/BRD.md` (the business truth) | PM agent drafts per `harness/skills/srs-authoring` → HUMAN approves |
| `feature-list.md` | derived from srs.md modules | PM agent |
| `glossary.md` | BRD terms + domain language | PM agent |

Rules:
- Once approved, `workspace/spec/srs.md` is **law** (constitution rule 1). Amendments go
  at the top of the file, dated, human-approved.
- Every SRS item keeps the BRD requirement id (`FR-AUTH-01` …) for traceability:
  BRD → SRS → epic → task → EARS criterion → test → commit.
- The Figma design (`workspace/docs/design/README.md`) is the visual canon; the SRS
  references screens, it does not restate them.

After the SRS is approved, run `/trace`, then `/tech-plan`, then `/dev-plan`.
`/epic-breakdown` may only consume the approved SRS; see
`harness/workflows/epic-breakdown.md`.
