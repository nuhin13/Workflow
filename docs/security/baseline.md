# Security baseline

What E00 actually enforces, and what it deliberately does not yet.

Nothing here is aspirational — every ✅ row names the test that fails if the
property breaks.

## Enforced today

### Authorization cannot come from the client

A workshop identifier in a header or body is **data**. Authority is only ever
what the server resolved from a verified session.

- `RequestContext` is built server-side; the only header it reads is the
  correlation id.
- `AuthenticatedActor`, `WorkshopScope`, `OwnerMoneyGrant` and `AdminScope` are
  four structurally distinct types, so none can be passed where another is
  expected.
- Each keeps its unauthorized state representable — `anonymous`, `none`,
  `locked` — so no caller can forget to handle it.
- Tests: `test_NFR_SEC_01_context_never_authorizes_client_scope`,
  `test_ADR_0007_identity_session_owner_grant_admin_scope_are_distinct`.

### Money is protected separately from being signed in

Garazo runs on a shared workshop phone. Being authenticated does **not** grant
sight of dues, attributed income or reminder ROI; that needs a separate
owner-PIN grant, scoped to one workshop and expiring (BRD Law 2, Q-004 answer).

`grantsMoneyAccess` checks kind, workshop match and expiry together, so no
caller can check one and forget another.

### One redacted error shape

Every failure — validation, unknown route, unavailable dependency, unexpected
crash — leaves through `toApiError`. Unknown errors collapse to
`SYSTEM.INTERNAL_ERROR` with no detail, because an unexpected error is the most
likely to carry a connection string or a file path.

Framework exceptions contribute their **status only**; their messages are
discarded. Test: `test_EARS_E00_4_error_envelope_leaks_no_internal_detail`.

### Log redaction fails closed

Sensitive keys are matched by **substring**, case-insensitively, so fields
nobody has written yet — `ownerPinAttempt`, `customerPhone`, `smsToken` — are
redacted by default.

Money fragments (`due`, `amount`, `balance`, `income`, `salary`, `roi`) are
included because owner-PIN-protected amounts are the product's central privacy
promise; an amount in a log defeats it as surely as one on screen.

`Error` objects log their **name only** — a message carries hosts and ports, a
stack carries our source layout. Records are single-line JSON, so a supplied
newline cannot forge a log entry.

### Configuration fails closed and never echoes values

Processes validate their whole environment before bootstrap and refuse to start
if anything is wrong. Errors name **keys**, never values — a bad `DATABASE_URL`
is exactly where a password would otherwise be printed.

### The diagnostic write path cannot reach production

The walking-skeleton route writes to the database without authentication. Four
independent guards, each separately tested:

1. The config layer **refuses to boot** a production process with the flag on.
2. The route checks its own environment and answers `404` —
   byte-identical to any unknown path, so its existence is not disclosed.
3. Production Compose hard-wires the flag to `false`, not overridable.
4. The Flutter route is gated on a **compile-time** constant, so the page is
   tree-shaken out of a release binary entirely.

Test: `tests/e2e/production-route-absence.spec.ts`.

### Containers run unprivileged

Non-root user, `no-new-privileges`, read-only root filesystem with an explicit
`tmpfs`, resource limits, health checks. Asserted against the **running** stack,
not just the Dockerfile.

### No credential is committed

`scripts/scan-secrets.sh` runs in CI over tracked files. The only
credential-shaped string in the repository is `garazo-local-dev`, the documented
local PostgreSQL placeholder, and a test asserts it never appears in the
production topology.

### CI cannot deploy

`contents: read` only, no deployment credential, no ssh/deploy step. A pipeline
that can reach production can be made to reach production by anyone who can open
a pull request.

## NOT yet enforced — and what it would take

| Gap | Why it is open | Owner |
|---|---|---|
| **No authentication at all** | E00 has no login. Every context is anonymous by construction, which is safe only because no product endpoint exists | E01 |
| **Owner PIN not implemented** | Types exist; the Q-005 behaviour (relock, 60/120/240s cooldowns, OTP recovery) is unbuilt | E01 |
| **No rate limiting** | Nothing throttles the diagnostic or any future endpoint | E01, with auth |
| **No TLS** | Terminated by ingress that does not exist yet | Open item 5 |
| **Secrets injected by hand locally** | No secret manager chosen | Open item 6 |
| **Base images tag-pinned, not digest-pinned** | A tag can be repointed, so two "identical" deploys can differ. A digest must come from the chosen registry and was deliberately **not invented** | Open items 4, 11 |
| **Dependency audit is advisory** | `continue-on-error` so a new advisory does not block an unrelated fix at 03:00 | Reviewed per release |
| **No penetration testing** | Nothing to test until auth and product endpoints exist | After E01 |
| **Firebase pilot incomplete** | ADR-0007 was accepted *conditionally* on a Bangladesh delivery, privacy, abuse and cost pilot | Before production |

## Process debt

Recorded plainly because it is a real weakness in the assurance behind
everything above:

- **No peer review** happened on any E00 task — the owner directed
  single-platform execution (constitution rule 12).
- **Task-level QA is deferred** on T02, T03 and T04, which define the
  authorization boundary, secret handling, log redaction, production topology and
  the first schema migration.

Both are surfaced at the E00 checkpoint rather than quietly ticked.
