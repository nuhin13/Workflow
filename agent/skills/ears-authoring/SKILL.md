---
name: ears-authoring
description: Write unambiguous, testable acceptance criteria in EARS notation (WHEN/IF/WHILE/WHERE...the system SHALL...). Use for every epic and task acceptance criterion, whenever requirements feel vague, and whenever someone writes "should work correctly".
---
# EARS Acceptance Criteria

Every criterion uses ONE of these shapes (Easy Approach to Requirements
Syntax):

| Pattern | Shape | Use for |
|---|---|---|
| Ubiquitous | The system SHALL <behavior> | always-true rules |
| Event-driven | WHEN <trigger>, the system SHALL <behavior> | user/system events |
| State-driven | WHILE <state>, the system SHALL <behavior> | modes |
| Unwanted | IF <error condition>, THEN the system SHALL <response> | failures |
| Optional | WHERE <feature enabled>, the system SHALL <behavior> | flags |

## Rules
1. One SHALL per criterion. Split compounds.
2. Behavior must be observable/testable — name the measurable outcome
   (status code, visible state, stored record), not internals.
3. Quantify: "fast" → "within 300ms p95"; "secure" → the concrete check.
4. ID every criterion: `EARS-<AREA>-<n>` and map it to SRS ids.
5. Each task's tests reference EARS ids in test names so the QA agent can
   verify coverage mechanically.

## Smell test
If you can't write a failing test from the sentence alone, it's not EARS yet.
