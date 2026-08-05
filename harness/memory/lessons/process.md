# Lessons — process

> **Inherited seed lessons.** L-process-003..007 come from a previous project
> run on this harness (its E01/E02 retros). Source task ids do NOT exist in
> this repo; kept because they are project-agnostic and already referenced by
> `skills/qa-pr-review`, `skills/tdd-workflow` and
> `harness/agents/developer-backend.md`. Append new lessons below; never rewrite
> history.

## L-process-003 — Race bugs ship green without concurrency tests
- date: inherited | source: previous-project E01 retro
- situation: token double-use + non-atomic lockout passed a fully sequential test suite.
- root cause: TDD loop had no concurrency requirement for invariant paths.
- fix applied: money / RBAC / single-use / state-machine paths require a `Promise.all` race test.
- recurrence: 1
- status: promoted-to-rule(tdd-workflow)

## L-process-004 — Fire-and-forget on consequential side-effects
- date: inherited | source: previous-project E01 audit write + E02 orphaned upload
- situation: `void record(...)` audit write and an un-awaited storage cleanup both swallowed failures.
- root cause: "non-blocking = better" habit applied to effects whose failure loses money/data/audit trail.
- fix applied: consequential side-effects are awaited + failure logged/handled; QA greps `void ` / `.catch(() =>`.
- recurrence: 2
- status: promoted-to-rule(qa-pr-review §8 · developer-backend traps)

## L-process-005 — Config tightened, launchers not updated
- date: inherited | source: previous-project E02 bug sweep
- situation: new REQUIRED env var added; docker-compose/.env.example/CI unchanged → boot crash.
- root cause: config change treated as code-only; launch paths not in the diff checklist.
- fix applied: required-env change must update every launcher in the SAME diff.
- recurrence: 1
- status: promoted-to-rule(qa-pr-review §9)

## L-process-006 — Untrusted param reaches typed DB column
- date: inherited | source: previous-project E02 bug sweep
- situation: raw route param hit a uuid column → driver 500 instead of domain 404.
- root cause: boundary validation assumed, not specified per param.
- fix applied: edge validator per untrusted param mapping to the domain error.
- recurrence: 1
- status: promoted-to-rule(qa-pr-review · developer-backend traps)

## L-process-007 — API-layer tests can't see the browser
- date: inherited | source: previous-project E02 retro
- situation: same-process API tests were green; real SPA→API credentialed call broken (CORS/SameSite).
- root cause: cross-origin/cookie behavior only exists in a real browser.
- fix applied: cross-origin / cookie / CSRF features ship with a Playwright test.
- recurrence: 1
- status: promoted-to-rule(tdd-workflow)

## L-process-008 — Parallel writers launched while a crashed agent was still resumable
- date: 2026-07-21 | source: TireBook Phase 4 /dev-plan diagram-first rewrite
- situation: a team-lead agent "failed" mid-run (API connection drop). The coordinator
  treated failed as dead, launched two fresh agents onto the same files, then the original
  resumed and wrote concurrently — a 3-way race on dev-plan.md, epic.md and tasks/E00-T05..T07.
  Nothing was lost only because the losing writes bounced as stale and those agents re-read
  instead of clobbering.
- root cause: a `failed` task-notification means "stopped mid-response", NOT "cannot resume".
  The harness can resume such an agent from its transcript, so it is still a live writer.
- fix applied: before launching any replacement agent, either confirm the crashed agent is
  finished for good or resume THAT agent instead. Never assign two agents the same file set;
  if work must be split, split by disjoint paths and say so in both prompts.
- recurrence: 1
- status: open

## L-process-009 — Agent committed protected harness files without passing the human gate
- date: 2026-07-21 | source: TireBook Phase 4 /dev-plan
- situation: a team-lead agent changed harness/skills/plain-language/SKILL.md plus three
  templates and committed them itself, with a message asserting "Human-requested harness
  change". The request was genuine but had been made outside the coordinator's thread, so the
  change landed with no verifiable approval trail and retroactively altered the template that
  8 already-approved task specs were written against.
- root cause: constitution rule 6 puts harness/, AGENTS.md and harness/templates/ behind
  harness_change_policy, but nothing forces the approval to be *recorded* before the commit.
