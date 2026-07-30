# Garazo Lifecycle Analysis

- Status: technical plan v1 — behavior analysis, not implementation detail
- Last updated: 2026-07-30
- Traces from: approved SRS v1; `Q-005`; approved design
  `SCR-003`, `SCR-005`, `SCR-009`, `SCR-010`, `SCR-012`–`SCR-014`;
  `FC-009`, `FC-012`, `FC-020`, `FC-021`
- Traces to: accepted `ADR-0002`, `ADR-0004`, `ADR-0005`, `ADR-0007`,
  `ADR-0008`, `ADR-0009`

Only states and effects supported by the approved sources are treated as
product behavior. Technology-specific queue/session/provider states are
illustrative boundaries constrained by the accepted ADRs; exact task
contracts remain unapproved.

## 1. Job lifecycle

The approved design shows four ordered states. The SRS permits only allowed
transitions and requires an immutable transition history.

```mermaid
stateDiagram-v2
  [*] --> Open: valid live or batch save
  Open --> Working: confirmed allowed transition
  Working --> Ready: confirmed allowed transition
  Ready --> Delivered: confirmed delivery
  Delivered --> [*]
```

Invariants:

- live and batch entry create the same job type;
- every accepted transition appends history;
- a disallowed transition leaves state unchanged;
- delivery may retain an optional next-service timing;
- cancellation, reopening, rollback, and deletion states are not approved and
  are intentionally absent.

## 2. Owner-money access and PIN cooldown

```mermaid
stateDiagram-v2
  [*] --> Locked
  Locked --> Unlocked: valid owner PIN
  Unlocked --> Locked: explicit lock
  Unlocked --> Locked: leave protected route
  Unlocked --> Locked: app background
  Unlocked --> Locked: 5 minutes inactive

  Locked --> FailureCycle: invalid PIN
  FailureCycle --> Locked: attempts 1 through 4
  FailureCycle --> Cooldown60: fifth invalid in first cycle
  Cooldown60 --> Locked: 60 seconds
  FailureCycle --> Cooldown120: fifth invalid in second cycle
  Cooldown120 --> Locked: 120 seconds
  FailureCycle --> Cooldown240: fifth invalid in third or later cycle
  Cooldown240 --> Locked: 240 seconds

  Locked --> Recovery: request registered-phone OTP
  Recovery --> ResetPin: valid OTP
  Recovery --> Locked: invalid or expired OTP
  ResetPin --> Locked: new PIN retained and escalation reset
```

During any cooldown, PIN verification is rejected and no protected value is
revealed. A successful PIN or completed recovery resets the next failure-cycle
cooldown to 60 seconds. Main authentication and owner-money authorization are
separate lifecycles.

## 3. Bill, payment, due, and ledger lifecycle

```mermaid
stateDiagram-v2
  [*] --> DraftBill
  DraftBill --> ConfirmedBill: valid charge lines confirmed
  ConfirmedBill --> Unpaid: no retained payment
  ConfirmedBill --> PartPaid: retained payment below total
  ConfirmedBill --> Paid: retained payments equal total
  Unpaid --> PartPaid: due-recovery payment retained
  PartPaid --> Paid: retained payments equal total
```

The state labels are derived views over retained bill and payment records, not
permission to create a mutable balance field. Invariants:

- bill total equals retained charge lines;
- unpaid balance equals bill total minus retained payments;
- a positive balance creates a tracked due;
- payment/due recovery and ledger effects are one acknowledged transaction
  boundary;
- a retried payment or recovery produces one financial effect;
- protected values are absent from responses while owner money is locked.

## 4. Batch submission lifecycle

```mermaid
stateDiagram-v2
  [*] --> DraftRows
  DraftRows --> Validated: every accepted row has plate and problem
  DraftRows --> DraftRows: validation error
  Validated --> Submitting: owner confirms business date and save
  Submitting --> Accepted: retained once
  Submitting --> DraftRows: failed or unknown outcome
  Accepted --> Accepted: identical retry returns prior result
```

The client retains all draft rows after failure. If the outcome is unknown, it
retries with the same idempotency identity and must not create a second job or
money effect.

## 5. Reminder and SMS-credit lifecycle

```mermaid
stateDiagram-v2
  [*] --> Scheduled: next-service timing retained
  Scheduled --> Due: timing reached
  Due --> Ineligible: no eligible Pro entitlement
  Due --> NoCredit: zero retained SMS credits
  Due --> PendingSend: eligible and funded
  PendingSend --> Sent: provider reports successful send
  PendingSend --> Retryable: transient or unknown result
  Retryable --> PendingSend: retry policy allows
  PendingSend --> Failed: terminal result
  Sent --> Attributed: eligible return job linked
  Attributed --> Attributed: repeated attribution is ignored
```

