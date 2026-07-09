---
name: graphiti-memory
description: Query and write the Graphiti temporal knowledge-graph project memory - decisions, dependencies, lessons, file/API relationships over time. Use BEFORE starting any task (context pull) and AFTER completing tasks/retros (episode write), or when asking "why did we choose X".
---
# Graphiti Project Memory

Files hold the text; the graph holds the RELATIONSHIPS + TIME ("decision D
superseded C", "task X TOUCHES file F"). Server setup: `agent/mcp/graphiti.md`.
Schema: `agent/memory/graphiti/schema.md`.

## Before a task (context pull — 2 queries max)
- `search_memory_facts`: decisions + lessons touching this task's files/APIs
  (query with the actual paths + endpoint names).
- `search_nodes`: the task's dependency neighborhood (its epic, depends, the
  functions/APIs it extends).
Quote only the few facts that change your plan into your working notes.

## After a task / retro (episode write — one, not many)
`add_memory` ONE episode: what changed + why + links (task id, files touched,
decisions applied/created, lessons). Use the entity/edge names from the
schema so extraction stays consistent.

## Rules
- Files in `agent/memory/` remain the human-editable source of truth; the
  graph is the index — when they disagree, files win and the graph gets a
  correcting episode.
- Don't ingest noise (no raw diffs, no chat transcripts) — extraction is
  LLM-priced; quality episodes only.
- Server down? Proceed with file memory; note "graph not consulted" in the
  task Run Log. Never block on memory.
