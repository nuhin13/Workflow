---
id: E01-T08
epic: E01
type: feature
title: Build the authorized workshop home guard (SCR-002)
layer: frontend
size: S
status: todo
owner_agent: developer-frontend
preferred_agent: any
tier: build
token_estimate: { tier: S, range: "10k-15k" }
priority: { moscow: must, p: P1 }
depends_on: [E01-T06]
blocks: [E01-T10]
traces_to:
  [
    FR-ACCESS-02,
    FR-ACCESS-04,
    FR-ACCESS-05,
    FR-014,
    NFR-SEC-02,
    NFR-SEC-03,
    NFR-I18N-01,
    NFR-A11Y-01,
  ]
external_services: []
files:
  create:
    - apps/mobile/lib/features/home/data/workshop_context_repository.dart
    - apps/mobile/lib/features/home/application/workshop_home_state.dart
    - apps/mobile/lib/features/home/application/workshop_home_controller.dart
    - apps/mobile/lib/features/home/presentation/workshop_home_sections.dart
    - apps/mobile/test/features/home/workshop_home_controller_test.dart
    - apps/mobile/test/features/home/workshop_home_page_test.dart
    - apps/mobile/test/features/home/workshop_home_privacy_test.dart
  update:
    - apps/mobile/lib/features/home/presentation/workshop_home_page.dart
feature_flags: []
ui_reference: "SCR-002 access shell only — workspace/plan/01-design/screens/SCR-002-dashboard.md and prototype/SCR-002-dashboard.html"
started_at:
completed_at:
executed_by:
reviewed_at:
reviewed_by:
review_outcome:
---

# E01-T08 · Build the authorized workshop home guard (SCR-002)

## 1. Feature goal

Open the workshop the server authorized — its identity, its language, an honest
empty operational state, and money that is locked rather than invented.

## 2. Business logic

This is the smallest task in E01 and the easiest to overbuild. `SCR-002` in the
finished product is a dense dashboard of jobs, dues, ROI and customer counts.
**None of that data exists yet.** E02 adds jobs, E03 adds money, E04 adds plans
and reminders. E01 ships the *access shell*: proof that the right workshop
opened, and nothing invented to fill the space (epic §UI screens).

Three rules apply.

**Only the authorized workshop.** `FR-ACCESS-05` is enforced server-side, but
the screen must not undermine it: the workshop shown comes from `T06`'s access
state, which came from the server. The screen never reads an identifier from
anywhere else and never requests one.

**Money is locked, not blank and not zero.** BRD Law 2, `Q-004` and `FR-014`
mask due, bill-due, reminder-ROI and attributed-income values outside an
owner-PIN unlocked context. In E01 there is no amount to mask, so the correct
rendering is `T06`'s `MaskedValue` in its locked state — and the design's
accessibility note is exact: masked money reads **"locked"**, not bullets and
not `0`. A zero would be a fabricated business value.
`conventions.md` §5 is the standard to meet: the protected value must be absent
from the API response, the cache, the widget tree, the accessibility tree, the
logs and the error state. Visual masking alone is not authorization.

**Empty is honest.** Each operational section states that no job, due or
reminder exists yet, using the copy `T06` authored. It does not show a spinner
forever and does not pretend a feature is coming in this build.

## 3. What this task DOES

- Render the `SCR-002` app shell with the authorized workshop's name.
- Render the operational sections in their empty state, with the `SCR-002`
  loading and error behaviour.
- Render every money-bearing slot through `MaskedValue` in the locked state.
- Refresh the workshop context on entry, and sign out on `AUTH.SESSION_INVALID`.

## 4. What this task does NOT do (scope fence)

- Do not edit `app.dart`, `routes.dart`, either `.arb` file, the generated l10n
  output, `pubspec.yaml` or `pubspec.lock`. `T06` owns them. A missing string
  key is a blocking question to the team lead.
- Do not edit anything under `features/access/**`. Consume it.
- Do not add a KPI number, a job row, a due amount, a reminder ROI, an SMS
  credit, a plan badge or a customer count. There is no such record in E01.
- Do not render `0`, `—` or `৳0` in a money slot. Use the locked state.
- Do not build the quick-actions sheet, the notifications sheet, the bottom
  navigation destinations, or any link into `SCR-003`–`SCR-013`. Those screens
  do not exist yet; a dead link is worse than an absent one.
- Do not implement PIN entry or unlock. E03 owns `SCR-010` and the reveal flow.
- Do not add a dependency, a cache or an offline store.
- Do not fetch anything the contract does not expose.

## 5. Files & changes

### Add

- `home/data/workshop_context_repository.dart` — `GET /workshops/current`
  through the generated client, returning a sealed outcome.
