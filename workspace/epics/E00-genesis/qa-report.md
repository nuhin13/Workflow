# QA Report — E00 (Genesis and Walking Skeleton)

- QA agent run: 2026-08-05 · Fresh context: yes
- Inputs: `workspace/spec/srs.md`, `workspace/epics/E00-genesis/{epic.md,conventions.md,tracker.md,tasks/E00-T01..T05}`,
  `workspace/plan/03-technical/decisions/ADR-0001..0009`, `harness/skills/qa-pr-review/SKILL.md`, the repo at
  `kickoff_garazo` (`3b0d850`, epic branch `epic_00` at `08e2225`, same five task commits)
- Explicitly NOT consulted before forming verdicts: implementer completion reports/self-review sections,
  `docs/evidence/*`, `docs/architecture/adr-consequence-audit.md`. I read the task files' contract sections
  (files/API/DoD/ACs) as the binding spec, then verified independently by running the system, and only
  afterward cross-checked implementer claims against what I personally observed.

## Verdict

**PASS**, with two tracked findings (one LOW, one MEDIUM — see §6) and one process caveat that is NOT mine
to waive: peer review never ran on any of the five tasks, and task-level QA is deferred on T02–T05, exactly
as the tracker discloses. This report satisfies the **epic-level QA gate** (constitution rule 3) on technical
merit. It does not retroactively satisfy the missing peer-review or task-level-QA gates for T02–T05 — those
remain open items for the human checkpoint to accept or reject as delivery-process debt, independent of
whether the built artifact works.

Everything I could run, I ran myself: `make verify` (14/14 green), `make rehearse-rebuild` (0 missing inputs,
4 blocked steps — matches the claimed evidence exactly), a live `make up` → migrate → curl round trip, a
manual PostgreSQL outage-and-recovery test, and a manual production-boot-refusal test against the built
Docker image. All matched or exceeded what the task files and tracker claim.

## 1. Runnable flow check (epic §1)

| Step | Expected | Observed | ✓/✗ |
|---|---|---|---|
| Clean-clone build/test | `make verify` green end to end | Ran it myself: 14/14 steps passed, 81 node-test-suite assertions + 25 more in the walking-skeleton/integration suites (both runs I watched), 19 Flutter tests, contract/architecture/drift/secret-scan/Compose-smoke all green | ✓ |
| Start containerized stack | `make up` brings up admin/API/worker/Postgres healthy | Ran it: all four containers reported healthy, ports bound to 127.0.0.1 | ✓ |
| Apply diagnostic migration | Human-gated `make migrate-diagnostic` creates `system_probes` | Ran it against the real local Postgres; table created/idempotent (`NOTICE: relation already exists, skipping` on second run) | ✓ |
| Round trip via generated client path (API layer) | POST returns `{status:"persisted", visitCount>=1, correlationId}`, count increments on repeat | `curl` twice: `visitCount":16` then `"17"` (continuing prior test-run state, which itself proves cross-session persistence) | ✓ |
| Invalid body | 400 `VALIDATION.INVALID_FIELD` | Sent `{"x":1}` → 400, correct code, `fieldErrors:[{"field":"x",...}]` | ✓ |
| Unknown route | 404, same envelope shape as the disabled-flag case | Confirmed byte-identical envelope shape (`SYSTEM.NOT_FOUND`) | ✓ |
| Database outage | 503 `SYSTEM.DATABASE_UNAVAILABLE`, API process survives | Stopped the Postgres container directly (not just the app-level check): got 503 with the correct envelope, **and the API container stayed `Up ... (healthy)` throughout** — this is the exact regression T04 says it found and fixed (unhandled `pg` pool `error` event previously killed the process) | ✓ |
| Recovery | Restarted DB → counter continues, no false success | Restarted Postgres, re-curled: `visitCount":18`, continuing from 17 — proves the value lives in PostgreSQL, not process memory, and that no phantom increment occurred during the outage | ✓ |
| Production boot refusal | `APP_ENV=production` + flag `true` refuses to boot | Ran the actual built `garazo-dev-api` image directly with those env vars: process logged `{"level":"error","message":"invalid configuration","keys":["WALKING_SKELETON_ENABLED"]}` and exited — no value leaked, only the key name | ✓ |
| VM rebuild rehearsal | 0 missing source inputs, 4 blocked steps | Ran `make rehearse-rebuild`: output matches the task's claimed evidence line for line (registry, secret manager, backups, off-host logs — all correctly BLOCKED and named) | ✓ |

