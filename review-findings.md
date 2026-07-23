# Harness Review Findings

Date: 2026-07-23

The harness passes its current validator, but several core flow and guardrail
issues can block projects, skip mandatory gates, or weaken platform and role
isolation. The SRS pipeline, profiles, scheduler scoping, QA semantics, model
routing, and write-scope enforcement need correction before relying on the full
flow.

## P1 Findings

### Add the SRS gate before planning

- Status: **Resolved 2026-07-23**
- File: `harness.yaml:106`
- Issue: For any run that reaches `/dev-plan` or `/epic`, downstream specs
  require `workspace/spec/srs.md` and SRS IDs (`FR-<AREA>-NN` / `UC-*`) as the canonical
  build law, but this pipeline jumps from `/features` to `/forecast` and never
  invokes `srs-authoring` or a human SRS approval.
- Impact: A project following the documented flow can enter planning with no
  canonical SRS. Task `traces_to` becomes unverifiable and `/epic-breakdown`
  can block.
- Resolution: Added `srs` to the validator-enforced phase order, wired
  `srs-authoring` as its driver, required `srs_approval` for every profile,
  recorded SRS approval/version in state, and made trace/dev-plan/epic stop on
  an unapproved SRS.

### Keep scheduler scoped to the active epic

- Status: **Resolved 2026-07-23**
- File: `harness/orchestrator/scheduler.py:111`
- Issue: When more than one epic has `todo` tasks, `ready()` scans every task
  in the repo and `make next` can dispatch a later epic before the current epic
  has passed `/qa` and `/checkpoint`.
- Impact: This bypasses the per-epic human gate documented in `/checkpoint`.
  The picker needs to read `workspace/state.yaml: current_epic` or accept an
  explicit epic/task filter before returning work.
- Resolution: `make next` now reads the configured state file and filters
  candidates to `current_epic`. It stops if task specs exist without a valid
  active epic. Unit tests cover multi-epic selection and global WIP counting.

### Make lighter profiles executable

- Status: **Resolved 2026-07-23**
- File: `harness.yaml:17-23`
- Issue: If `small` is selected, the configured path jumps from `design`
  straight to `build` even though `/build` only consumes generated epic/task specs.
  `medium` and `large` include `/dev-plan` but omit the `tech_plan` that
  `/dev-plan` declares as a precondition.
- Impact: These profiles can be chosen at kickoff and then dead-end or skip
  foundational choices. Either include the required phases or define separate
  lightweight build/dev-plan skills for them.
- Resolution: Every profile now preserves the minimum executable phase spine:
  business, design, approved SRS, traceability, technical decisions, dev plan,
  and build. A validator checks phase ordering, dependencies, SRS driver
  presence, and the SRS approval gate for all build-capable profiles.

## P2 Findings

### Align QA task-gate ownership with the constitution

- File: `harness/skills/qa-pr-review/SKILL.md:3`
- Issue: This makes QA the merge gate for every task PR, while the constitution
  and build flow say ordinary task PRs merge after peer review and only
  high-risk tasks get task-level `/qa`; the full QA gate is per-epic.
- Impact: Normal tasks can block waiting for unnecessary QA review, or agents
  can disagree about whether `done` is valid. The QA role, skill, and workflow
  should be reconciled to one rule.

### Resolve portable tiers instead of returning Claude aliases

- File: `harness/orchestrator/scheduler.py:188`
- Issue: `make next` emits `model: sonnet` from the task or a hard-coded
  default and never resolves `tier` through `harness.yaml:model_tiers`.
- Impact: On Codex, OpenCode, or local workers that value is meaningless, and a
  `tier: deep` task can run on the CLI default unless a human manually sets
  flags. This violates the platform-agnostic routing and no-silent-fallback
  rule.

### Stamp metrics even when a CLI run fails

- File: `harness/adapters/run-codex.sh:8`
- Issue: With `set -euo pipefail`, a non-zero `codex exec` exit stops the
  script at this pipeline, so `metrics_collect.py` is skipped for failed or
  aborted runs that need an audit trail. The same pattern exists in the other
  adapters.
