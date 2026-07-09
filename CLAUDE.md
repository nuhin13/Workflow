# Agentic Project Harness — Operating Manual

This repository is a **reusable agentic delivery harness**. It is not a product; it is the
machine that builds products. Clone it, run `/kickoff`, and drive an idea from BRD to shipped
code through a template-driven pipeline with human checkpoints per epic.

Every Claude session in this repo MUST follow this manual.

## Pipeline

```
IDEA
 └─ Phase 0  Business      /brd → /prd → /features → /forecast
 └─ Phase 1  Design        /design            (design system + screens + HTML prototype)
 └─ Phase 2  Traceability  /trace             (BRD ↔ feature ↔ UI matrix, kept live forever)
 └─ Phase 3  Tech Plan     /tech-plan         (options, pros/cons, diagrams, ADRs)
 └─ Phase 4  Dev Plan      /dev-plan          (Epic 00 skeleton + feature epics)
 └─ Phase 5  Build loop    /epic → /build → /qa → /checkpoint → next epic
```

Phases run in order. A phase may be revisited at any time, but every revision must ripple:
if an upstream artifact changes, run `/trace` to update or annotate every linked downstream
artifact before continuing.

## Where things live

| Path | Contents |
|---|---|
| `templates/` | Canonical templates. NEVER write a pipeline artifact without its template. |
| `project/00-business/` | BRD, PRD, feature list, forecast, other business docs |
| `project/01-design/` | `design-system.md`, `tokens.json`, `components/`, `screens/`, `prototype/` |
| `project/02-traceability/` | `matrix.md` (the BRD↔feature↔UI↔epic↔test map), discrepancy notes |
| `project/03-technical/` | tech plan, ADRs, diagrams |
| `project/04-plan/` | dev plan, epic map |
| `project/05-epics/` | one folder per epic: `EP-00-skeleton/`, `EP-01-…/` each with epic spec, task specs, QA reports |
| `project/assets/` | forecasts, imported design assets, anything referenced by artifacts |
| `src/` | the product code (structure defined by Epic 00) |
| `memory/state.yaml` | single source of truth for pipeline position. Read it at session start, update it after every stage. |
| `memory/lessons.md` | lessons learned (LSN-###). Read before starting any epic. |
| `memory/decisions.md` | decision log index; full ADRs live in `project/03-technical/adr/` |
| `.claude/agents/` | specialized subagents (analyst, designer, architect, planner, builder, qa) |
| `.claude/skills/` | the slash commands that drive the pipeline |

## ID conventions (used for traceability — never invent other formats)

- `BR-###` business requirement (BRD) · `FR-###` product requirement (PRD)
- `FT-###` feature · `SCR-###` screen/UI · `FC-###` forecast assumption
- `ADR-###` architecture decision · `EP-##` epic · `T-##.##` task (epic.task)
- `Q-###` open question · `D-###` discrepancy note · `LSN-###` lesson · `TC-##.##.#` test case

Every artifact carries its own ID and lists the IDs it derives from ("Traces from") and
feeds ("Traces to"). The matrix in `project/02-traceability/matrix.md` is the join table.

## Non-negotiable rules

1. **Templates always.** Every artifact starts from its file in `templates/`. Keep every
   section; write `N/A — reason` rather than deleting.
2. **State always.** After completing any stage, update `memory/state.yaml` and append to its
   history. A new session must be able to resume from state alone.
3. **Traceability always.** Creating/changing any artifact ⇒ update `matrix.md` in the same
   commit. A mismatch you can fix, fix in all linked artifacts; one you cannot fix becomes a
   `D-###` discrepancy note attached to both sides.
4. **The spec is the prompt.** Builder agents receive a task spec verbatim. If a task spec is
   not executable as a standalone prompt (missing files, patterns, or acceptance criteria),
   fix the spec first — never improvise around it.
5. **Limit budgeting.** Before starting work, estimate context/usage budget. Order work so at
   least one runnable, committed increment exists before any limit can hit. Commit early,
   commit working. Never leave the repo broken at end of turn.
6. **Independent QA.** QA runs as the `qa` agent in a fresh context. It receives only the
   spec + acceptance criteria + repo, never the builder's reasoning. Builders never mark
   their own work `qa-passed`.
7. **Human checkpoints.** An epic is `done` only after `/checkpoint` records human approval.
   The next epic may be prepared, but its code is not merged past an unapproved checkpoint.
8. **Epics are runnable flows.** Every epic ends with something a human can run end-to-end.
   Epic 00 delivers the running skeleton; every later epic delivers a working user flow.
9. **Open questions block silently — never guess.** A `Q-###` that blocks a task pauses that
   task (others continue). Batch questions for the next human touchpoint unless truly stuck.
10. **Lessons compound.** After every QA failure, checkpoint, or surprise, append a `LSN-###`
    to `memory/lessons.md`. Read lessons before planning or building anything.

## Handoff protocol (between phases and between agents)

Every phase/agent transition writes a handoff block (template: `templates/handoff.md`) at the
bottom of the produced artifact: what was decided, what is open, what the next stage must not
change without escalating. Receiving agents read the handoff before the artifact body.

## Session start ritual

1. Read `memory/state.yaml` → know phase, current epic, blockers.
2. Read `memory/lessons.md` (skim IDs + titles, read relevant ones).
3. If mid-epic: read the epic spec and in-flight task specs.
4. Announce position in one sentence, then continue the pipeline.
