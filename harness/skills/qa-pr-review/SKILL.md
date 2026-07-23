---
name: qa-pr-review
description: Independent QA verification for the mandatory epic gate and high-risk task PRs only - verify EARS and DoD with evidence, run tests, police scope, approve or request changes. Ordinary task PRs use peer review without task-level QA.
---
# QA PR Review (epic gate + high-risk tasks)

An epic cannot reach checkpoint without QA approval. A task PR needs this QA
approval only when it is high-risk (auth, payments, migrations, or security);
ordinary task PRs merge after peer approval. Review = evidence, not vibes.

## Checklist (all must pass)
1. **Scope**: diff touches ONLY the task's `files:` list (lockfiles ok).
   Out-of-scope changes = CHANGES (status: changes-requested), cite paths.
2. **EARS coverage**: every EARS id in the task has ≥1 test referencing it;
   run the suite yourself — green locally/CI.
3. **Contract conformance**: responses/status codes/pagination/validation
   match `api_contracts:` exactly (spot-check with real calls where feasible;
   playwright for UI tasks vs `ui_reference`).
4. **DoD**: every box genuinely checkable — verify, don't trust ticks.
5. **What NOT to do**: none of the forbidden moves happened.
6. **Hygiene**: conventional commit, no co-author trailer, no secrets in
   diff, no new lint/type errors.
7. **ADR-decision coverage** (L-auth-002, E01 retro): list every accepted ADR decision
   the task's `traces_to` touches. Each MUST be implemented in the diff OR carry a §15
   deviation note with a reason. A silently-dropped ADR sub-decision = automatic CHANGES.
   (E01 shipped without ADR-0006's CSRF token + ADR-0007's pino redaction — both decided,
   neither built, no deviation noted. This check exists to catch exactly that.) Spot-check:
   grep the diff for the decided mechanism (e.g. `csrf`, `pino`/`redact`).
8. **Consequential side-effects are awaited** (L-process-004, E01+E02 retros). Grep the diff for
   `void ` and `.catch(() =>` / `.catch(()=>`. Any side-effect whose failure loses money, orphans/
   leaks storage, or drops an audit/security record MUST be awaited + its failure logged/handled —
   not fire-and-forget. (Caught TWICE: E01 audit, E02 orphaned photo.) Fire-and-forget allowed only
   for genuinely ignorable effects. = CHANGES otherwise.
9. **Config-tighten ⇒ all launchers updated** (L-process-005, E02-B01.5). If the diff adds/changes a
   REQUIRED env var or a fail-fast config read, every launch path must be updated in the SAME diff:
   `docker-compose*.yml`, `.env.example`, CI workflow env, `Dockerfile` (k8s later). A new required
   env with an unchanged compose/.env.example = CHANGES (boot crash waiting to happen).
   Also: untrusted route/body params reaching a typed DB column carry an edge validator → domain
   error, not a driver 500 (L-process-006, E02-B01.4).

## Verdict format (comment on the PR)
```
📋 QA VERDICT: APPROVE | CHANGES
- EARS: <id>: PASS/FAIL (test name / evidence)
- Scope: clean | violations: <paths>
- Contracts: conform | mismatches: <endpoint/field>
- Notes: <file:line specifics>
```
CHANGES must be reproducible: file:line + expected vs actual.

## Rules
- Failing tests / unticked DoD = automatic CHANGES, no exceptions.
- PEER rule: task-level QA runs only AFTER a peer (different model than
  `executed_by`) has reviewed. Epic QA independently re-verifies the merged
  epic diff. QA must never be the implementer (protocol §2).
- You never push fixes to the branch — the developer owns the code.
- Two consecutive rejections of the same task → escalate to Team Lead
  (spec problem, not coding problem).
