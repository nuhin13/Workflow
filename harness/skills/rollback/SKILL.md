---
name: rollback
description: Cleanly unwind a bad task, bad epic, or bad release in the four-tier flow - revert vs reset vs delete decision table, tags, redeploy-first. Use whenever something merged is wrong, a release breaks, or anyone says "roll back / undo".
---
# Rollback Playbook

Default = `git revert` (history-preserving) the moment anything is SHARED.
`reset`/delete only on private, unshared task branches.

| Situation | Action |
|---|---|
| Bad task, PR not merged | delete branch + `git worktree remove` — done |
| Bad task, merged to epic | on epic branch: `git revert <squash-commit>` (one commit because we squash-merge); reopen task or file bug |
| Bad epic, merged to development | on development: `git revert -m 1 <merge-commit>`; note: re-landing later requires reverting the revert |
| Bad release on main | **redeploy previous `vX.Y.Z` tag FIRST** (stops user impact in minutes), THEN `git revert -m 1` the merge on main so git matches prod (GitOps rule: revert > reset in prod) |
| Mistake on your own unpushed task branch | `git reset --hard` freely — it's private |

## Tags = your time machine
- `vX.Y.Z` annotated on every development→main merge (DevOps).
- `epic-<n>-done` when an epic lands in development.
Rollback target is always a tag, never a guessed SHA.

## After any rollback
1. File a bug/incident task (template) with severity.
2. Retro entry: why did the gates miss it → lesson → (if recurring) rule/hook.
3. Update the dashboard run (`dashboard_build.py`) so state is honest.

## Forbidden
- `reset --hard` / force-push on main, development, or any epic branch.
- Deleting shared history to "clean up" — revert and move on.