Flutter widget-level UI round trip (tap → idle/loading/success/error) was verified only via the automated
Flutter widget test suite (19 tests, all passed in `make verify`), not by physically running the Flutter app
against the live API — no Android emulator/device was available in this environment. This mirrors the
project's own declared limitation (no compiled APK/IPA) and is recorded as **unverified**, not assumed, in §6.

## 2. Acceptance criteria (EARS-E00-1 through 14)

| AC | Method | Result | Evidence |
|---|---|---|---|
| EARS-E00-1 (T01: entry points build) | Ran `make build`/`make verify` | PASS | `test_EARS_E00_1_each_entry_point_builds` green; 6 workspace projects build |
| EARS-E00-1 Android host | Read code + task's own deviation note | **Unverified** (no APK ever compiled) | T01 §15 deviation 1; confirmed no `cmdline-tools`/Xcode present here either |
| EARS-E00-2 (separate API/worker roots) | Ran architecture test + read import graph | PASS | `test_ADR_0002_forbidden_module_import_fails`, `test_EARS_E00_2_api_worker_have_separate_composition_roots` green |
| EARS-E00-3 (contract generates clients, zero drift) | Ran `make contract` twice | PASS | `test_ADR_0008_generated_tree_has_zero_drift` green both runs |
| EARS-E00-4 (uniform redacted error envelope) | curl'd 400/404/503 myself; read `api-error.ts`/`api-error.filter.ts` | PASS | All three envelopes byte-identical in shape; unknown/framework errors collapse to `SYSTEM.INTERNAL_ERROR` with **status-only** propagation, message discarded |
| EARS-E00-5 (route hidden off-flag/production) | Ran `test_EARS_E00_5_probe_is_hidden_when_the_flag_is_off_or_in_production` + read gate order | PASS | Gate checks environment **before** validating body, so a disabled route and a nonexistent one are indistinguishable |
| EARS-E00-6 (prod Compose = admin/API/worker only) | Read `compose.production.yaml`; ran `test_EARS_E00_6_production_compose_has_only_application_services` | PASS | No Postgres/object-store service present; `DATABASE_URL` is `${...:?}` (required, unset by default) |
| EARS-E00-7 (log redaction) | Ran redaction test suite; read `logger.ts` | PASS with a systemic gap noted (§6, finding 2) | `test_EARS_E00_7_*` all green; redaction is substring-key-based on `SENSITIVE_FRAGMENTS`, and `Error` values collapse to `{name}` only |
| EARS-E00-8 (graceful shutdown, volumes preserved) | Ran `make down`; inspected script | PASS | `compose-down.sh` has no `-v`; ran `make up` → `make down` → `make up` and prior data (later probe count) was intact |
| EARS-E00-9 (persistence + atomic increment) | Ran integration/E2E suites against real Postgres; read SQL | PASS | `test_EARS_E00_9_parallel_probe_increments_are_atomic` and `test_EARS_E00_9_concurrent_probes_all_persist` green; single `INSERT ... ON CONFLICT DO UPDATE ... RETURNING` — one round trip, no read-then-write race |
| EARS-E00-10 (DB failure → redacted 503) | Stopped the real Postgres container myself | PASS | 503 `SYSTEM.DATABASE_UNAVAILABLE`, no host/port/driver text in body, API process did not crash |
| EARS-E00-11 (no usable route off-production) | Ran the built API image with prod env + flag true | PASS | Process refuses to boot at all (defense-in-depth beyond the route-level 404) |
| EARS-E00-12 (clean-clone verify) | Ran `make verify` myself, twice (once in the background, once via `verify-clean-clone.sh` output review) | PASS | 14/14 steps, exit 0 both times |
| EARS-E00-13 (prod exposes zero route/page, zero secret in evidence) | Ran production-route-absence suite; read Flutter route gate | PASS | `kReleaseMode`-derived `dart.vm.product` constant tree-shakes the route at compile time — verified in source, not just by test |
| EARS-E00-14 (ADR consequence audit, no silent drop) | Ran `test_EARS_E00_14_adr_audit_has_no_unmapped_consequence`; spot-read `docs/architecture/adr-consequence-audit.md` and epic.md §5 | PASS | 38 implemented, 9 later-mapped-to-a-named-epic, 18 explicit open human decisions; no unmapped row found |

