---
id: E01-T10
epic: E01
type: feature
title: Prove access, isolation, PIN lifecycle, and locale integration
layer: cross-cutting
size: M
status: todo
owner_agent: qa
preferred_agent: any
tier: deep
token_estimate: { tier: M, range: "80k-150k" }
priority: { moscow: should, p: P1 }
depends_on: [E01-T04, E01-T05, E01-T07, E01-T08, E01-T09]
blocks: []
traces_to:
  [
    FR-ACCESS-01,
    FR-ACCESS-02,
    FR-ACCESS-03,
    FR-ACCESS-04,
    FR-ACCESS-05,
    FR-ACCESS-06,
    FR-ACCESS-07,
    FR-ACCESS-08,
    FR-ACCESS-09,
    FR-ACCESS-10,
    FR-ACCESS-11,
    FR-ACCESS-12,
    FR-ACCESS-13,
    FR-ACCESS-14,
    FR-ACCESS-15,
    NFR-SEC-01,
    NFR-SEC-02,
    NFR-SEC-03,
    NFR-I18N-01,
    NFR-I18N-02,
    ADR-0004,
    ADR-0007,
  ]
external_services: [firebase-phone-identity, postgresql]
files:
  create:
    - tests/e2e/access-journey.spec.ts
    - tests/e2e/tenant-isolation-journey.spec.ts
    - tests/e2e/owner-pin-lifecycle-journey.spec.ts
    - tests/e2e/locale-switch-journey.spec.ts
    - apps/mobile/integration_test/access_lifecycle_test.dart
    - apps/mobile/integration_test/locale_switch_test.dart
    - apps/mobile/integration_test/driver.dart
    - scripts/verify-access.sh
    - docs/security/e01-access-evidence.md
  update:
    - Makefile
    - .github/workflows/ci.yml
feature_flags: []
ui_reference: "N/A — verification of SCR-001, the SCR-002 access shell and the SCR-011 language control; no new UI"
started_at:
completed_at:
executed_by:
reviewed_at:
reviewed_by:
review_outcome:
---

# E01-T10 · Prove access, isolation, PIN lifecycle, and locale integration

## 1. Feature goal

Prove that the nine merged slices actually behave as one product: a real owner
gets in, sees only their own workshop, cannot see money without the PIN, and can
switch language without changing a stored value.

## 2. Business logic

Every slice of E01 passed its own tests in isolation. That is exactly the
condition under which integration bugs survive. This task is the epic's
last line before the human checkpoint, and it exists because four classes of
defect are invisible to unit and per-task tests:

| Class | Why per-task tests miss it | Lesson |
|---|---|---|
| Device lifecycle | Backgrounding and route exit only exist on a real device or emulator | `L-process-007` |
| Cross-process wiring | Client, API, database and migrations pass separately and still disagree | `L-auth-001` |
| Concurrency at the seam | A sequential suite proves nothing about parallel attempts | `L-process-003` |
| Tenant isolation | One workshop in a fixture can never leak into another | `NFR-SEC-01` |

This task **writes tests and evidence, not product code**. If a behaviour is
wrong, the fix is a bug task against the owning slice, not a patch here. That
boundary is what keeps the verdict honest.

Two things it must not assume. First, no real Firebase credential exists: every
journey runs on the fake adapters from `T03` and `T07`, and a real provider call
in this suite is a failure, not a nice-to-have (`ADR-0004`, `EARS-E01-3`).
Second, `NFR-ADOPTION-02` is frozen by `Q-006`/`D-001` and must not be measured,
instrumented or asserted anywhere.

## 3. What this task DOES

- Write the end-to-end access journey: assertion → session → setup → correct
  workshop → sign-out.
- Write the two-workshop isolation journey attacking both the application layer
  and PostgreSQL row-level security.
- Write the full owner-PIN lifecycle journey, including the race cases and every
  cooldown boundary.
- Write the locale journey that compares stored values before and after.
- Write the on-device lifecycle tests: background relock, protected-route exit,
  300-second inactivity, restored and signed-out navigation.
- Add one command that runs the whole access gate, and wire it into CI.
- Record the epic's security and privacy evidence in `docs/security/`.

## 4. What this task does NOT do (scope fence)

- Do not implement or repair product behaviour. A failure becomes an `E01-B<MM>`
  bug task against the owning slice, per `skills/bug-triage`.
- Do not edit any file owned by `T01`–`T09`. If a test needs a hook that does not
  exist, that is a bug task, not an edit.
- Do not add a test-only bypass, a backdoor route, or a flag that weakens a
  guard so a test can pass.
