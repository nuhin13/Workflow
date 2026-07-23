---
name: harness-sync
description: Keep a project repo and the harness template in sync — pull harness updates (skills, agents, rules, orchestrator) from the template remote into a running project, and promote universal lessons or skill edits back to the template as a PR. Usage - /harness-sync setup <template-url> | pull | promote <L-area-nnn | path>
---

# /harness-sync — template ↔ project lifecycle

The template is the parent. Each project is a child repo cloned from it.
This skill moves improvements in BOTH directions, safely.

```
template repo  ──(pull: harness files only)──▶  project repo
template repo  ◀──(promote: universal lessons)── project repo
```

## setup (once per project)

```bash
git remote add template <template-repo-url>
git fetch template
```

Record the template URL in `harness.yaml: template_repo` so any session can
re-create the remote.

## pull — bring template improvements into this project

1. `git fetch template`.
2. Diff ONLY the harness paths (`harness.yaml: harness_change_policy.protected`
   plus `harness/`, `Makefile`, `requirements.txt`):
   `git diff HEAD template/main -- harness/ AGENTS.md CLAUDE.md harness/templates/ harness.yaml harness/templates/epic/ Makefile requirements.txt`
3. Present the diff summary to the human. This is a harness change —
   human approval required (`harness_change_policy`).
4. On approval, checkout those paths from `template/main` on a branch,
   KEEP the project's own tuning (project name, budgets, `product_code`
   paths, `write_scopes` adjustments — re-apply if overwritten).
5. `make validate` must pass. Commit `chore(harness): pull template updates
   <template-sha>`, PR into `development` as usual.

Never pull live project content from `workspace/` or product code from `src/` —
those are THIS project's content, not the template's.

## promote — send a universal lesson back to the template

1. Qualify it: a lesson is universal when its "Applies to" says all
   projects — the rule would help ANY product built on this harness
   (e.g. "single-use tokens need a concurrent double-use test"), not just
   this one (e.g. "our ticket API paginates by cursor").
2. Branch the template repo. Apply:
   - the lesson entry into the template's `harness/memory/lessons/<area>.md`
     with `source: <project> <task-id>` and `date: inherited`;
   - any rule the lesson was promoted to (the SKILL.md edit), so the
     template ships the RULE, not just the story.
3. Open a PR on the template repo titled `lesson: L-<area>-nnn <title>
   (from <project>)`. The template owner (you) approves — harness rules
   are code.
4. Back in the project: mark the lesson `status:
   promoted-to-template(<PR link>)`.

## What this does NOT cover

- Automatic sync — every pull and every promote passes a human gate.
- Merging two projects' histories — only harness files travel.
- Service dependencies (MCP servers, DB, Figma): those are per-project
  config (`.mcp.json`, `.env`) — copy the *examples* from `harness/mcp/`,
  never real credentials.