## 3. Test suite

Ran `make verify` (`bash scripts/verify-clean-clone.sh`) directly, in the background, start to finish:

```
[01] pinned toolchain matches           PASS
[02] install (frozen lockfile)          PASS
[03] flutter dependencies                PASS
[04] design tokens: zero drift           PASS
[05] OpenAPI contract + client drift     PASS
[06] eslint                              PASS
[07] flutter analyze                     PASS
[08] formatting                          PASS
[09] build all entry points              PASS
[10] secret scan                         PASS
[11] node test suites                    PASS (81 assertions: 0 fail, 0 skipped)
[12] flutter test suites                 PASS (19 tests)
[13] container images + compose smoke    PASS (all 4 services healthy, non-root, no secret in logs, volume survived)
[14] walking skeleton round trip         PASS (25 assertions across integration/E2E: 0 fail)

verify-clean-clone: all 14 steps passed        EXIT=0
```

Ran `make rehearse-rebuild` directly: output matched the claimed evidence line for line — 0 missing source
inputs, 4 blocked steps (registry, secret manager, backups, off-host logs), all named to `infra/vm/recovery-open-items.md`.

I did not additionally re-run the exact GitHub Actions CI workflow (no CI runner available in this
environment); I ran the identical local commands the tracker says CI wraps. Flagged as unverified-by-me in §6.

## 4. Spec compliance

- **File plan respected?** Spot-checked T04's two commits (`cd77b02`, `31f71b7`) against its §5 file list —
  every changed path is either declared in `files:` or explicitly logged as a deviation with a stated reason
  in §15. No undeclared, undocumented file changes found in the diff I inspected.
- **§4 "What NOT to do" respected?** No product entity, workshop scope, auth/session, admin, queue, provider
  adapter, or feature screen exists anywhere in the diff. `system_probes` carries no workshop/customer/job/money
  column. Confirmed by reading the schema and by grepping for product-domain terms in `packages/server-core/src`
  and `apps/mobile/lib` — none found outside comments explaining what is deliberately absent.
- **Conventions (conventions.md) violations:** none of severity ≥ medium found. One LOW finding on tooling
  robustness (§6, finding 1).

## 5. Traceability

`epic.md` §5 (ADR consequence map) and the ADR audit doc both list all nine ADRs with a disposition per row;
I did not find an ADR consequence with no disposition. No `D-###` filed by this QA pass — I found no
fixable-in-linked-artifacts mismatch and no unfixable one requiring a discrepancy note.

## 6. Findings

| # | Severity | Where | What | Suggested fix |
|---|---|---|---|---|
| 1 | LOW | `scripts/verify-clean-clone.sh:27` (and the same pattern at other `printf '---...'` call sites in the file) | On the platform's own default shell (`/bin/bash` 3.2, Apple's shipped bash — confirmed via `bash --version` and `/usr/bin/env bash --version`, both resolve to 3.2.57 here), every PASS-branch `printf '--- [%02d] PASS: %s\n' ...` call fails with `printf: --: invalid option` because bash 3.2's `printf` builtin misparses a format string that itself starts with `--` as an option string. This fires on **every one of the 14 steps** (confirmed: 14 occurrences in the full log), silently swallowing the intended `--- [NN] PASS: <label>` confirmation line and replacing it with a generic bash error printed to stderr. It does **not** affect the script's exit code (the `if "$@"; then` branch selection happens before the broken `printf` runs, so `FAILED` stays empty and `make verify` still correctly reports 0/exit 0) — I confirmed this by running the full gate to completion twice and observing `all 14 steps passed` both times despite the noise. This is a real, reproducible defect found only by running the script on the exact class of machine (macOS, no Homebrew bash installed ahead of `/bin/bash` on `PATH`) a developer or reviewer would plausibly use, not by reading it. | Quote the leading `-` away, e.g. `printf -- '--- [%02d] PASS: %s\n' ...` (mirroring what the FAIL branch already tries to do, which has the same problem) or reword the label to not start with `--`, or pin CI to a modern bash and document the macOS caveat. |
| 2 | MEDIUM | `packages/runtime-config/src/logger.ts:118-133` (`redactLogFields`) | Redaction is a **substring match on the field KEY name** (`SENSITIVE_FRAGMENTS`), applied recursively — except the special-cased top-level `message` field, which only gets newline-flattened (`redactLogFields`, the `if (key === 'message')` branch), never scanned against `SENSITIVE_FRAGMENTS` or otherwise redacted. Today this is not exploited: every production call site I found (`apps/api/src/main.ts`, `apps/worker/src/main.ts`, `apps/api/src/app.module.ts`) passes raw errors under a **context key** named `error`, and `redactValue` special-cases `instanceof Error` to keep only `{name}` — so no message text escapes today. But the mechanism has a systemic gap that every one of the sixteen later epics inherits: a future call site that does `logger.error(\`db failed: ${err.message}\`)` — interpolating a value directly into the message string instead of passing it as a keyed context field — bypasses redaction entirely, because the message field is exempt from the fragment scan by construction. Given the product's stated central privacy promise (owner-PIN-protected money; NFR-SEC-02) and that PIN/OTP/due/amount values will flow through this exact logger in E01–E03, this is worth closing now rather than after the first incident. | Either (a) scan the flattened `message` string itself against `SENSITIVE_FRAGMENTS`-derived value patterns (harder, since these are field-name fragments not value patterns), or more robustly (b) add an architecture/lint test that fails if any `logger.<level>(...)` call site contains a template-literal interpolation (`${`) in its first argument, forcing all dynamic content through the already-safe keyed-context path. |

