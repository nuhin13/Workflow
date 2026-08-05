# Third-party services

Inventory of external dependencies, current status, and what each one is allowed
to see. Nothing here is provisioned or connected.

| Service | Purpose | Status | Boundary |
|---|---|---|---|
| Managed PostgreSQL | Authoritative records | Supplier not chosen (open item 2) | External to the VM. Reached via `DATABASE_URL`. |
| Private object storage | Media (later epics) | Supplier not chosen (open item 3) | Behind `ObjectStoragePort`. Binaries never go in PostgreSQL (ADR-0005). |
| Firebase phone auth | Phone identity (E01) | Not connected | Behind `PhoneIdentityPort`. Provides IDENTITY only — never workshop authorization (ADR-0007). |
| SMS provider | Reminders (E04) | Not chosen | Behind `SmsSenderPort`. |
| Container registry | Image distribution | Not chosen (open item 4) | — |
| Observability | Logs, metrics, alerts | Not chosen (open item 10) | Receives redacted logs only. |

## The rule

Every provider is reached through a **port** declared in
`packages/server-core/src/ports/` (ADR-0004). No provider SDK type may appear in
domain code, and
`tests/architecture/module-boundaries.spec.ts` fails the build if one does.

This is not ceremony. Firebase phone auth is conditionally accepted pending a
Bangladesh delivery, cost and privacy pilot (ADR-0007). If that pilot fails, the
provider is replaced by writing one adapter — not by finding every place a
Firebase type leaked into the product.

## What each provider must never receive

- The owner PIN, or anything derived from it.
- Protected money values — dues, attributed income, reminder ROI.
- Another workshop's data, under any circumstance.