- Do not call the real Firebase service or embed any credential.
- Do not measure, instrument or assert `NFR-ADOPTION-02`.
- Do not test E02–E06 behaviour: jobs, money records, reminders, plans, admin,
  offline. There is nothing to test yet.
- Do not add a new test framework. Use what E00 established.
- Do not relax an existing E00 gate to make a new suite fit.

## 5. Files & changes

### Add

- `tests/e2e/access-journey.spec.ts` — the happy path and every failure branch.
- `tests/e2e/tenant-isolation-journey.spec.ts` — two accounts, two workshops,
  zero foreign records at both layers.
- `tests/e2e/owner-pin-lifecycle-journey.spec.ts` — set, verify, fail, cool
  down, recover, reset; including the parallel-attempt races.
- `tests/e2e/locale-switch-journey.spec.ts` — switch and compare stored values.
- `apps/mobile/integration_test/access_lifecycle_test.dart` — device journey:
  onboarding, home, background relock, route exit, inactivity, sign-out.
- `apps/mobile/integration_test/locale_switch_test.dart` — device journey for
  bn/en across the released screens.
- `apps/mobile/integration_test/driver.dart` — the integration-test driver entry
  point. **New directory**; `conventions.md` §8 reserves it for device journeys.
- `scripts/verify-access.sh` — one command running the whole gate, refusing to
  run against production, matching `scripts/`' existing style.
- `docs/security/e01-access-evidence.md` — the isolation, masking, PIN and
  provider-boundary evidence for the checkpoint.

### Update

- `Makefile` — add `make verify-access`. Do not change an existing target.
- `.github/workflows/ci.yml` — run the access gate. Do not remove or weaken an
  E00 step.

### Delete

- None.

> The diff may not exceed this list. QA enforces.

> This task runs alone in the epic's final wave (`tracker.md`), so no other
> task is writing `Makefile` or `ci.yml` at the same time.

## 6. Database changes

No migration. The suites run against a disposable database created by `T02`'s
`0002_access_workshop` migration, applied through the approved command. The
isolation suite must connect **as the application role**, not as an owner or
superuser — RLS is silently bypassed by both, which would turn the strongest
test in the epic into a false pass.

## 7. API changes

No contract change and no new route. The suites exercise `T01`'s ten routes
through the generated clients only. Hand-rolled HTTP calls are forbidden: they
would test a different contract from the one the app uses.

## 8. Functions

```yaml
functions:
  - signature: "seedTwoWorkshops() -> Promise<{ a: SeededWorkshop, b: SeededWorkshop }>"
    params: {}
    returns: "two fully set-up workshops with distinct accounts and sessions"
    purpose: "The fixture NFR-SEC-01 needs; one workshop can never prove isolation"
  - signature: "expectNoForeignRecord(response: unknown, foreign: SeededWorkshop) -> void"
    params: { response: "any API response", foreign: "the other workshop's seeded values" }
    returns: "void; fails if any foreign identifier, name or value appears"
    purpose: "One assertion, so no suite forgets a field"
  - signature: "expectNoProtectedValue(surface: CapturedSurface) -> void"
    params: { surface: "captured response body, widget tree, semantics tree, log buffer or error text" }
    returns: "void; fails on any amount, currency symbol or seeded money token"
    purpose: "NFR-SEC-02 spans five surfaces; check all five the same way"
  - signature: "advanceClock(seconds: number) -> Promise<void>"
    params: { seconds: "simulated elapsed time" }
    returns: "void"
    purpose: "Cooldown and inactivity boundaries must be tested exactly, not by sleeping"
```

## 9. UI changes

None. This task verifies `SCR-001`, the `SCR-002` access shell and the `SCR-011`
language control; it adds no screen and changes no widget.

## 10. External services & feature flags

- **Firebase**: never contacted. The fake adapters from `T03` and `T07` are
  bound for every run, and a network attempt fails the suite.
- **PostgreSQL**: a disposable local database, migrated through the approved
  command and torn down afterwards.
- The Bangladesh delivery, privacy/consent, abuse and cost pilot remains a
  production gate under `ADR-0007`. This task records that it is still open; it
  does not run it and cannot close it.
- No feature flag.

## 11. Challenges / Risks

- **A false-pass isolation suite is worse than none.** Connecting as a
  privileged role, or asserting that policies exist instead of attacking them,
  produces a green suite over a broken guarantee. Watch the attack succeed with
  RLS disabled before trusting it green.
- **Timing tests that sleep are flaky and slow.** 60, 120, 240 and 300 seconds
  of real waiting is unacceptable in CI; drive the clock instead.
