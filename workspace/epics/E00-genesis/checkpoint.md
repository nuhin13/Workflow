# Checkpoint — E00 Genesis and Walking Skeleton

- Date: 2026-08-06 · Human reviewer: project owner (nuhin13)
- QA verdict at checkpoint: PASS-WITH-NOTES (`workspace/epics/E00-genesis/qa-report.md`)

> **How this checkpoint was decided.** The project owner gave a standing
> autonomous-run instruction on 2026-08-05 ("execute step by step, don't wait
> for me for any approval, after complete E01 execute E02, then E03 ...") that
> explicitly covers the epic gates for this run. This record therefore documents
> the approval rather than requesting it. Release to `main` and real credentials
> stay owner-held and are NOT covered.

## 1. Demo

```bash
make verify          # 14-step clean-clone proof: toolchain -> UI -> API -> PostgreSQL round trip
make rehearse-rebuild # VM rebuild rehearsal: 0 missing inputs, 4 steps blocked on unmade decisions
make up              # live stack; then curl the diagnostic route and restart the DB container
```

## 2. What shipped

- A runnable walking skeleton: Flutter owner app -> NestJS API -> real PostgreSQL and back, in containers (FT-000 infrastructure enabler).
- One canonical OpenAPI contract with pinned generator 7.24.0 and generated Dart + TypeScript clients behind a zero-drift gate.
- The authorization boundary every later epic builds on: `AuthenticatedActor`, `WorkshopScope`, `OwnerMoneyGrant`, `AdminScope`, plus one redacted error envelope.
- A security baseline: non-root images, fail-closed configuration, key-based *and* value-shape log redaction, four production guards on the diagnostic route.
- One command (`scripts/verify-clean-clone.sh`) that proves all of it, run identically by CI.

## 3. QA summary

Independent QA swept E00 in a fresh context and returned **PASS**, reproducing claims rather than reading them (stopped the live PostgreSQL container to confirm the API survived and returned a redacted 503; restarted it to confirm the counter continued; booted the production image with the diagnostic flag forced on to confirm it refuses to start).

Both findings are already fixed on the trunk in `e89cba8`:

| # | Sev | Finding | Status |
|---|---|---|---|
| 1 | LOW | `scripts/verify-clean-clone.sh` used `printf` with a format string starting with `-`, which bash 3.2 parses as an option; every PASS line failed while the exit code stayed green | Fixed · lesson L-process-011 |
| 2 | MEDIUM | Log redaction was key-based and never scanned the message field, so an interpolated secret had no key to match | Fixed · lesson L-process-012, binding on E01 specs |

Accepted precision note: the "four independent production guards" wording in `docs/security/baseline.md` overstates independence (guards 1 and 2 both read `APP_ENV` and `WALKING_SKELETON_ENABLED`). Not a defect; wording to be corrected opportunistically.

## 4. Process debt accepted (not waived by QA — accepted here)

| Item | Decision |
|---|---|
| Peer review (constitution rule 12) never ran on any E00 task | **Accepted as debt.** The owner directed Claude-only execution, which removes the different-model reviewer. Epic-level independent QA in a fresh context stands in its place for this project. |
| Task-level QA deferred on E00-T02..T05 | **Accepted.** The epic-level QA sweep covered the same surface and reproduced it live. This clears the standing "BLOCKER FOR E01" entries in state history. |
| T04 migration applied under the standing waiver, not an in-thread schema approval | **Accepted.** The autonomous-run authorization pre-approves `db_schema_migration` for this run. |
| No APK or IPA ever compiled (no Android cmdline-tools, no Xcode on this machine) | **Accepted as a known gap.** Flutter tests and web/desktop build pass. Device packaging is deferred until a machine with the toolchains exists; it must not be claimed as proven before then. |
| 12 unresolved production decisions (`infra/vm/recovery-open-items.md`) and 18 unresolved human decisions from the ADR consequence audit | **Deferred, still owner-held.** None block E01–E03 application work. They block production release only. |

## 5. Remap proposal

| Epic | Proposed change | Reason |
|---|---|---|
| — | no change | E00 landed the contract, schema, container and auth-boundary shape the dev plan assumed. Nothing learned in E00 changes the E01–E15 ordering. |

## 6. Open questions for the human

| ID | Question | Options + recommendation |
|---|---|---|
| Q-006 | Frozen deferral on NFR-ADOPTION-02 ("requiring support" definition) | Unchanged, tracked by D-001. Does not block E01. |
| — | Device packaging (APK/IPA) toolchain | Needs a machine with Android cmdline-tools / Xcode. Recommend resolving before the pilot, not before E01. |

## 7. Decision

- [x] **Approved — next epic starts.** E00 is `done`; E01 specification and build proceed under the standing autonomous-run authorization.
