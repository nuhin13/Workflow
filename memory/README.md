# memory/ — pipeline state

**Why this exists.** A fresh session — on any platform — must resume the
project from one file, with zero chat history. This folder is that file.

**What it does NOT cover.** Long-term knowledge (lessons, ADRs, graph)
lives in `harness/memory/` — see below.

- `state.yaml` — the single source of truth for pipeline position (phase,
  epics, tasks, blockers, history). Read at session start; update after every
  completed stage (constitution rule 15). A fresh session — on any platform —
  must be able to resume from this file alone.

Long-lived knowledge lives in `harness/memory/`:

- `harness/memory/lessons/<area>.md` — lessons learned (`L-<area>-<nnn>`,
  appended via `/lesson`; read before planning or building).
- `harness/memory/decisions/` — ADRs (template `ADR-0000-template.md`; index in
  its README). Decisions are reversed by superseding ADRs, never edits.
- `harness/memory/graphiti/` — knowledge-graph schema for the optional Graphiti
  MCP memory (see harness/mcp/graphiti.md).