- **Device tests are the ones people delete when CI is slow.** Background
  relock cannot be proven any other way (`L-process-007`). Keep them and make
  them fast.
- **Green exit codes can hide broken verification.** `L-process-011`: if the
  output looks strange, chase it before trusting the code. An anomaly in a
  verification tool is a defect in the verification.
- **A new required environment variable breaks every launcher.** `L-process-005`:
  if the gate needs config, update the compose files, `.env.example` and CI in
  the same diff — or, since those files belong to other tasks, raise it as a
  bug task rather than editing them.
- **`L-process-012` (binding).** Never interpolate a value into a log message —
  pass keyed fields. This applies to test helpers and evidence tooling too; a
  fixture PIN printed into a log is still a leak pattern being taught.

## 12. Implementation checklist  (live execution log)

- [ ] all nine slices merged and green before this task starts
- [ ] end-to-end access journey passes with fake adapters and zero network calls
- [ ] two-workshop isolation passes at the application layer
- [ ] two-workshop isolation passes as the application role with RLS enforced
- [ ] the isolation attack was seen SUCCEEDING with the guard removed
- [ ] PIN lifecycle covers 5 invalid entries, then 60, 120 and 240 seconds
- [ ] a cooldown-rejected attempt consumes nothing
- [ ] parallel invalid attempts complete exactly one cycle
- [ ] recovery works during a cooldown and resets escalation
- [ ] invalid recovery changes nothing
- [ ] device: background relock, route exit and 300-second inactivity all lock
- [ ] device: restored session opens home; signed-out state shows nothing
- [ ] locale switch changes every released string and zero stored value
- [ ] no protected value in response, widget tree, semantics tree, cache, log
      or error text
- [ ] `make verify-access` is green from a clean clone
- [ ] CI runs the gate and no E00 step was weakened
- [ ] `docs/security/e01-access-evidence.md` records the evidence and the open
      Firebase production gate

## 13. Test plan

### Automated — cross-process

- `test_FR_ACCESS_03_end_to_end_assertion_to_session_to_setup_to_home`
- `test_FR_ACCESS_04_failed_authentication_reveals_no_workshop_anywhere`
- `test_EARS_E01_1_all_pre_session_failures_are_byte_identical`
- `test_NFR_SEC_01_workshop_a_never_sees_a_record_of_workshop_b` → every access
  route, both layers.
- `test_NFR_SEC_01_rls_blocks_a_raw_query_as_the_application_role`
- `test_FR_ACCESS_05_no_request_can_name_a_workshop` → forged headers, bodies
  and query parameters change nothing.
- `test_EARS_E01_3_no_external_provider_call_occurs_in_any_journey`
- `test_ADR_0007_session_rotation_invalidates_the_previous_token`

### Automated — PIN lifecycle

- `test_FR_ACCESS_11_cooldowns_are_60_then_120_then_240_capped`
- `test_FR_ACCESS_12_attempts_during_cooldown_consume_nothing`
- `test_FR_ACCESS_11_parallel_invalid_attempts_complete_one_cycle`
- `test_FR_ACCESS_13_recovery_succeeds_during_an_active_cooldown`
- `test_FR_ACCESS_14_invalid_and_expired_recovery_change_nothing`
- `test_FR_ACCESS_15_success_and_recovery_both_reset_escalation`
- `test_NFR_SEC_02_no_protected_value_before_a_valid_grant`

### Automated — device (`integration_test/`)

- `test_FR_ACCESS_09_backgrounding_the_app_locks_owner_money`
- `test_FR_ACCESS_08_leaving_a_protected_route_locks_owner_money`
- `test_FR_ACCESS_10_300_seconds_of_inactivity_locks_owner_money`
- `test_FR_ACCESS_07_explicit_lock_hides_everything_immediately`
- `test_FR_ACCESS_03_restored_session_opens_home_after_a_cold_start`
- `test_FR_ACCESS_04_signed_out_state_shows_no_workshop_value`
- `test_NFR_I18N_01_every_released_screen_renders_in_bangla_and_english`
- `test_NFR_I18N_02_locale_switch_changes_no_stored_business_value`

### Manual QA (human runs these at the checkpoint)

1. Install, onboard with a fake identity, reach `/home`.
2. Background the app while unlocked → return; money is locked.
3. Enter five wrong PINs → 60-second cooldown; repeat → 120; repeat → 240.
4. Recover with a valid fake OTP mid-cooldown → set a new PIN; escalation resets.
5. Sign in as a second workshop → nothing from the first is visible.
6. Switch to English and back → all copy switches; the workshop name is
   unchanged.

## 14. Acceptance criteria (EARS)

