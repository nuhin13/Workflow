---
id: E01-T09
epic: E01
type: feature
title: Build Bangla/English presentation switching (SCR-011)
layer: frontend
size: M
status: todo
owner_agent: developer-frontend
preferred_agent: any
tier: build
token_estimate: { tier: M, range: "50k-90k" }
priority: { moscow: must, p: P1 }
depends_on: [E01-T06]
blocks: [E01-T10]
traces_to:
  [
    FR-ACCESS-06,
    NFR-I18N-01,
    NFR-I18N-02,
    NFR-I18N-03,
    NFR-A11Y-01,
  ]
external_services: []
files:
  create:
    - apps/mobile/lib/features/settings_language/data/locale_preference_repository.dart
    - apps/mobile/lib/features/settings_language/application/locale_state.dart
    - apps/mobile/lib/features/settings_language/application/locale_controller.dart
    - apps/mobile/test/features/settings_language/locale_controller_test.dart
    - apps/mobile/test/features/settings_language/language_settings_page_test.dart
    - apps/mobile/test/features/settings_language/locale_inventory_test.dart
  update:
    - apps/mobile/lib/features/settings_language/presentation/language_settings_page.dart
feature_flags: []
ui_reference: "SCR-011 language control only — workspace/plan/01-design/screens/SCR-011-settings.md and prototype/SCR-011-settings.html"
started_at:
completed_at:
executed_by:
reviewed_at:
reviewed_by:
review_outcome:
---

# E01-T09 · Build Bangla/English presentation switching (SCR-011)

## 1. Feature goal

Let the owner switch the whole app between Bangla and English, and prove that
switching changes what is displayed and nothing that is stored.

## 2. Business logic

Garazo is a Bangladesh product and Bangla is the first-class language
(`NFR-I18N-01`). `FR-ACCESS-06` requires the owner to select Bangla or English
and have it applied to supported interface content.

Two invariants make this more than a dropdown.

**Language is presentation, never data.** `NFR-I18N-02` requires that switching
changes **zero** stored business value. The preference is persisted through
`PATCH /api/v1/access/preferences/locale` and lives on the workshop record as a
presentation attribute. Nothing else is written. A test compares stored values
before and after.

**Bangladesh formatting comes from the region profile.** `NFR-I18N-03` requires
BD-specific presentation to be supplied by the region profile, not from
unrelated domain-record fields. `T04` assigns `regionProfile: BD` server-side.
This screen reads it; it never lets the owner set it and never derives
formatting from a data field.

The switch must reach the **whole** app, not just this screen. `T06` binds
`MaterialApp.locale` to the access state, so this screen's job ends at:
persist the preference, hand it to `AccessController.applyLocale()`, and let the
app re-render.

E01 owns only the **language control** of `SCR-011`. The plan card, the numeral
toggle, PIN management, SMS credit, module teasers and backup status all belong
to E04's full Settings screen.

## 3. What this task DOES

- Render the `SCR-011` language control with its four required states.
- Persist the selection through the contract and apply it app-wide.
- Keep the previous language when the change fails (`SCR-011` error state).
- Prove the released E01 string inventory is complete in both languages.

## 4. What this task does NOT do (scope fence)

- Do not edit `app.dart`, `routes.dart`, either `.arb` file, the generated l10n
  output, `pubspec.yaml` or `pubspec.lock`. `T06` owns them. A missing string
  key is a blocking question to the team lead, not a local edit.
- Do not edit anything under `features/access/**`. Consume it.
- Do not build the rest of `SCR-011`: the plan card, the numerals toggle, PIN
  management, SMS credit, module teaser cards and backup status are E04.
- Do not add a third locale, a device-locale auto-detect, or a per-screen
  language override.
- Do not translate or reformat a stored business value. Not names, not numbers,
  not identifiers.
- Do not implement number or date formatting rules beyond reading the region
  profile the server returns.
- Do not add a dependency. `intl` and `flutter_localizations` are already
  present from E00.
- Do not store the preference only on the device. The server is the source of
  truth, so a reinstall keeps the owner's language.

## 5. Files & changes

### Add

- `settings_language/data/locale_preference_repository.dart` — the PATCH call
  through the generated client, returning a sealed outcome.
- `settings_language/application/locale_state.dart` — immutable state:
  current locale, busy, and the last failure.
