# runs/ — the audit trail

**Why this exists.** "What exactly did the agent do and what did it
cost?" must be answerable later, per task.

**How it works.** Every headless run through `agent/adapters/run-*.sh`
writes `runs/<task-id>/` — session JSON + cost — and appends a row to
the epic's `metrics.csv`. `make metrics` and the dashboard read those
rows.

**What it does NOT cover.** Run contents are gitignored (transient,
possibly large); only curated prompt/answer logs under `_prompt-log/`
are versioned. Interactive (non-headless) sessions log nothing here —
their trace is the git history they leave.