- Impact: Failed runs can lack metrics. Capture the CLI exit code, run metrics
  collection, then return the original status.

### Enforce WIP limit even with --limit

- File: `harness/orchestrator/scheduler.py:186`
- Issue: When `--limit` is provided, `n = min(len(picks), a.limit or slots or
  1)` ignores the available `slots`.
- Impact: If three tasks are already in progress and someone runs
  `scheduler.py --next --limit 5`, it can return five more tasks despite the
  WIP limit. Treat `--limit` as an upper bound within `slots`, not an override.

### Keep QA out of product source write scope

- File: `harness.yaml:142`
- Issue: Expanding `product_code` gives QA both `src/` and `tests/`, even
  though the QA card says it is read-only on product code and may write tests
  and bug tasks only.
- Impact: A QA-owned task that lists `src/...` in `files.update` will pass
  `validate_harness.py`, enabling the verifier to edit implementation code it
  is supposed to independently judge.

### Match write scopes on path boundaries

- File: `harness/orchestrator/validate_harness.py:158`
- Issue: The prefix check allows any path that merely starts with an allowed
  string, so an allowlist entry like `src/` also permits `src-old/...`, and
  `workspace/plan/00-business/` permits `workspace/plan/00-business-backup/...`.
- Impact: Since this validator is the main write-scope enforcement, normalize
  paths and require either exact match or the next character after the allowed
  directory prefix to be `/`.

### Avoid product ADR IDs that already exist

- File: `AGENTS.md:137`
- Issue: The project conventions reserve `ADR-0001` for the product stack
  decision, but `harness/memory/decisions/ADR-0001-harness-v2.md` already
  exists.
- Impact: Genesis agents following this will link to or overwrite the harness
  ADR instead of creating a product stack ADR. Separate harness/product ADR
  namespaces or start product ADR numbering after the seed harness ADRs.

### Fix the BRD/UI bootstrap deadlock

- File: `workspace/docs/business/BRD.md:9`
- Issue: This placeholder tells a fresh user to start with `/kickoff`, but
  `/kickoff` hard-blocks unless `workspace/docs/business/BRD.md` already contains a real
  BRD. The design README similarly says the Figma URL can be unset for
  `/design`, even though kickoff requires a UI reference.
- Impact: For the mandatory BRD and UI philosophy, the start docs should
  instruct importing and approving both artifacts before kickoff. Otherwise, a
  new project follows the docs into a stop condition.

### Do not re-decide tech-plan ADRs in Epic 00

- File: `harness/skills/genesis-epic/SKILL.md:32-37`
- Issue: For profiles that run `/tech-plan`, stack, architecture, and security
  ADRs are already presented to the human and accepted before `/dev-plan`. This
  Genesis procedure then tells E00 to propose those same foundational decisions
  again and wait for approval.
- Impact: This can duplicate or contradict ADRs and violates the "do not reopen
  without escalation" handoff rule. Pick one owner: tech-plan decides and E00
  implements, or E00 owns the decisions and tech-plan stays proposed.

### Actually enforce per-role MCP allowlists

- File: `harness/mcp/README.md:9-12`
- Issue: The guide says role MCP allowlists are enforced at dispatch time, but
  the repo-level `.mcp.json` registers every server and the run adapters do not
  generate per-role MCP configs or filter enabled servers.
- Impact: On Claude project scope or copied Codex/OpenCode configs this gives
  roles schemas/tools outside their `mcp:` list, increasing token load and
  breaking least-privilege assumptions.

## P3 Findings

### Keep blockers in one question schema

- File: `workspace/state.yaml:41`
- Issue: `state.yaml` documents blockers as full `{id, blocks, question}`
  objects, while `/question` says state mirrors only the IDs and
  `workspace/open-questions.md` is the only authoritative text.
- Impact: Agents following both will duplicate question text into state and
  reintroduce the drift the question skill is trying to prevent. Make the state
  schema and dashboard agree on ID-only or object entries.

## Structural Recommendation

