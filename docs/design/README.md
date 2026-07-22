# UI design canon — Figma

The Figma design is **law** for all UI work (the frontend equivalent of
"spec is law").

- **Figma file:** `<paste your Figma file URL here>` (leave unset to design
  Claude-native via `/design` — tokens, components, HTML prototype)
- **Access:** agents pull frames/tokens via the Figma MCP server declared in
  `.mcp.json` (local Dev-Mode server from the Figma desktop app, or the remote
  `https://mcp.figma.com/mcp`). Setup: `harness/mcp/figma.md`.
- **Fallback:** export key screens as PNGs into this folder if MCP is
  unavailable; name them `<screen>-<state>.png`.

Rules for frontend tasks:

1. Every frontend task file references the exact Figma frame(s) it implements.
2. Design tokens (colors, spacing, type) are extracted ONCE during the genesis
   epic into a tokens package — components consume tokens, never hex values.
3. Visual deviation from Figma = deviation from spec → Open Questions, not
   improvisation.