- **EARS-E01-T10-1** — WHEN the full access journey runs end to end, the system
  SHALL create a session, complete setup, open the authorized workshop, and
  sign out cleanly, with zero external provider calls. (`FR-ACCESS-01`–`05`,
  `EARS-E01-3`)
- **EARS-E01-T10-2** — WHEN two workshops are exercised, every access query
  SHALL return zero records of the other workshop at both the application and
  PostgreSQL policy layers. (`NFR-SEC-01`, `EARS-E01-4`)
- **EARS-E01-T10-3** — WHEN the owner-PIN lifecycle runs, the observed
  behaviour SHALL match `Q-005` exactly: five invalid entries per cycle,
  cooldowns of 60, 120 and 240 seconds capped, recovery permitted during
  cooldown, invalid recovery changing nothing, and success resetting escalation.
  (`FR-ACCESS-11`–`FR-ACCESS-15`)
- **EARS-E01-T10-4** — WHEN the app is backgrounded, a protected route is left,
  explicit lock is selected, or 300 seconds pass without protected-area
  activity, the system SHALL lock owner money on a real device or emulator.
  (`FR-ACCESS-07`–`FR-ACCESS-10`, `NFR-SEC-03`)
- **EARS-E01-T10-5** — WHILE owner money is locked, the API response, mobile
  state, cache, accessibility tree, log output and error text SHALL contain zero
  protected value. (`NFR-SEC-02`, `EARS-E01-6`)
- **EARS-E01-T10-6** — WHEN the locale switches between `bn` and `en`, every
  released E01 string SHALL change and every stored business value SHALL remain
  byte-for-byte equivalent. (`NFR-I18N-01`, `NFR-I18N-02`, `EARS-E01-5`)
- **EARS-E01-T10-7** — WHEN `make verify-access` runs from a clean clone, the
  system SHALL complete the whole gate green with no manual step.

## 15. Self-review (agent fills BEFORE status: review-requested)

- [ ] All checklist items done (with commit hashes)
- [ ] `make verify` and `make verify-access` pass from a clean clone
- [ ] Loading/error/empty states: N/A — no UI added
- [ ] Audit entry on lifecycle writes: N/A — this task writes no product record
- [ ] No secrets/PII logged; no value interpolated into a log message
- [ ] Diff confined to §5 list; §4 respected — no product file was edited

### Deviations from spec

(none)

### Files touched (actual)

- ...

## 16. Definition of Done

- [ ] All §14 criteria pass via tests named by EARS/trace ID
- [ ] UI fidelity: N/A — no UI added
- [ ] Peer-AI review approved by a different model
- [ ] **Task-level QA APPROVE — REQUIRED.** This is the epic's security gate
- [ ] Every failure found is filed as an `E01-B<MM>` bug task, triaged, and
      either fixed or explicitly accepted by the human
- [ ] `docs/security/e01-access-evidence.md` complete, including the still-open
      Firebase Bangladesh production gate
- [ ] Squash-merged to epic branch; tracker + metrics stamped
- [ ] Graphiti episode written or "graph not consulted" noted
- [ ] Human verified at the E01 checkpoint

## 17. Notes for the implementing agent

- Diagram: **N/A — no flow.** This task is a checklist of suites; the flows it
  verifies are drawn in `epic.md` and in `T05`/`T06`.
- Run in a fresh context. Read the specs and the repository, not the
  implementers' reasoning — that is what makes this verdict worth having
  (`skills/qa-pr-review`).
- Start by making each guard fail. An isolation test that has never been seen
  failing is not evidence of isolation.
- Rate limiting on the login endpoint was deliberately excluded from `T03` and
  recorded as a known gap. Confirm it is still recorded in the evidence
  document; do not implement it here.
- The known-gap list for the checkpoint should also carry `Q-007` (recovery
  throttling) from `T05` and the open Firebase pilot from `ADR-0007`.
- `scripts/verify-clean-clone.sh` is the house style for a gate script,
  including its `printf --` fix from `L-process-011`. Follow it.

## 18. Handoff

At `review-requested`, hand to a different-model peer, then to task-level QA.
On merge the epic goes to `/qa E01` and then to the human checkpoint.

## Open Questions

- None for execution. The open `ADR-0007` Bangladesh production pilot,
  `OQ-E01-2` security parameters, `OQ-E01-3` vehicle-type keys and `Q-007`
  recovery throttling are recorded as evidence, not resolved here.

## Feedback log

- (human feedback on this deliverable lands here)

## Run log

- (gate output, isolation evidence, device-lifecycle evidence, bug tasks filed)