- `settings_language/application/locale_controller.dart` — the view model.
- `test/features/settings_language/locale_controller_test.dart`
- `test/features/settings_language/language_settings_page_test.dart`
- `test/features/settings_language/locale_inventory_test.dart` — the released
  E01 screen inventory check for `NFR-I18N-01`.

### Update

- `settings_language/presentation/language_settings_page.dart` — replace `T06`'s
  placeholder with the real control.

### Delete

- None.

> The diff may not exceed this list. QA enforces.

## 6. Database changes

No DB changes. The preference is stored server-side on the workshop record by
`T04`. Nothing new is written to the device.

## 7. API changes

No contract change. One call:

| Method | Path | Request | Success | Failure the screen must handle |
|---|---|---|---|---|
| PATCH | `/api/v1/access/preferences/locale` | `{locale: "bn" \| "en"}` | `{locale}` → apply | 400 `VALIDATION.INVALID_FIELD` → keep previous; 401 `AUTH.SESSION_INVALID` → sign out; transport failure → keep previous, offer retry |

Validation: exactly `bn` or `en`. The control offers only those two values, so a
400 here means a client bug and must surface as an error state, not a silent
retry loop.

The screen sends no workshop identifier and no region profile.

## 8. Functions

```yaml
functions:
  - signature: "LocalePreferenceRepository.set(AppLocale locale) -> Future<LocaleOutcome>"
    params: { locale: "bn or en" }
    returns: "sealed outcome: applied locale, signed-out, or failure"
    purpose: "Persist the preference server-side, the single source of truth"
  - signature: "LocaleController.select(AppLocale locale) -> Future<void>"
    params: { locale: "the owner's choice" }
    returns: "void; emits busy, then applied or failure"
    purpose: "Persist first, then apply — so a failed save never fakes a switch"
  - signature: "LocaleController.current -> AppLocale"
    params: {}
    returns: "the locale currently in force, read from the access state"
    purpose: "One source of truth for which chip is selected"
```

## 9. UI changes

- **Design source:** `workspace/plan/01-design/screens/SCR-011-settings.md` and
  `prototype/SCR-011-settings.html`, **language control only**.
- Surface: owner app, Android-first, 412×892 work frame. Route
  `/settings/language`, created by `T06`.
- Components reused: `app-shell`, `content-card`, `selection-chip`, `feedback`.
- States required (`SCR-011` states):
  - **loading** — keep the labels visible and show progress on the value;
  - **error** — a failed change keeps the previous setting and says so;
  - **empty** — N/A for this control; both options always exist. State it in the
    widget's documentation rather than inventing an empty case;
  - **data** — the current language is selected and announced.
- Edge case from the screen spec: the language switch updates all released copy
  and saved data does not change.
- Accessibility (`NFR-A11Y-01`): the group has a heading; each chip exposes its
  name and checked state; the change is announced; contrast meets WCAG AA.
- Navigation: entered from the shell settings control; back returns to the prior
  screen. Do not add a link to `SCR-012` or any E04 surface.

## 10. External services & feature flags

None.

## 11. Challenges / Risks

- **Optimistic switching hides failures.** Applying the locale before the PATCH
  returns leaves the app in a language the server does not know about. Persist
  first, then apply.
- **A partial switch is the visible defect.** If any released E01 string is
  missing from `app_bn.arb`, the app shows mixed languages. The inventory test
  is what catches it, and the fix is a team-lead-routed change to `T06`'s ARB
  files — not a local edit.
- **Rebuild scope.** Changing `MaterialApp.locale` rebuilds descendants, but any
  string captured into a state object at construction time will not update. Keep
  copy resolution inside `build()`.
- **Formatting drift.** Reading BD formatting from a domain record instead of
  the region profile violates `NFR-I18N-03` and is easy to do accidentally when
  a number needs formatting.
- **`L-process-012` (binding).** Never interpolate a value into a log message —
  pass keyed fields. The workshop name and the locale value belong in fields.

## 12. Implementation checklist  (live execution log)

- [ ] tests written FIRST and failing for `FR-ACCESS-06` and `NFR-I18N-01`–`03`
- [ ] the control persists before it applies
- [ ] a failed change keeps the previous language and explains why
- [ ] the switch re-renders the whole app, not just this screen
- [ ] every released E01 screen has approved bn and en copy
- [ ] no stored business value changes on switch
- [ ] BD formatting is read from the region profile only
- [ ] chips expose name and checked state; the change is announced
- [ ] no inline hex or magic spacing; tokens only
- [ ] nothing from E04's Settings scope was built

## 13. Test plan