### Reduce root-directory spread

- Files: `harness.yaml:92-103`, `AGENTS.md:12-131`,
  `harness/docs/harness-guide.md:22-57`
- Issue: The root directory is wider than it needs to be. Product-instance
  artifacts are spread across several top-level folders:
  - `docs/`
  - `project/`
  - `spec/`
  - `epics/`
  - `memory/`
  - `runs/`
  - `dashboard/`
- Impact: The reusable harness engine and the current product workspace are
  visually and operationally mixed together. This makes onboarding harder,
  increases the chance of agents touching the wrong area, and makes future
  multi-project reuse less clean.
- Constraint: These folders are currently "needed" because `harness.yaml`,
  `AGENTS.md`, skills, validators, dashboard scripts, scheduler scripts, and
  adapters all referenced them as canonical paths. A proper migration must make
  executable code read these paths from `harness.yaml` and update docs/templates
  together.

### Recommended target structure

Use three clear zones:

```text
.
├── AGENTS.md
├── CLAUDE.md
├── README.md
├── Makefile
├── harness.yaml
│
├── harness/              # reusable harness engine
│   ├── agents/
│   ├── skills/
│   ├── workflows/
│   ├── templates/
│   ├── orchestrator/
│   ├── adapters/
│   ├── hooks/
│   ├── mcp/
│   ├── rates/
│   └── memory/           # harness-level ADRs, lessons, graph memory
│
├── workspace/            # current product/project instance
│   ├── state.yaml
│   ├── docs/
│   │   ├── business/BRD.md
│   │   └── design/README.md
│   ├── spec/
│   │   ├── srs.md
│   │   └── glossary.md
│   ├── plan/
│   │   ├── 00-business/
│   │   ├── 01-design/
│   │   ├── 02-traceability/
│   │   ├── 03-technical/
│   │   └── 04-dev/
│   ├── epics/
│   ├── runs/
│   ├── dashboard/
│   ├── assets/
│   └── open-questions.md
│
└── src/                  # actual product source code
```

Keep `src/` at the root. Product build tools usually expect source code and
package files at the repository root, and forcing app code under the harness
workspace can make normal framework conventions worse.

### Migration plan

1. Make every orchestrator script, adapter, validator, skill, and dashboard read
   artifact paths from `harness.yaml`.
2. Remove hard-coded references to `epics/`, `runs/`, `spec/`,
   `memory/state.yaml`, `project/`, and `dashboard/` from executable code.
3. Change `harness.yaml: paths` to point to `workspace/...`.
4. Move project-instance files into `workspace/`.
5. Update `AGENTS.md`, guides, skills, templates, and examples to use the new
   paths.
6. Run `make validate` and scheduler/dashboard smoke tests.

### Suggested path mapping

| Current path | Recommended path |
|---|---|
| `memory/state.yaml` | `workspace/state.yaml` |
| `docs/business/` | `workspace/docs/business/` |
| `docs/design/` | `workspace/docs/design/` |
| `spec/` | `workspace/spec/` |
| `project/00-business/` | `workspace/plan/00-business/` |
| `project/01-design/` | `workspace/plan/01-design/` |
| `project/02-traceability/` | `workspace/plan/02-traceability/` |
| `project/03-technical/` | `workspace/plan/03-technical/` |
| `project/04-plan/` | `workspace/plan/04-dev/` |
| `project/assets/` | `workspace/assets/` |
| `project/open-questions.md` | `workspace/open-questions.md` |
| `epics/` | `workspace/epics/` |
| `runs/` | `workspace/runs/` |
| `dashboard/` | `workspace/dashboard/` |

### Decision

The folders are conceptually needed, but they do not all need to be root-level.
The efficient structure is:

- `harness/` for the reusable engine.
- `workspace/` for product planning, state, audit logs, and generated project
  artifacts.
- `src/` for product source code.

Implementation note: this migration has now been applied by moving project
artifacts into `workspace/`, moving harness guides into `harness/docs/`, and
adding a shared orchestrator path resolver backed by `harness.yaml: paths`.
