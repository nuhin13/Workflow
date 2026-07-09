# Human Guide — your loop, in 5 minutes

the harness is human-IN-the-loop by design. Agents produce; YOU verify business
fit. Here is everything you actually do.

## Your gates (where the system stops for you)
| Gate | When | You check |
|---|---|---|
| **Epic 00 exit review** | after E00 tasks | domain model + ADRs accepted, skeleton seen responding — the big one |
| First-wave + map approval | after /epic-breakdown | right epics? right wave? right priorities? |
| Genesis ADRs | during Epic 00 | stack/architecture/security decisions |
| /analyze report | before an epic's tasks dispatch | specs complete & consistent |
| Bug priorities | after each /bug-sweep | severity is QA's; PRIORITY is yours |
| Epic → dev PR | epic finished | does it match what the business needs? |
| Release (dev→main) | /release | ship it? |
| Retro promotions | after /retro | approve skill/rule edits (they're code) |
| Anything in harness.yaml `human_gates` | anytime | migrations, deps, auth… |

## Giving feedback (anytime, on anything)
Say it to the PM agent (or run /inject-work). It routes:
- about a deliverable → reopens that task, lands in its **Feedback log**
- a recurring agent miss → lesson now, promotion proposal at retro
- a new bug → bug task (you set P1–P4; P1 preempts running work)
- new scope → SRS amendment + new task/epic, scored into the queue
- a project-wide rule → constitution edit + ADR (you approve)
In-progress tasks are never silently edited — new work enters as new tasks.

## Reading the dashboard (dashboard/index.html)
Rebuild: `make dashboard`
- top strip: total cost, tokens, tasks done, open bugs
- per-epic card: progress bar by status, **cost vs budget bar** (turns coral
  over budget), spend by model
- task table inside each epic: status, token estimate, run count, task tokens,
  task cost, and a missing-usage warning when completed/review tasks have no
  metrics rows
- expandable run details under each task: timestamp, platform, model,
  input/output/cache tokens, total tokens, cost, duration, and session id
- bottom: project-wide spend by model

Task/epic text report: `make metrics` (`make metrics-json` for automation).

## When something shipped wrong (rollback cheat-sheet)
bad task merged → revert that one squash commit on the epic branch.
bad epic in dev → revert its merge commit on dev.
bad release → **redeploy the previous vX.Y.Z tag first**, then revert on main.
Details: agent/skills/rollback/SKILL.md

## Daily driving (three commands)
`make status` — the board · `make next` — what runs now (add LAYER=frontend
for one lane) · `make review` — what's waiting on review. Your sign-off
flips peer/QA-approved tasks from `done` to `verified`.

## Rate limits
The console statusline shows window usage; at ~80% the orchestrator freezes
work into handoff packets and resumes on the next platform (harness.yaml
order). You'll get a Slack HANDOFF notice — nothing is lost.