- `home/application/workshop_home_state.dart` — immutable state with loading,
  error, needs-setup and ready cases.
- `home/application/workshop_home_controller.dart` — the view model.
- `home/presentation/workshop_home_sections.dart` — the shell sections: header,
  locked money slots, empty operational lists.
- Three test files under `test/features/home/`.

### Update

- `home/presentation/workshop_home_page.dart` — replace `T06`'s placeholder
  with the real screen.

### Delete

- None.

> The diff may not exceed this list. QA enforces.

## 6. Database changes

No DB changes. Nothing is cached on the device.

## 7. API changes

No contract change. One call:

| Method | Path | Success | Failure the screen must handle |
|---|---|---|---|
| GET | `/api/v1/workshops/current` | `WorkshopSummary` → ready | 409 `WORKSHOP.NOT_SET_UP` → route to `/access`; 401 `AUTH.SESSION_INVALID` → sign out; transport failure → retry state |

No pagination — the endpoint is provably non-list. The screen sends no
parameters at all, because the contract has none.

## 8. Functions

```yaml
functions:
  - signature: "WorkshopContextRepository.load() -> Future<WorkshopContextOutcome>"
    params: {}
    returns: "sealed outcome: summary, needs-setup, signed-out, or failure"
    purpose: "The only read this screen performs"
  - signature: "WorkshopHomeController.load() -> Future<void>"
    params: {}
    returns: "void; emits loading then ready, needsSetup, signedOut or failure"
    purpose: "Refresh the authorized context on entry"
  - signature: "WorkshopHomeController.retry() -> Future<void>"
    params: {}
    returns: "void; re-runs load() unless one is already in flight"
    purpose: "The SCR-002 error state offers retry per card"
  - signature: "buildLockedMoneySlot(BuildContext context, String labelKey) -> Widget"
    params: { labelKey: "localization key for the slot's label" }
    returns: "the labelled slot wrapping T06's MaskedValue"
    purpose: "One helper, so no section can hand a money slot a real value"
```

## 9. UI changes

- **Design source:** `workspace/plan/01-design/screens/SCR-002-dashboard.md`
  and `prototype/SCR-002-dashboard.html`, **access portions only**.
- Surface: owner app, Android-first, 412×892 work frame.
- Components reused: `app-shell`, `content-card`, `money-summary` in its
  `locked` state, `status-badge`, `feedback`.
- States required:
  - **loading** — keep the shell and show card skeletons (`SCR-002` states);
  - **error** — the affected card offers retry, and private money never appears
    in error text;
  - **empty** — each list explains that no urgent job or due exists;
  - **data** — the workshop name and the shell chrome render.
- Edge cases from the screen spec: truncate a long shop label; a non-owner sees
  masked money — in E01 everyone sees masked money, which is the same code path.
- Accessibility (`NFR-A11Y-01`): KPI labels carry their meaning; masked money
  reads "locked"; headings are ordered; contrast meets WCAG AA.
- Navigation: reached only through `T06`'s access gate. Sections are inert in
  E01; they become links in E02–E04.

## 10. External services & feature flags

None.

## 11. Challenges / Risks

- **Filling the empty space is the failure mode.** A placeholder "৳0 due" or a
  sample job row would be a fabricated business value on the product's home
  screen. Empty states, locked money, nothing invented.
- **Stale workshop data after sign-out.** If the controller's state outlives the
  access state, the previous workshop's name can flash on the next sign-in.
  Rebuild from `T06`'s state, and prove it with a test (`FR-ACCESS-04`).
- **A dead link is worse than no link.** Wiring bottom navigation to
  unimplemented routes produces a crash or a blank screen at the checkpoint
  demo.
- **The accessibility tree is a leak path.** A semantics label that interpolates
  a value defeats the masking; assert on the semantics tree, not just the
  render tree (`NFR-SEC-02`).
- **`L-process-012` (binding).** Never interpolate a value into a log message —
  pass keyed fields. The workshop name and any amount must not be logged at all.

## 12. Implementation checklist  (live execution log)

- [ ] tests written FIRST and failing for `FR-ACCESS-02`, `FR-ACCESS-05`,
      `FR-014`
- [ ] the workshop name comes from the access state, never from a parameter
- [ ] every money slot renders `MaskedValue` in its locked state
- [ ] no digit, currency symbol or zero appears in any money slot
- [ ] the semantics tree contains "locked", not bullets and not a value
- [ ] loading, error, empty and data states all present
- [ ] 409 routes to `/access`; 401 signs out; transport failure offers retry
- [ ] no link points at an unimplemented screen
- [ ] every string comes from `AppLocalizations`; no literal copy
- [ ] no inline hex or magic spacing; tokens only
- [ ] WCAG AA contrast and heading order verified

