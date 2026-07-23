# Agent Handoff Protocol

> How work moves between agents (Claude Code, Codex, OpenCode, …) and between
> agent and human. The system must survive any single agent getting stuck or
> rate-limited, and must let a different CLI pick up cleanly.

## 1. Core principle
**No agent is special.** A task file + the spec/architecture docs contain
everything needed to execute. Any agent that can read markdown and write code
can pick up any `todo` task whose dependencies are met. Handoffs happen
through the task file + git (+ the handoff packet for freezes) — **never
through agent memory or chat history.**

## 2. The review chain
```
Agent implements
  → self-review (task §15) → status: review-requested
    → PEER AI review (per TASK) — a DIFFERENT model than the implementer
      → status: done  OR  changes-requested
        → [epic build-complete] → QA GATE (per EPIC, human-chosen model)
          → 🧍 HUMAN GATEWAY: epic → integration merge (rule 4)
            → status: verified
```
- **Implementer ≠ peer reviewer.** If a Sonnet-tier agent implemented, route
  review to a different model/platform (Codex↔Claude works well). Catches
  single-model blind spots. `reviewed_by` must differ from `executed_by`.
- **Two distinct gates** (don't collapse them):
  1. **Per-task PEER review** — different model than the executor (rule 12).
     Default Sonnet. Runs on every task before `done`.
  2. **Per-epic QA gate** — the independent merge gate, run ONCE when the epic
     is build-complete + all tasks peer-approved, BEFORE the epic→integration
     merge. **The human CHOOSES the QA model per epic** (Sonnet · Codex · other) —
     pick a model different from the executor (and ideally the peer reviewer) for
     max independence. The QA agent runs `skills/qa-pr-review` + `skills/security-review`
     against the full epic diff; verdict recorded on the epic tracker. A
     separate-session run (e.g. Codex in its own CLI, prompt handed to the human)
     is the strongest form — zero shared context. (E02 = first epic under this rule.)
- The human is the final gate but reviews *QA-approved* work — their time goes to
  judgment, not typo-catching. epic→integration and development→main merges are the
  **human gateway** (constitution rule 4).

## 3. When to hand off
### A. Blocked (can't finish)
Set `status: blocked`, fill task §18: what was tried · why blocked · what's
needed to unblock · suggested next (agent or human). Commit + push. The loop
moves on; a human/agent resolves the blocker later.

### B. Cross-domain (task needs a skill this agent is weak at)
Keep `status: in-progress`, append to §18 a **partial** handoff: done so far
(with commit hashes) · remaining · why handing off · suggested next agent.
Push the branch. The next agent continues the **same branch/task** — never a
fork.

### C. Review handoff (always cross-agent)
On `review-requested` the peer reviewer reads the diff + §15 self-review,
runs `make test && make lint`, and either approves (`done`) or writes
`changes-requested` with a concrete ❌/⚠️/✅ list in the tracker Review log
and the PR. Implementer fixes and re-submits.

### D. Rate-limit / preemption FREEZE (platform window or P1 preempt)
Orchestrator-driven (`harness/workflows/handoff-freeze.md`):
1. WIP-commit the branch (`wip(E03-T07): freeze for handoff`).
2. Write the packet `harness/handoffs/<id>.yaml` from the template —
   `next_step` and `last_test_status` are MANDATORY; save the diff beside it.
3. `status: frozen` in tracker; HANDOFF notice to the human (Slack).
Resume on the next platform (`harness.yaml: platforms`) reads ONLY the
packet + task file + AGENTS.md, re-runs the failing tests first, then
executes `next_step` literally. The packet is the transfer unit.

## 3b. The implementation checklist is a LIVE execution log
- Check off each §12 item the moment it's genuinely complete — never batch
  at the end. A resuming agent continues from the first unchecked item.
- Annotate with the 7-char short commit hash: `- [x] Serializer(s)  \`e4f5g6h\``.
  Many items per commit = same hash on each; one item across commits = list
  both. `(uncommitted)` is temporary and must be gone before any handoff.
- Branch is `epic_<NN>_task_<MM>`, commits are
  `type(E<NN>-T<MM>): summary` — so task→commits is recoverable from git
  even without the inline hashes; the hashes are reviewer convenience.

## 4. Handoff hygiene (rules)
1. Leave the repo **green or clearly red** — tests pass, or §18 says exactly
   what's failing and why.
2. **Commit before handing off.** Uncommitted work is invisible.
3. **Same task = same branch.** Continue partial work; don't fork.
4. **Write for a stranger** — zero memory assumed: paths, hashes, decisions.
5. Update the epic tracker with the status change.
6. **Never silently change scope** — note in §4/§18; big growth = propose a
   new task.
7. Non-obvious choices get a Decision record (one line minimum) in
   `harness/memory/decisions/` so future agents don't re-litigate.

## 5. Conflict & ambiguity resolution
- **Small spec ambiguity:** pick the simplest interpretation that satisfies
  the acceptance criteria, note the assumption in §15 Deviations, flag for
  review. Don't stall on small ambiguities.
- **Real spec gap / contradiction:** `spec/srs.md` wins on *what*; the
  genesis/architecture decisions win on *how*. Still unclear → Open
  Questions + `status: blocked`; human decides.
- **Two agents touched the same files:** the depends/blocks graph should
  prevent it; if it happens, the later agent rebases on the merged work —
  never force-push over another agent's commits. Recurring collisions →
  Team Lead reshards.

## 6. What the human is for
Pulled in only when: a task is `blocked` on a decision/external input; final
`verified` sign-off; epic completion + bug priorities; constitution/ADR-level
choices; the gates in `harness.yaml: human_gates`. Everything else runs
agent-to-agent.

## 7. Status transitions (quick reference)
| From | To | Trigger |
|------|----|---------|
| todo | in-progress | agent starts (deps met, picked by scheduler) |
| in-progress | review-requested | §15 self-review passed |
| in-progress | blocked | can't proceed (§18 filled) |
| in-progress | frozen | rate-limit/P1 freeze (packet written) |
| blocked/frozen | in-progress | blocker resolved / resumed on next platform |
| review-requested | changes-requested | peer/QA found issues |
| review-requested | done | peer approved + QA APPROVE + merged |
| changes-requested | in-progress | implementer resumes |
| done | verified | human sign-off |
