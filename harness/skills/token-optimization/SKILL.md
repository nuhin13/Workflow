---
name: token-optimization
description: Minimize token consumption and cost in every agent session - selective reading, context pruning, model routing, caching, subagent delegation. ALWAYS apply during implementation; consult explicitly when sessions feel bloated, budgets warn, or rate-limit windows run low.
---
# Token Optimization

Read ops dominate agent spend (measured ~76% of tokens in agentic coding
runs) — so the biggest wins are in WHAT YOU READ and WHAT YOU KEEP.

## The five techniques (references/ has the how-to for each)
1. **selective-reading.md** — grep/scoped reads over whole files; never
   `cat` a tree. Read the task's `files:` list, not the repo.
2. **context-pruning.md** — once a sub-goal closes, summarize and drop the
   raw content; keep decisions, not transcripts.
3. **model-routing.md** — plan/review on the strong tier, implement on
   sonnet-tier, trivia (renames, messages, summaries) on haiku-tier; the
   task's `model:` field is the routing hint.
4. **prompt-caching.md** — keep the stable prefix stable (AGENTS.md, role,
   skill) so cache reads (~10% of input price) do the work; don't reorder
   system content mid-session.
5. **subagent-delegation.md** — wide exploration/research goes to a
   fresh-context cheap subagent that returns a SHORT summary; use only when
   the alternative pollutes the main context.

## Session rules of thumb
- Before reading anything: "does the task file already tell me this?"
- MCP results count too — fetch the node/schema/issue, not the world.
- Tight platform window (<30% left)? Prefer S-tier tasks; the scheduler
  already does this — don't fight it.
- Budget warnings (orchestrator) are stop-and-prune signals, not noise.