## 13. Test plan

### Automated

- `test_FR_ACCESS_02_home_opens_with_the_authorized_workshop_name`
- `test_FR_ACCESS_05_home_renders_only_the_session_workshop` → a second
  workshop's name never appears, and no request carries an identifier.
- `test_FR_ACCESS_04_signing_out_clears_the_previous_workshop_from_home`
- `test_FR_014_every_money_slot_renders_locked` → the render tree contains no
  digit and no currency symbol in a money slot.
- `test_NFR_SEC_02_semantics_tree_exposes_no_protected_value` → the semantics
  tree contains the localized "locked" label only.
- `test_NFR_SEC_03_locked_is_the_default_with_no_grant_present`
- `test_FR_ACCESS_02_not_set_up_routes_back_to_access`
- `test_FR_ACCESS_04_session_invalid_signs_out`
- `test_FR_ACCESS_02_transport_failure_shows_retry_and_no_money_text`
- `test_NFR_I18N_01_home_shell_renders_in_bangla_and_english`
- `test_NFR_A11Y_01_headings_and_labels_are_named_and_ordered`

### Manual QA

1. Complete setup → `/home` shows the workshop name and empty sections.
2. Every money slot reads "locked" with a screen reader.
3. Stop the API → the affected card offers retry; no money text appears.
4. Sign out and sign in as a second workshop → nothing from the first remains.

## 14. Acceptance criteria (EARS)

- **EARS-E01-T08-1** — WHEN initial setup is saved, the system SHALL open
  `SCR-002` showing the server-authorized workshop identity. (`FR-ACCESS-02`)
- **EARS-E01-T08-2** — WHILE a session is authenticated for one workshop, the
  system SHALL display content for that workshop only and SHALL send no
  workshop identifier. (`FR-ACCESS-05`)
- **EARS-E01-T08-3** — WHILE owner money is locked, the system SHALL render
  every money-bearing slot as a non-value locked state and SHALL expose no
  amount in the widget tree, the accessibility tree, the cache, the logs or any
  error text. (`FR-014`, `NFR-SEC-02`, `NFR-SEC-03`)
- **EARS-E01-T08-4** — IF the session becomes invalid, THEN the system SHALL
  sign out and SHALL leave no workshop value on screen. (`FR-ACCESS-04`)
- **EARS-E01-T08-5** — WHERE an operational section has no record, the system
  SHALL state that plainly rather than displaying a placeholder value.

## 15. Self-review (agent fills BEFORE status: review-requested)

- [ ] All checklist items done (with commit hashes)
- [ ] `make test && make lint` pass
- [ ] Loading, error, empty and data states present
- [ ] i18n complete — every key used exists in both ARB files (T06 authored them)
- [ ] No secrets/PII logged; no value interpolated into a log message
- [ ] Diff confined to §5 list; §4 respected

### Deviations from spec

(none)

### Files touched (actual)

- ...

## 16. Definition of Done

- [ ] All §14 criteria pass via tests named by EARS/trace ID
- [ ] **UI fidelity** — shell chrome, card structure, typography, iconography
      and copy match the access portions of `SCR-002`; tokens only; every
      deliberate omission of a later-epic section listed in §15
- [ ] Peer-AI review approved by a different model
- [ ] Task-level QA APPROVE — **required**: this screen carries the money-privacy
      boundary (`FR-014`, `NFR-SEC-02`)
- [ ] Squash-merged to epic branch; tracker + metrics stamped
- [ ] Graphiti episode written or "graph not consulted" noted
- [ ] Human verified at E01 checkpoint

## 17. Notes for the implementing agent

- Diagram: **N/A — no flow.** `T06` owns the access state machine; this screen
  renders one of its states.
- The prototype shows a full dashboard. You are building the shell of it. When
  in doubt about a section, ask "does a record for this exist in E01?" — if not,
  it is an empty state or it is absent.
- `MaskedValue` from `T06` takes a semantics label and no value. If you find
  yourself wanting to pass it an amount, that is E03's task, not a missing
  parameter.
- Follow E00's `SystemProbeViewModel` pattern for re-entrancy: refuse a second
  `load()` while one is in flight.

## 18. Handoff

At `review-requested`, hand to a different-model peer, then to task-level QA.
`T10` runs the two-workshop journey against this screen.

## Open Questions

- None. Everything this screen may display exists in `T01`'s contract; anything
  it may not display belongs to a later epic.

## Feedback log

- (human feedback on this deliverable lands here)

## Run log

- (screenshots against SCR-002, masking evidence, session refs)
