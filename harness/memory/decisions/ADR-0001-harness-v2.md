# ADR-0001 — Harness v2: profiles, platform-agnostic tiers, layout

- Status: **accepted** (human-approved in-thread, 2026-07-22)
- Supersedes: — (first harness-level ADR)
- Basis: TireBook v1 run + `docs/harness-v2-proposal.md` (16 sections)
- Governs: constitution rule 13 (foundational) + rule 6 (harness_change_policy)

## Context

The v1 harness ran one heavy process for every project — enterprise ceremony
on a solo mobile app. It also leaked Claude vocabulary (`model: opus`) into
neutral files. The TireBook run produced a 16-section revision proposal. The
operator made the 6 foundational decisions (rule 13) below; this ADR records
them so v2 execution has a verifiable approval trail (L-process-009).

## Decisions

| # | Question | Decision |
|---|---|---|
| D-1 | Profile names | **`small` / `medium` / `large` / `extra-large` / `enterprise`** (5 tiers, size words) |
| D-2 | Harness folder visibility | **`harness/` (visible)** — not hidden `.harness/` |
| D-3 | `development` branch tier | **Only at `extra-large` and `enterprise`** |
| D-4 | Artifact versioning | **`-vN` filenames** (sort/grep/diff friendly) |
| D-5 | `/kickoff` on missing UI | **Hard-block** — no `--no-ui` escape |
| D-6 | First-class second platform | **Codex** — real tier values, not placeholders |

## Consequences

- A `profile` is chosen at kickoff (agent recommends, human picks) and decides
  phases, human gates, review depth, git tiers, and QA depth (see
  `harness.yaml: profiles`).
- Task frontmatter and role cards carry `tier:` (`deep`/`build`/`cheap`), never
  a model name. `harness.yaml: model_tiers` maps each tier per platform;
  no platform is the default — an unmapped tier stops and asks.
- Folders move `agent/` → `harness/` in a later, atomic migration step; this
  ADR does not perform the move.
- BRD + a UI reference are entry conditions; `/kickoff` refuses without both.
- Versions are first-class in `workspace/state.yaml` (`derived_from`), so a BRD
  bump marks downstream artifacts stale via `/trace`.

## Rollout

Executed in ordered increments (proposal §14, adapted for the template — the
`app/` product-folder move is a per-project step done in each project, not the
template). Each increment is its own validated commit. This ADR is increment 1.
