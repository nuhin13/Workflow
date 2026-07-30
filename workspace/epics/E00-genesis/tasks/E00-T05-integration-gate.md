---
id: E00-T05
epic: E00
type: genesis
title: Prove integration and recovery gate
layer: infra
size: M
status: todo
owner_agent: devops
preferred_agent: any
tier: deep
token_estimate: { tier: M, range: "50k-90k" }
priority: { moscow: should, p: P2 }
depends_on: [E00-T04]
blocks: []
traces_to: [NFR-REL-01, NFR-SEC-01, NFR-A11Y-01, NFR-INDEPENDENCE-01, ADR-0001, ADR-0002, ADR-0004, ADR-0005, ADR-0006, ADR-0007, ADR-0008, ADR-0009]
external_services: []
files:
  create:
    - docs/architecture/system-map.md
    - docs/architecture/adr-consequence-audit.md
    - docs/operations/local-development.md
    - docs/security/baseline.md
    - scripts/verify-clean-clone.sh
    - scripts/rehearse-vm-rebuild.sh
    - tests/e2e/clean-clone-verify.spec.ts
    - tests/e2e/production-route-absence.spec.ts
    - docs/evidence/walking-skeleton.md
    - docs/evidence/vm-recovery-rehearsal.md
  update:
    - .github/workflows/ci.yml
    - Makefile
    - README.md
    - infra/vm/deploy-runbook.md
    - infra/vm/rebuild-runbook.md
    - infra/vm/rollback-runbook.md
feature_flags: []
ui_reference: "N/A — integration verification; diagnostic UI is not a product screen"
started_at:
completed_at:
executed_by:
reviewed_at:
reviewed_by:
review_outcome:
---
# E00-T05 · Prove integration and recovery gate

## 1. Feature goal

Turn the E00 components into one repeatable clean-clone proof and produce the
evidence a human and independent QA need to approve feature work.

## 2. Business logic

This is E00's integration task. It does not add behavior; it proves the
accepted architecture and records where later human gates remain. All nine
ADRs must be implemented or explicitly mapped without silently dropping a
consequence (`L-auth-002`).

The human must see the real diagnostic round trip. CI alone is not the
checkpoint. Production remains unconfigured and no provider is contacted.
`Q-006` / `D-001` / `NFR-ADOPTION-02` remains absent.

## 3. What this task DOES

- Add a clean-clone verification script/test and make CI execute it.
- Verify all Makefile commands, generated clients, architecture tests,
  container images, Compose health, migration gate, PostgreSQL round trip,
  Flutter UI states, and production diagnostic-route absence.
- Rehearse a supplier-neutral non-production VM rebuild/rollback using only
  source and declared off-host material, without provisioning.
- Produce system/DFD/ADR-consequence/security/local-development documents and
  checkpoint evidence.
- Prepare the exact independent `/qa E00` and human demo handoff.

## 4. What this task does NOT do (scope fence)

- Do not implement or refactor product feature, auth, session, PIN, admin,
  queue, provider, business schema, analytics, or production deployment code.
- Do not add a dependency, migration, environment key, API field/route,
  production secret/configuration, supplier, region, TLS mechanism, RPO/RTO,
  backup target, or monitoring vendor.
- Do not mutate production or delete local/remote data during rehearsal.
- Do not edit AGENTS.md or harness files. The AGENTS conventions summary is a
  separate protected-file action after the E00 human exit gate.
- Do not advance state, merge, or mark E00 verified; orchestrator/QA/human own
  those actions.

## 5. Files & changes

### Add

- Architecture, ADR consequence, local operator, and security baseline docs.
- Safe clean-clone and non-provisioning rebuild-rehearsal scripts.
- Clean-clone/production-route E2E tests.
- E00 evidence records for the human checkpoint.

### Update

- `.github/workflows/ci.yml` — run the final deterministic verification path.
- `Makefile` — wire final `verify` target only.
- `README.md` — link the local-development and E00 evidence paths.
- VM deploy/rebuild/rollback runbooks — replace draft checks with exercised
  non-production evidence and preserve unresolved human contracts.

### Delete

- None.

> The diff may not exceed this list. QA enforces.

## 6. Database changes

No DB changes and no new migration.

The test may apply T04's already approved diagnostic migration to a disposable
development database and roll it back. It must refuse a non-development
database and never use a production connection.

## 7. API changes

No API changes.

Verification covers:

- `GET /api/v1/system/live` → 200 contract.
- `GET /api/v1/system/ready` → 200 or redacted 503 contract.
- `POST /api/v1/system/walking-skeleton` → non-production gated T02/T04
  contract.
- Production/disabled diagnostic route → standard 404.

Pagination/idempotency: N/A; no new endpoint.

## 8. Functions

```yaml
functions:
  - signature: "verifyCleanClone() -> exit code"
    params: {}
    returns: "0 only when install, lint, tests, builds, contract drift, secret scan, dependency audit, images, Compose smoke and E2E pass"
    purpose: "One reproducible E00 quality command"
  - signature: "rehearseVmRebuild(mode: 'dry-run' | 'non-production') -> exit code"
    params: { mode: "safe mode; production is not accepted" }
    returns: "0 only when required source/off-host inputs and ordered rebuild/rollback steps are verified"
    purpose: "Prove the single VM is rebuildable without host-local authoritative data"
  - signature: "auditAdrConsequences() -> AdrAuditResult"
    params: {}
    returns: "one implemented/later-mapped/N-A row for every accepted ADR consequence"
    purpose: "Prevent accepted sub-decisions being silently dropped"
  - signature: "recordWalkingSkeletonEvidence(result: VerificationResult) -> EvidenceDocument"
    params: { result: "sanitized commands, versions, response and test outcomes" }
    returns: "checkpoint evidence with no secret/config value"
    purpose: "Make the human-observed round trip reproducible"
```