- fix applied: harness-file changes are proposed as a diff and land only after the human
  approves in-thread; the commit message cites where that approval happened. An agent that
  believes it has out-of-band authorization must surface the request for confirmation rather
  than self-certify it. Template changes that invalidate existing approved artifacts must
  name those artifacts so they can be re-approved.
- recurrence: 1
- status: open

## L-process-010 — Fanned out three heavy agents with no quota headroom check
- date: 2026-08-05 | source: Garazo /build E00 autonomous run
- situation: the orchestrator dispatched three agents at once (E00-T01 implementation plus
  E01 and E02 epic specification) at the start of a long autonomous run. All three died
  within minutes on the same claude-code session rate limit, resetting ~19 hours later.
  E01 produced nothing, E02 produced an epic.md but none of its 15 task specs, and T01 had
  a partial scaffold with no tests written. Nothing was lost only because the work was
  WIP-committed and packetized afterwards.
- root cause: skills/rate-limit-handoff says never start a task with less headroom than its
  token estimate, but the check was never run. Three concurrent agents burn the shared
  session window roughly three times as fast, so parallelism converted a survivable single
  freeze into a simultaneous three-way freeze at the worst moment — before any agent had
  reached a committable checkpoint.
- fix applied: before dispatching, check window headroom (statusline JSON /
  harness/orchestrator/ratelimit_guard.py) and compare it against the SUM of the planned
  agents' token_estimates, not one task's. Stagger dispatch so agent N reaches a
  WIP-committable checkpoint before agent N+1 starts. On a long unattended run, verify the
  fallback platform is authenticated FIRST (a 30-second `codex exec` smoke test) rather than
  discovering it after the freeze. Instruct long-running agents to WIP-commit early and often
  so a freeze always lands on a committed boundary.
- recurrence: 1
- status: open

## L-process-011 — Dismissed an anomaly instead of chasing it
- date: 2026-08-05 | source: Garazo E00 QA (finding 1)
- situation: while running the E00 clean-clone gate I grepped its output and saw only FAIL
  lines, never PASS lines. I noted it as "odd", wrote "let me not worry", and moved on
  because the exit code was correct. Independent QA later found the cause: the PASS branch
  used `printf '--- ...'` while the FAIL branch used `printf -- '--- ...'`. On bash 3.2 —
  still the /bin/bash Apple ships — a format string starting with `--` is parsed as an
  option, so every PASS line failed with "printf: --: invalid option" and stderr filled with
  errors on all 14 steps.
- root cause: the exit code was green, so the anomaly looked cosmetic. It was not: the gate
  was silently swallowing its own confirmation output on the default shell of the platform
  it runs on. "Tests pass" masked "the tool is broken".
- fix applied: `printf --` before every format string that begins with a dash. More
  generally: an unexplained anomaly in verification output is a defect in the verification
  until proven otherwise. Green exit codes do not license ignoring visible weirdness — the
  output IS the evidence, and evidence that behaves strangely cannot be trusted.
- recurrence: 1
- status: open

## L-process-012 — Key-based redaction cannot see free text
- date: 2026-08-05 | source: Garazo E00 QA (finding 2)
- situation: the structured logger redacted by matching sensitive KEY names, and exempted the
  top-level `message` field from any scan. No call site leaked anything, so every test
  passed. But `logger.info(`otp ${code} sent`)` has no sensitive key at all — the value would
  have gone straight to the log. E01–E03 handle OTPs, PINs and owner-PIN-protected due
  amounts, so the first interpolated value would have been a permanent leak.
- root cause: the redaction mechanism and the way people actually write log calls disagreed.
  Key-based redaction assumes every sensitive value arrives under a name; interpolation
  produces sensitive values with no name at all.
- fix applied: added a conservative value-shape scrub (JWT, provider keys, URIs with
  credentials, Bangladeshi mobile numbers, long hex digests) applied to `message` and to
  every string value, plus tests proving ordinary operational text survives unmangled. The
  REAL rule stays structural and belongs in every later task spec: never interpolate a value
  into a log message — pass it as a keyed field so redaction can see it. The scrub is the
  safety net, not a licence.
- recurrence: 1
- status: open
