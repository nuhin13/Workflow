# ADR-0007 — Authentication and session

- status: accepted
- date: 2026-07-29 | proposed_by: architect | decided_by: project owner on 2026-07-30
- traces_to: [FR-ACCESS-03–FR-ACCESS-15, FR-ADMIN-01, NFR-SEC-01–NFR-SEC-04,
  Q-005, FT-002, FT-010, FT-018, FC-006]

## Context

Owner identity uses phone OTP. Every session is restricted to authorized
workshop scope. Owner-money access is a separate PIN step-up grant with the
approved relock, five-attempt failure cycle, 60/120/240-second cooldown, and
registered-phone OTP recovery (`Q-005`). Support-operator authentication and
permission are separate again. Expected M+12 is 700 total accounts
(`FC-006`); abuse resistance, recovery, and provider delivery matter more than
scale.

Official references checked 2026-07-29 and rechecked 2026-07-30:
[Firebase Android phone auth](https://firebase.google.com/docs/auth/android/phone-auth),
[Auth0 SMS passwordless](https://auth0.com/docs/authenticate/passwordless/authentication-methods/sms-otp),
[OWASP authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html),
and
[OWASP session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).

## Options considered

1. **Firebase Authentication/Identity Platform phone OTP, verified by Garazo
   backend; Garazo owns workshop authorization/session and owner-PIN grant** —
   pros: mature mobile verification, app verification, test-phone tooling;
   cons: Google coupling, phone-only security trade-offs, Bangladesh delivery
   and pricing must be tested; exit cost: high identity migration.
2. **Auth0 passwordless SMS; Garazo owns workshop authorization/session and
   owner-PIN grant** — pros: mature identity platform, admin identity options,
   configurable SMS-provider path; cons: vendor/configuration coupling,
   embedded mobile UX and Bangladesh routing require validation; exit cost:
   high.
3. **First-party OTP and Garazo sessions through an approved SMS adapter** —
   pros: maximum provider/routing/data control; cons: highest abuse,
   enumeration, OTP lifecycle, recovery, security, and operations burden; exit
   cost: medium provider migration but high ongoing ownership.

OTP volume/cost is not `FC-012` reminder traffic. A new forecast row or
provider quote is needed before making an OTP cost claim; infrastructure still
must be reviewed under `FC-016`.

## Comparison matrix

| Criterion (weight) | Firebase | Auth0 | First-party |
|---|---:|---:|---:|
| Security capability (25) | 4 (100) | 4 (100) | 4 (100) |
| Mobile owner UX (20) | 5 (100) | 4 (80) | 3 (60) |
| Admin identity path (15) | 4 (60) | 5 (75) | 4 (60) |
| Bangladesh provider flexibility (15) | 3 (45) | 4 (60) | 5 (75) |
| Operational simplicity (10) | 5 (50) | 4 (40) | 2 (20) |
| Testability (10) | 5 (50) | 4 (40) | 3 (30) |
| Exit cost (5) | 2 (10) | 2 (10) | 3 (15) |
| **Weighted total / 500** | **415** | **405** | **360** |

## Agent recommendation (advisory — NOT the decision)

Recommend Option 1, conditional on a Bangladesh-number delivery, consent,
abuse, and cost pilot. Exchange the provider assertion for a rotated Garazo
session; resolve membership server-side. Store the owner PIN with an approved
memory-hard verifier and treat the owner-money grant as short-lived,
server-validated step-up authorization. Final call is yours.

## Decision

Option 1 — Firebase Authentication/Identity Platform phone OTP, verified by
the Garazo backend; Garazo owns workshop authorization, its application
session, and the separate owner-PIN grant.

Confirmed by the project owner on 2026-07-30, conditional on a successful
Bangladesh-number delivery, privacy/consent, abuse, and cost pilot before
production rollout.

## Consequences

- Firebase proves phone possession and returns a signed identity assertion.
  The NestJS backend verifies it, maps it to a stable Garazo account, resolves
  workshop membership server-side, and issues a rotated Garazo session.
- Firebase identity is not workshop authorization and is not authorization to
  reveal owner-protected money.
- The Flutter flow must disclose that Google processes and stores
  authentication phone numbers for spam and abuse prevention, and must obtain
  appropriate end-user consent.
- Production enablement is conditional on testing real Bangladesh numbers for
  delivery, latency, abuse controls, consent, and current cost. Failure of the
  pilot requires a new ADR before switching providers or building first-party
  OTP.
- Fictional-number and disabled-app-verification facilities are testing-only
  and must never be enabled or embedded in production.
- The owner PIN remains a separate server-validated step-up grant. It keeps
  the approved relock behavior, five-attempt cycle, 60/120/240-second cooldown,
  and registered-phone OTP recovery.
- Support-operator authentication and scoped admin authorization remain
  separate from workshop-user identity.
- Auth0 and first-party OTP are rejected as the initial owner authentication
  strategy.
- Exact token/cookie storage, session lifetime, admin factors, PIN hashing
  parameters, OTP expiry/rate limits, device registration, and provider tenant
  configuration remain later human-approved security contracts.
