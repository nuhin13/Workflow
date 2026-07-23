# Lessons — auth

> **Inherited seed lessons.** L-auth-001..004 were learned in a previous
> project run on this harness (its E01 auth epic + peer reviews). The source
> task ids do NOT exist in this repo; the lessons are kept because they are
> generic auth failure modes and are already referenced by
> `skills/security-review`, `skills/tdd-workflow`, `skills/qa-pr-review` and
> `harness/agents/developer-backend.md`. Append new lessons below; never rewrite
> history.

## L-auth-001 — Session rotation existed but was never wired
- date: inherited | source: previous-project E01 peer review
- situation: `SessionService.rotate()` implemented; login flow never called it (fixation risk).
- root cause: review verified the API existed, not that the PATH called it.
- fix applied: "wire it, don't just expose it" — verify the flow, not the method.
- recurrence: 1
- status: promoted-to-rule(security-review · developer-backend traps)

## L-auth-002 — Accepted ADR sub-decisions silently dropped
- date: inherited | source: previous-project E01 retro
- situation: CSRF token + logger redaction were decided in accepted ADRs, never built, no deviation note.
- root cause: no gate mapped ADR decisions → diff coverage.
- fix applied: QA checklist item: every touched ADR decision implemented OR §15 deviation.
- recurrence: 1
- status: promoted-to-rule(qa-pr-review §7)

## L-auth-003 — Enumeration oracle via distinct auth errors
- date: inherited | source: previous-project E01 peer review
- situation: wrong-password vs unverified-account returned different codes → account-existence oracle.
- root cause: error-envelope design ignored pre-session information leakage.
- fix applied: generic `AUTH.INVALID_CREDENTIALS` for ALL pre-session failures.
- recurrence: 1
- status: promoted-to-rule(security-review)

## L-auth-004 — Single-use token TOCTOU
- date: inherited | source: previous-project E01 peer review
- situation: token consume = check-then-update-by-id; concurrent double-use both succeeded.
- root cause: no concurrency test; sequential happy/sad path only.
- fix applied: conditional `UPDATE ... WHERE used_at IS NULL RETURNING id` in tx + parallel-consume test.
- recurrence: 1
- status: promoted-to-rule(security-review · tdd-workflow)