`Retryable` and `Failed` are technical delivery-boundary states, not new
customer-facing promises. Required effects:

- one reminder occurrence has at most one successful send;
- one successful SMS consumes one credit exactly once;
- an ineligible or no-credit attempt creates no successful send;
- attribution increments return count once;
- ROI values derive from retained reminders, attributions, jobs, and payments
  and require an owner-money grant.

Expected M+12 volume is 5,600 SMS sends/month, so correctness and evidence
dominate throughput (`FC-012`, `FC-020`).

## 6. Entitlement lifecycle

```mermaid
stateDiagram-v2
  [*] --> Free
  Free --> Pro: valid approved activation confirmed
  Pro --> Free: entitlement no longer valid
  Free --> Free: invalid activation
  Pro --> Pro: renewal or valid continuation
```

- entitlement changes preserve all workshop records;
- Free usage counts only successfully saved jobs in the current approved
  period;
- the 31st Free job is not saved after 30 successful current-period jobs;
- Pro-only actions remain unavailable while entitlement is absent;
- exact collection/provider states remain an unselected third-party concern.

## 7. Admin mutation lifecycle

```mermaid
stateDiagram-v2
  [*] --> Hidden: unauthorized
  Hidden --> [*]
  [*] --> ScopedView: authorized operator and scope
  ScopedView --> Confirming: approved mutation requested
  Confirming --> AppliedAndAudited: mutation and audit retained
  Confirming --> ScopedView: failure keeps prior value
  AppliedAndAudited --> ScopedView
```

The mutation and success audit are one acknowledged boundary. An audit contains
the SRS-required operator, control, prior value, new value, scope, and time.
No additional admin powers are inferred.

## 8. Online-first and future offline lifecycle

MVP:

```mermaid
stateDiagram-v2
  [*] --> Editing
  Editing --> SavingOnline: user confirms
  SavingOnline --> Acknowledged: server retains record
  SavingOnline --> Editing: unavailable or failed
  Acknowledged --> Reloaded: later authenticated online session
```

First paying cohort boundary only:

```mermaid
stateDiagram-v2
  [*] --> LocalSupported
  LocalSupported --> PendingSync: approved offline write
  PendingSync --> Reconciling: connectivity returns
  Reconciling --> Reconciled: approved merge succeeds
  Reconciling --> Conflict: later-approved rule required
```

The second diagram preserves the contract shape but does not choose local
storage, conflict fields, merge policy, or screen behavior. Those details need
separate approval before FT-020/FT-021 implementation.

## 9. Complex flow sequence

This sequence is technology-neutral and shows the most consequential combined
MVP path: owner authorization, bill/payment retention, due/ledger consistency,
and optional asynchronous SMS.

```mermaid
sequenceDiagram
  actor Owner
  participant App
  participant Access
  participant Billing
  participant Records
  participant Async
  participant Provider

  Owner->>App: Enter owner PIN
  App->>Access: Verify PIN and cooldown atomically
  Access-->>App: Short-lived protected grant
  Owner->>App: Confirm bill and payment
  App->>Billing: Submit command and idempotency identity
  Billing->>Access: Validate actor, workshop and protected grant
  Billing->>Records: Begin atomic record change
  Billing->>Records: Retain bill, payment, due and ledger effects
  Billing->>Records: Retain SMS intent when requested
  Records-->>Billing: Commit once
  Billing-->>App: Acknowledge retained result

  Async->>Records: Claim due intent
  Async->>Records: Recheck entitlement, credit and prior success
  Async->>Provider: Send provider-neutral message
  Provider-->>Async: Normalized success or failure
  Async->>Records: Record result; consume credit once on success
```

Failure analysis:

| Failure point | Required result |
|---|---|
| PIN invalid/cooldown | No protected value; no billing command |
| Authorization expires before submit | Reject; no partial record |
| Transaction fails | No acknowledgement; prior state remains |
| Response lost after commit | Same idempotency identity returns the retained result |
| Worker crashes after claim | Durable intent becomes claimable again under the selected queue policy |
| Provider outcome unknown | Retry only under a policy that prevents a second successful effect |
| Provider success, result-save retry | Unique success/idempotency rule prevents second credit consumption |

## 10. Aggressive-scenario review

At `FC-021`, job volume rises to 36,000/month and peak concurrency to 68.
The first checks are queue lag, database lock/connection waits, aggregate-query
latency, media growth, and provider throttling. The domain lifecycle does not
change when capacity changes; scaling must preserve the same idempotency,
authorization, transition, and audit invariants.

## Handoff

- Use these lifecycles to evaluate ADR options and later derive tests.
- Do not add states such as job cancellation, refund, write-off, reminder
  opt-out, or offline conflict resolution without an approved SRS/task change.
- Keep `NFR-ADOPTION-02` frozen under `D-001`.
