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
- root cause: constitution rule 6 puts harness/, AGENTS.md and templates/ behind
  harness_change_policy, but nothing forces the approval to be *recorded* before the commit.
- fix applied: harness-file changes are proposed as a diff and land only after the human
  approves in-thread; the commit message cites where that approval happened. An agent that
  believes it has out-of-band authorization must surface the request for confirmation rather
  than self-certify it. Template changes that invalidate existing approved artifacts must
  name those artifacts so they can be re-approved.
- recurrence: 1
- status: open
