# agent/hooks/ — git hooks & statusline

**Why this exists.** Prompts can be ignored; hooks cannot. This is the
deterministic last line of defense.

**How it works.** `make hooks` installs `githooks/`:
- `commit-msg` — strips AI co-author trailers, nudges conventional
  `type(E##-T##):` messages, warns when a commit touches protected
  harness files outside the change policy.
- `pre-push` — blocks direct pushes to `main`/`development` (PRs only).
  Escape hatch for CI/admin: `HARNESS_ALLOW_PUSH=1`.
`statusline-ratelimit.sh` shows platform window usage so freezes happen
before the limit, not after.

**What it does NOT cover.** Hooks are local — a fresh clone must run
`make hooks`. Server-side protection (required reviews, protected
branches) must be set in the git host. Hooks check shape, not meaning —
QA checks meaning.
