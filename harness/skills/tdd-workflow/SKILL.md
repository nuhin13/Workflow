---
name: tdd-workflow
description: Red-green-refactor against EARS criteria and API contracts - tests first, named by EARS id. Use for every implementation task, whenever writing code before tests feels tempting, and for bug fixes (regression test first).
---
# TDD Workflow

## Loop
1. **RED**: from the task's EARS ids + `api_contracts:` write failing tests
   FIRST. Test names embed the id: `test_EARS_AUTH_3_refresh_rejects_expired`.
   Run the suite — confirm they fail for the RIGHT reason (assertion, not
   import error).
2. **GREEN**: minimum code to pass, inside `files:`/`functions:` only.
3. **REFACTOR**: with green tests; no behavior change; conventions per genesis.
4. Commit at each green: `test(E..-T..): ...` then `feat(E..-T..): ...`.

## Coverage of contracts
- One test per response status listed in the contract (200/400/401/...).
- Lists: pagination envelope + limits tested.
- Validation rules: each rule has a rejecting test.

## Concurrency cases (L-process-003, E01 retro) — REQUIRED on §5.6 paths
For money / RBAC / single-use-token / state-machine paths (the 100%-coverage set), add a
**concurrent** test, not just single-request happy/sad. Two race bugs shipped green in E01
(token double-use TOCTOU, non-atomic lockout) because only sequential cases were tested.
- single-use token: two parallel consume requests → exactly one succeeds, one gets TOKEN_USED.
- winner/select (e.g. E04-T04 R12): two parallel selects → exactly one wins, one 409.
- counters/locks: assert atomic behavior (no lost increment, no permanent lock on crash).
Pattern: fire N requests with `Promise.all`, assert the invariant holds.

## Browser e2e (L-process-007, E02 retro) — REQUIRED for cross-origin / cookie / CSRF features
API-layer tests are same-process (supertest) and CANNOT see CORS, SameSite cookies, or real
cross-origin fetch — they give false confidence. Any feature where the browser crosses an origin
or relies on cookies/CSRF ships with a browser-level test (Playwright `*.pw.ts`, run by
playwright.config — NOT vitest; fence vitest off with `exclude: ['e2e/**']`).
- E02's SPA(:3001)→API(:3000) credentialed call was broken (CORS); only Playwright surfaced it.
- Assert the real round-trip: page renders, fetch succeeds cross-origin, cookie set + sent back.

## Bugs
A bug fix starts with a REGRESSION test reproducing it (named by bug id),
red → fix → green. No repro test = not fixed. Prefer the FASTEST level that proves it: a no-DB
unit test (mock the failing collaborator) beats a heavy e2e where it can reproduce the bug
(E02-B01.1 orphan was proven by a mocked-repo unit test, no DB/MinIO needed).

## Don't
- Don't weaken/delete a failing test to pass — that's an Open Question.
- Don't mock away the behavior under test.
