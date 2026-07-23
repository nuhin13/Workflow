# UI design canon

The Figma design is **law** for all UI work (the frontend equivalent of
"spec is law").

- **Accepted form:** `<figma | html_prototype | agent_generated_design | stitch_export | screenshots>`
- **Source:** `<paste URL or repo-relative artifact path>`
- **Human approval:** `<name/date>`
- **Figma file:** `<paste URL when the accepted form is figma>`
- **Access:** agents pull frames/tokens via the Figma MCP server registered in
  `harness/mcp/servers.json` (local Dev-Mode server from the Figma desktop app, or the remote
  `https://mcp.figma.com/mcp`). Setup: `harness/mcp/figma.md`.
- **Fallback:** export key screens as PNGs into this folder if MCP is
  unavailable; name them `<screen>-<state>.png`.

This file must identify a real, human-approved reference before `/kickoff`.
Do not leave the fields above as placeholders. If the design will be generated
by an agent, generate and approve that reference first; `/design` later turns
the accepted source into tokens, screen specs, and the prototype.

Rules for frontend tasks:

1. Every frontend task file references the exact Figma frame(s) it implements.
2. Design tokens (colors, spacing, type) are extracted ONCE during the genesis
   epic into a tokens package — components consume tokens, never hex values.
3. Visual deviation from Figma = deviation from spec → Open Questions, not
   improvisation.