### Automated

- `test_FR_ACCESS_06_selecting_english_applies_english_to_the_app`
- `test_FR_ACCESS_06_selecting_bangla_applies_bangla_to_the_app`
- `test_FR_ACCESS_06_locale_is_persisted_before_it_is_applied` → the applied
  locale never changes when the PATCH fails.
- `test_FR_ACCESS_06_failed_change_keeps_the_previous_setting`
- `test_NFR_I18N_01_every_released_e01_screen_has_bn_and_en_copy` → walks
  `SCR-001`, the `SCR-002` shell and this control; a key present in one ARB file
  and missing in the other fails.
- `test_NFR_I18N_02_switching_changes_no_stored_business_value` → the workshop
  summary before and after differs only in `locale`.
- `test_NFR_I18N_03_bd_presentation_comes_from_the_region_profile` → a record
  field cannot influence formatting.
- `test_NFR_A11Y_01_language_chips_expose_name_and_checked_state`
- `test_FR_ACCESS_06_session_invalid_signs_out`

### Manual QA

1. Switch to English → the whole app, including `SCR-001` and `/home`, is in
   English.
2. Switch back to Bangla → the same, and the workshop name is byte-identical.
3. Kill the API, switch → the previous language stays and an error is shown.
4. Reinstall the app and sign in → the chosen language returns from the server.

## 14. Acceptance criteria (EARS)

- **EARS-E01-T09-1** — WHEN the owner selects Bangla or English, the system
  SHALL apply that language to every released E01 interface string.
  (`FR-ACCESS-06`, `NFR-I18N-01`)
- **EARS-E01-T09-2** — WHEN the language changes, the system SHALL change zero
  stored business value. (`NFR-I18N-02`)
- **EARS-E01-T09-3** — IF persisting the language fails, THEN the system SHALL
  keep the previous language and SHALL explain the failure.
- **EARS-E01-T09-4** — WHERE Bangladesh-specific presentation is rendered, the
  system SHALL take it from the BD region profile rather than from a domain
  record field. (`NFR-I18N-03`)
- **EARS-E01-T09-5** — WHERE the language control is displayed, the system SHALL
  expose each option's name and checked state to assistive technology.
  (`NFR-A11Y-01`)

## 15. Self-review (agent fills BEFORE status: review-requested)

- [ ] All checklist items done (with commit hashes)
- [ ] `make test && make lint` pass
- [ ] Loading, error and data states present; empty documented as N/A
- [ ] i18n complete — the inventory test is green
- [ ] No secrets/PII logged; no value interpolated into a log message
- [ ] Diff confined to §5 list; §4 respected

### Deviations from spec

(none)

### Files touched (actual)

- ...

## 16. Definition of Done

- [ ] All §14 criteria pass via tests named by EARS/trace ID
- [ ] **UI fidelity** — the language control's card structure, chips,
      typography and copy match `SCR-011`; tokens only; the deliberately
      unbuilt E04 sections listed in §15
- [ ] Peer-AI review approved by a different model
- [ ] Task-level QA APPROVE — `N/A — ordinary task, covered by epic QA`
- [ ] Squash-merged to epic branch; tracker + metrics stamped
- [ ] Graphiti episode written or "graph not consulted" noted
- [ ] Human verified at E01 checkpoint

## 17. Notes for the implementing agent

- Diagram: **N/A — no flow.** This is a linear select-persist-apply control.
- The inventory test is the most valuable thing in this task. Make it walk the
  real released screen list, not a hard-coded array that will rot.
- `apps/mobile/l10n.yaml` and E00's ARB files already establish the boundary:
  strings resolve through `AppLocalizations` and are never business data. Read
  `apps/mobile/lib/l10n/app_en.arb`'s header comment before starting.
- If a key is missing, stop and raise it. Editing the ARB files here would
  collide with `T06`'s ownership and with `T07`/`T08` running in parallel.
- Flutter internationalization:
  <https://docs.flutter.dev/ui/accessibility-and-internationalization/internationalization>

## 18. Handoff

At `review-requested`, hand to a different-model peer. Epic QA covers this task;
`T10` re-runs the switch end to end and compares stored values.

## Open Questions

- None. `SCR-011`'s numerals toggle, plan card, PIN management, SMS credit,
  module teasers and backup status are E04 scope and are fenced out above.

## Feedback log

- (human feedback on this deliverable lands here)

## Run log

- (inventory-test output, before/after value comparison, session refs)