Both findings are **notes for the human checkpoint**, not blockers to this epic-level PASS: neither reflects
a currently-exploitable leak or a currently-broken exit-code/verification result — I proved both by running
the code, not by assuming.

**Independence of the four production guards (task's own attack #2):** genuinely four checks, but two of
them share the same underlying inputs. Guard 1 (`loadRuntimeConfig` refusing to boot when
`WALKING_SKELETON_ENABLED=true` and `APP_ENV=production`) and guard 2 (`isWalkingSkeletonEnabled()` checked
per-request) both read the *same* two environment variables — one at boot, one at request time. They are not
independent *sources of truth*, they are a fail-fast duplicate of the same predicate at two lifecycle points.
The genuinely independent guards are 3 (Compose hard-wires the values so the environment itself can never
carry the dangerous combination in production) and 4 (the Flutter route is excluded by a compile-time
constant with no environment dependency at all). This is not a defect — duplicating a check at boot and at
request time is good defense in depth — but "four independent guards" slightly overstates the independence
of guards 1 and 2. Not filed as a numbered finding; noted for accuracy.

**Architecture allowlist (attack #7):** `isAdapterEdge()` in `tests/architecture/module-boundaries.spec.ts`
matches by filename pattern (`/postgres-*.ts$`, `*.check.ts$`, `app.module.ts$`), which read alone looks
permissive — any file could be named to match. But the same test pins the *exact* current adapter file list
via `assert.deepEqual(adapters.sort(), [...])`, so the exemption cannot silently grow: adding a new
provider-importing file anywhere in the guarded tree fails the test until a human updates that literal list.
Verified this by reading the assertion, not just the pattern. Not a defect.

**Known-weaknesses disclosure accuracy (all confirmed independently, not merely trusted):**
- No peer review ran on any E00 task — confirmed: every task file's DoD has `Peer-AI review approved by a
  different model` unchecked with an explicit "NOT DONE" note.
- Task-level QA deferred on T02, T03, T04, T05 — confirmed in each task's own DoD section.
- T04's migration was applied under a standing waiver, not in-thread schema approval — confirmed, T04 §12.
- No APK/IPA ever compiled — confirmed; this environment also lacks Android `cmdline-tools`/Xcode, so I could
  not independently compile one either. Still unverified, as declared.
- Base images tag-pinned (`node:24.4-alpine`), not digest-pinned — confirmed by reading the three Dockerfiles;
  no digest string present in any of them.

All five declared weaknesses are accurately described.

## 7. Lessons proposed

- **L-tooling-001 (candidate):** shell scripts intended to run identically across contributor machines should
  avoid `printf` format strings beginning with `-`/`--` (bash 3.2, still Apple's default `/bin/bash` on macOS,
  misparses them as options) — either always pass `--` before the format, or avoid leading dashes in labels.
  Low severity but cheap to fix once and forget.
- **L-logging-001 (candidate):** the redaction contract should be paired with an architecture test that rejects
  template-literal interpolation directly inside a log-message string (forcing all dynamic values through the
  already-redacted keyed-context path), before E01–E03 start writing PIN/OTP/due-amount-adjacent log calls
  against this logger.
