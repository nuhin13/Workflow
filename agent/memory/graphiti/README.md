# agent/memory/graphiti/ — knowledge-graph memory (optional)

**Why this exists.** Files and lessons are flat. Some questions need
relationships over time: "why did we choose X?", "which tasks touched
this API?".

**How it works.** `schema.md` defines the node/edge types (decisions,
files, APIs, lessons, tasks). The Graphiti MCP server (setup:
`agent/mcp/graphiti.md`) stores episodes; agents query it before tasks
and write after tasks/retros (skills/graphiti-memory).

**What it does NOT cover.** Nothing here is required — the harness works
fully without Graphiti. If it is not connected, lessons + ADRs + the
traceability matrix carry the load.
