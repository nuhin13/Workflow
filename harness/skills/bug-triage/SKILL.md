---
name: bug-triage
description: Classify bugs on the severity x priority matrix, write bug tasks, and route them. Use after epic bug sweeps, when humans report bugs mid-stream, and whenever something is called "critical" without a definition.
---
# Bug Triage (severity × priority)

Two INDEPENDENT axes:
- **Severity** (QA sets — technical impact):
  S1 crash/data-loss/security/blocker · S2 major function broken, no
  workaround · S3 broken with workaround · S4 cosmetic/minor.
- **Priority** (HUMAN sets — business urgency): P1 now · P2 this epic ·
  P3 next epic · P4 backlog.
QA proposes a default priority (S1→P1, S2→P2, S3→P3, S4→P4); the human
confirms or overrides — a cosmetic bug on checkout can be S4/P1, a crash in
an unused admin page S1/P3.

## Queue position
P1 → preempts (orchestrator may freeze an in-progress task via handoff);
P2 → next pick in current epic; P3 → scheduled into the named epic;
P4 → backlog, revisit at retro.

## Bug task = normal task file plus
```yaml
type: bug
severity: S2
priority: {moscow: must, p: P2}
found_in: epic_03 sweep | human-report
repro: [exact steps]
expected: <per EARS-id / SRS-id>
actual: <observed>
```
Fix flow: regression test first (tdd-workflow) → fix → QA re-verify → close.

## Rules
- No bug without repro steps + expected-vs-actual. "Doesn't work" bounces.
- Bug ids: `E<NN>-B<nn>` under the epic where found.
- 3+ bugs sharing a root cause → one Decision/lesson, maybe a new rule/hook.