## 9. UI changes

No UI implementation change.

Manual verification confirms T04's diagnostic page has idle/loading/error/
success states, accessible name/focus/live feedback, generated-token styling,
and no route in production. UI fidelity to `SCR-###` is N/A because it is not
a product screen.

## 10. External services & feature flags

- None contacted. PostgreSQL is a disposable development/test service.
- Existing `system.walkingSkeleton` flag is verified; no new flag.

## 11. Challenges / Risks

- A “clean-clone” test can accidentally rely on global SDKs/cache; record
  pinned versions and isolate caches where practical.
- Rebuild rehearsal can become destructive; it must target a validated
  disposable environment or dry-run only.
- Evidence can leak environment/connection values; sanitize before writing.
- ADR audits often mark vague “later”; name the exact epic/task gate or human
  contract.
- Do not self-approve: peer review, independent epic QA, and human observation
  remain distinct.

## 12. Implementation checklist  (live execution log)

- [ ] tests written FIRST and failing for EARS-E00-12/13/14
- [ ] final `make verify` works from a clean clone with approved dependencies
- [ ] generated-client and module-boundary drift checks are green
- [ ] admin/API/worker images build non-root and Compose health is green
- [ ] diagnostic migration apply/rollback and database failure path are proven
- [ ] human-ready Flutter round-trip evidence contains no secret
- [ ] production route/page absence is proven
- [ ] VM dry-run/non-production rebuild and rollback rehearsal is recorded
- [ ] every ADR consequence is implemented, exactly later-mapped, or justified N/A
- [ ] security/config/observability/third-party inventory reviewed
- [ ] independent `/qa E00` prompt/handoff is ready; no self-approval

## 13. Test plan

### Automated

- `test_EARS_E00_12_clean_clone_verify_is_green` → pinned install through E2E
  passes in a fresh workspace.
- `test_EARS_E00_12_compose_round_trip_survives_api_restart` → count persists
  across API container restart.
- `test_EARS_E00_13_production_route_and_page_are_absent` → API 404 and no
  Flutter navigation/compiled registration under production build.
- `test_EARS_E00_13_sensitive_fixture_absent_from_logs_errors_evidence` →
  seeded secret/PII/protected categories appear zero times.
- `test_EARS_E00_14_adr_audit_has_no_unmapped_consequence` → accepted ADR
  index and audit have complete coverage.
- `test_ADR_0006_production_compose_excludes_data_services` → PostgreSQL and
  object storage remain external.

### Manual QA

1. From a fresh clone, run documented setup and `make verify` → green.
2. Start development stack, apply approved diagnostic migration, open Flutter
   diagnostic, tap action → persisted result appears.
3. Restart API and repeat → retained count continues.
4. Stop database → redacted error; restart → readiness and success recover.
5. Inspect production build/config → diagnostic UI/route unusable.
6. Follow VM rebuild/rollback rehearsal in dry-run/non-production and confirm
   no authoritative data/config exists only on the VM.
7. Hand artifacts to a fresh independent QA agent, then human observes the
   same round trip.

## 14. Acceptance criteria (EARS)

- EARS-E00-12: WHEN a fresh environment follows the documented commands, the
  system SHALL build and verify all accepted entry points, contracts,
  containers, tests, and one real UI-to-PostgreSQL round trip.
- EARS-E00-13: WHILE production mode is selected, the system SHALL expose zero
  diagnostic route/page and SHALL retain zero secret or protected fixture in
  logs, errors, or evidence.
- EARS-E00-14: WHEN the ADR consequence audit runs, every accepted ADR
  consequence SHALL be evidenced in E00 or linked to a named later gated
  epic/contract with no silent omission.

## 15. Self-review (agent fills BEFORE status: review-requested)

- [ ] All checklist items done (with commit hashes)
- [ ] `make test && make lint` and `make verify` pass
- [ ] Loading/error/empty/data states verified for diagnostic
- [ ] Audit entry on lifecycle writes: N/A — no product lifecycle write
- [ ] No secrets/PII logged or written to evidence
- [ ] Diff confined to §5 list; §4 respected

### Deviations from spec

(none)

### Files touched (actual)

- ...

## 16. Definition of Done

- [ ] All §14 criteria pass via tests named by EARS/trace ID
- [ ] UI fidelity: N/A — diagnostic only; accessibility/token checks pass
- [ ] Peer-AI review approved by a different model
- [ ] Task-level QA APPROVE — security/migration/runtime integration
- [ ] Squash-merged to epic branch; tracker + metrics stamped
- [ ] Graphiti episode written with Entity/Decision/ThirdPartyService/File
      nodes, or “Graphiti unavailable/not consulted” recorded
- [ ] Independent epic `/qa E00` approves
- [ ] Human sees the response and verifies E00 at checkpoint

## 17. Notes for the implementing agent

- This task prepares evidence; it cannot approve itself.
- Exact production supplier/region/networking/TLS/secrets/backup/RPO/RTO/
  availability/sizing remain later human contracts and must stay explicit in
  the audit.
- AGENTS.md remains unchanged until separate protected-file approval after
  the E00 exit gate.

## 18. Handoff

At `review-requested`, hand to a different-model peer with `make verify`
output. After peer approval, hand the entire E00 diff, approved SRS, and repo
to a fresh independent QA agent. Do not include implementation chat memory.

## Open Questions

- None. The unresolved production contracts are deliberately later
  human-gated and do not block the local E00 proof.

## Feedback log

- (human feedback on this deliverable lands here)

## Run log

- (clean-clone ref, image digests, sanitized evidence, reviewer and QA refs)
