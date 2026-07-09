---
name: git-flow
description: The harness four-tier git flow - main/development/epic/task branches, worktree isolation, QA-gated PRs, conventional commits, conflict handling, co-author suppression. Use for ANY branch/commit/merge/PR action, starting a task, or resolving conflicts.
---
# Git Flow (four tiers)

```
main                                # production; tagged vX.Y.Z releases
└── development                     # integration; human-gated release to main
    └── epic_<NN>                   # one per epic (e.g. epic_00)
        └── epic_<NN>_task_<MM>     # one per task (e.g. epic_00_task_07)
```

> Naming is FLAT (underscores, no `/`) — owner decision 2026-06-11 (ADR-0009).
> Git forbids a branch `epic/00` coexisting with `epic/00/task/07` (a ref
> cannot also be a ref-directory); the flat scheme removes that class of
> failure entirely. The old `epic/<n>/task/<m>` slash scheme is retired.

## Starting a task (always this, exactly)
```bash
git fetch origin
git worktree add ../wt-E00-T07 -b epic_00_task_07 origin/epic_00
cd ../wt-E00-T07        # your isolated working tree — never share worktrees
```
(If the epic branch only exists locally during bootstrap, base on `epic_00`
instead of `origin/epic_00`.)
One task = one branch = one worktree. Git itself refuses the same branch in
two worktrees — that's the guardrail working.

## Promotion path (PRs only, no direct pushes)
1. task → epic: open PR, **QA agent review is the merge gate**, squash-merge
   so each task lands as ONE revertible commit. Then
   `git worktree remove ../wt-E00-T07` and delete the branch.
2. epic → development: PR; QA epic sweep done + HUMAN approves business fit.
   On merge, DevOps tags `epic-<n>-done`.
3. development → main: PR; human release gate; DevOps tags `vX.Y.Z` (annotated).
Branch protection on main+development: PR required, CI green. Never force-push them.

## Commits
- Conventional: `feat|fix|test|chore|refactor(E03-T07): imperative summary`
- Body cites EARS ids when closing criteria.
- NO AI co-author trailers — `agent/hooks/` strips them; also set Claude
  Code `"includeCoAuthoredBy": false`.

## Conflicts (agent procedure)
1. In YOUR worktree: `git fetch && git rebase origin/epic_<NN>`.
2. Resolve only files in your task's `files:` list; if the conflict crosses
   into another task's files → STOP, Open Question to Team Lead (resharding
   needed — two tasks touched one file).
3. Re-run tests, force-push YOUR OWN task branch only
   (`git push --force-with-lease`), re-request QA.
4. Stale `.git/index.lock` after a crashed agent freezes all worktrees:
   verify no git process runs, then `rm -f .git/index.lock`.
