# Graphiti MCP — the temporal knowledge-graph project memory

**Why:** files remember text; Graphiti remembers RELATIONSHIPS over TIME —
"task X depends on Y", "decision D superseded C on May 3", "function F
implements API A". Agents query it before tasks, write episodes after.

## Setup (self-host on your server)
1. Clone `getzep/graphiti` → `mcp_server/` → `docker compose up`
   (bundles FalkorDB as the default backend; Neo4j also supported).
2. Needs an LLM key for entity extraction (e.g. `OPENAI_API_KEY` or other
   supported provider) — extraction is LLM-heavy; keep `SEMAPHORE_LIMIT`
   modest and don't ingest noise.
3. Endpoint in `.mcp.json`: `http://localhost:8000/mcp/` (verify against the
   repo README for your version — the server is still marked experimental and
   transport/paths have evolved).

## the harness schema (custom entity & edge types)
Entities: Epic, Task, Bug, Decision, File, API, Function, Lesson, Agent,
ThirdPartyService.
Edges: DEPENDS_ON, IMPLEMENTS, TOUCHES, SUPERSEDES, LEARNED_FROM, ASSIGNED_TO,
VERIFIED_BY, BLOCKS.
Full schema + ingest conventions: `agent/memory/graphiti/schema.md`.

## Agent usage pattern
- BEFORE a task: `search_memory_facts` for decisions/lessons touching the same
  files & APIs; `search_nodes` for the dependency neighborhood.
- AFTER a task/retro: `add_memory` one episode — what changed, why, links
  (task id, files, decisions). Quality over volume.
- Files in `agent/memory/` remain the human-editable source of truth;
  Graphiti is the queryable index over them.
