# dashboard/ — the PM console (generated)

**Why this exists.** You should see epic/task status, owners, blockers,
questions, and costs without opening twenty files or paying for a tool.

**How it works.** `make dashboard` regenerates `index.html` — one static
file, no server, no login. `/status` and `/checkpoint` refresh it
automatically. Open it in any browser.

**What it does NOT cover.** It is read-only and generated — never edit
`index.html` by hand (it is gitignored; the builder is
`agent/orchestrator/dashboard_build.py`). Changing state happens in task
files and `memory/state.yaml`, never here.
