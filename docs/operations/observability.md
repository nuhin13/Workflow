# Observability

## Logs

Every service emits **single-line JSON** to stdout via
`createStructuredLogger`. Single-line matters: log shippers split on newlines, so
a multi-line record becomes several broken records, and an attacker-supplied
newline becomes a forged one. The logger collapses newlines before writing.

Fields: `timestamp`, `level`, `service`, `message`, plus context.

### What is redacted, and why it fails closed

Sensitive keys are matched by **substring**, case-insensitively, so a field
nobody has written yet — `ownerPinAttempt`, `customerPhone`, `smsToken` — is
redacted by default. Over-redacting costs a slightly less useful log line;
under-redacting leaks an OTP or a due amount permanently, to everyone with log
access.

Covered fragments include: `otp`, `pin`, `password`, `secret`, `token`,
`credential`, `apikey`, `authorization`, `cookie`, `session`, `phone`,
`databaseurl`, `dsn`, and the money fragments `due`, `amount`, `balance`,
`income`, `salary`, `roi`, `price`.

Money is included because owner-PIN-protected amounts are the product's central
privacy promise on a shared workshop phone (BRD Law 2, Q-004). A due amount in a
log defeats it just as surely as one on screen.

`Error` objects log their **name only** — a message routinely carries a host, a
port or a query, and a stack carries our source layout.

Asserted by `packages/runtime-config/src/logger.spec.ts` with realistic
fixtures, not by reviewer discipline.

## Health

| Check | Meaning |
|---|---|
| `GET /api/v1/system/live` | The process is running. Makes no downstream call. |
| `GET /api/v1/system/ready` | Dependencies are reachable. Coarse `up`/`down` only — never a hostname, URL or driver version. |
| Worker marker `/tmp/garazo-worker-ready` | Written after bootstrap, removed before shutdown. |

Liveness and readiness are deliberately distinct. A container that reports
healthy before its dependencies are usable sends traffic into failures.

The worker exposes no HTTP port: a listener existing only for health checks is
network surface with no other reason to exist.

## Off-host shipping

**Not configured.** BLOCKED on open item 10. Until logs leave the host they are
useless after the host is gone — which is exactly the scenario
`rebuild-runbook.md` exists for.
