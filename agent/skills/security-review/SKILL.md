---
name: security-review
description: Focused security pass for auth / payments / RBAC / token / state-machine tasks. A concrete checklist of the attacks that have actually bitten this codebase (enumeration, session fixation, CSRF, token races, secret leaks). Use before marking any security-touching task done, and as the peer-review lens on such tasks.
---
# Security Review

Run this on any task touching **auth, payments, RBAC, single-use tokens, or money/state
machines**. It encodes real findings from the E01 peer review — not generic OWASP prose.
Each item: what to check, why, the trace.

## Checklist (each → PASS / FAIL with file:line)

### Authentication & sessions
- [ ] **Generic errors first** — wrong-password AND status (unverified/deactivated) failures
  return the SAME generic `AUTH.INVALID_CREDENTIALS` pre-session; no distinct code/message that
  reveals an account exists or has the right password. (NFR-SEC-009, T5, L-auth-003)
- [ ] **Session rotation on login** — the login PATH calls `rotate()` (or create-after-destroy),
  not just `create()`. Test: post-login sid != any pre-login sid. (ADR-0006, L-auth-001)
- [ ] **Cookie attributes** — httpOnly + Secure (TLS, non-dev) + SameSite. (ADR-0006)
- [ ] **CSRF** — state-changing endpoints carry a CSRF token or an enforced Origin/Referer
  check; SameSite=Lax alone is NOT sufficient. (ADR-0006 Axis A, L-auth-002)
- [ ] **Revoke-all** on password change / GDPR delete actually destroys every session.

### Tokens (verification / reset / api)
- [ ] **Hashed at rest** — only the hash is stored; raw token leaves only in the email link.
  (NFR-SEC-008)
- [ ] **Single-use under concurrency** — consumption is a conditional `UPDATE ... WHERE
  used_at IS NULL RETURNING id` inside a tx; concurrent double-use → exactly one wins.
  (L-auth-004) — NOT check-then-update-by-id (TOCTOU).
- [ ] **Expiry enforced**; ≥128-bit entropy.

### RBAC & isolation
- [ ] **Default-deny** — a route with no `@Public` and no session → 401; wrong role → 403,
  server-side, regardless of UI. (REQ-AUTH-031, T7)
- [ ] **Ownership** — cross-account resource access → 403 (`@Owns`). (R18, T6)
- [ ] **Open redirect** — any post-login `next`/redirect is allowlist-validated server-side.
  (NFR-SEC-010, T13)

### Money / state (payments, bid selection)
- [ ] **Atomic invariants** — one-winner / one-payment enforced by a conditional update or
  lock; concurrent test proves it (e.g. E04-T04 R12). (L-process-003)
- [ ] **Idempotency** on external callbacks/webhooks keyed on txn/event id.
- [ ] **No user endpoint initiates a transfer** (NFR-SEC-007, T4).

### Secrets & logging
- [ ] **Redaction** — logger redacts password/hash/token/keys/session id; no secret in logs.
  (ADR-0007 Axis C, T14)
- [ ] **No secret in repo/image**; provider SDK only inside the adapter.
- [ ] **Audit** lifecycle writes; failures are surfaced/alertable, never silently `void`ed (R26).

### Infra hardening
- [ ] **trust proxy** configured before reading client IP (else `X-Forwarded-For` is spoofable).
- [ ] **SSRF** — any server-side fetch of a user-supplied URL (agent endpoints) rejects
  internal/loopback/metadata IPs; HTTPS only. (E03)

## Output
One line per finding: `path:line: <emoji> <sev>: <problem>. <fix>.` (🔴 security · 🟡 risk · 🔵 nit).
End: PASS (no 🔴/🟡) or FAIL. A FAIL blocks `done`. Pairs with qa-pr-review (the merge gate).

## Provenance
Born from the E01 sonnet peer review (3🔴 10🟡): session-rotation-not-wired, CSRF missing,
enumeration oracle, token TOCTOU, audit fire-and-forget, pino unwired, non-atomic lockout,
XFF spoof. See agent/memory/lessons/auth.md + process.md.
