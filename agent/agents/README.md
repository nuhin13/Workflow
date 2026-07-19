# agent/agents/ — the roles

**Why this exists.** Peer review and write scopes only mean something if
roles are explicit. One card per role: what it owns, what it never does.

**How it works.** Each card is Markdown with frontmatter:
`name`, `description`, `model` (standard subagent fields) plus `mcp:` and
`skills:` (harness conventions — the role's allowlist and toolbox).
`.claude/agents` symlinks here, so Claude Code loads every card as a
native subagent. Other platforms read the cards as role prompts.
Write boundaries live in `harness.yaml: write_scopes` and are enforced
by `make validate`.

**What it does NOT cover.** Runtime tool restriction — deliberately.
Every role writes repo artifacts, so enforcement is: declared scopes +
validator + peer review + QA + git hooks. Adding or merging a role is a
harness change (ADR + human approval).
