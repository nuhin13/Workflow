---
# ── identity & routing ──────────────────────────────────────────────
id: E<NN>-T<MM>                  # immutable. Bugs: E<NN>-B<MM>
epic: E<NN>
type: feature                    # feature | bug | genesis | chore
title: <short imperative title>
layer: backend                   # backend 🔵 | frontend 🟢 | cli ⌨️ | infra ⚙️ | docs 📄 | cross-cutting 🔶
size: S                          # XS ~2h | S ~1d | M ~2-3d | L ~1wk (split L!)
status: todo                     # todo|in-progress|review-requested|changes-requested|done|verified  side: blocked|frozen
owner_agent: developer-backend   # role that implements
preferred_agent: claude-code     # claude-code | codex | opencode | any (hint, not a lock)
model: sonnet                    # routing tier: opus | sonnet | haiku
token_estimate: { tier: M, range: "50k-150k" }   # S 5–15k · M 50–150k · L 150–500k
priority: { moscow: must, p: P2 }                # P1 preempts (bugs mainly)
depends_on: []                   # task ids; cross-epic: E02-T04
blocks: []
traces_to: [FR-AUTH-01, UC-1.1.1]    # spec is law — at least one SRS id (FR-<AREA>-NN / UC-x.y.z)
external_services: []            # e.g. [email, storage, queue]
files: { create: [], update: [] }  # MANDATORY mirror of §5 — the scheduler's
                                   # parallel-collision guard reads this
feature_flags: []                # flags this task introduces/toggles
ui_reference: n/a                # REQUIRED if layer: frontend — Figma frame(s) this builds
                                 # (link or frame name; see docs/design/README.md — UI is law)
# ── audit trail (agents stamp these) ────────────────────────────────
started_at:
completed_at:
executed_by:
reviewed_at:
reviewed_by:                     # MUST differ from executed_by (peer review)
review_outcome:
# ── bug-only (delete for features) ──────────────────────────────────
# severity: S2                   # S1 crash/security · S2 major · S3 workaround · S4 cosmetic
# found_in: epic_<NN> sweep | human-report
# repro: ["step 1", "step 2"]
# expected: <per FR/UC id>
# actual: <observed>
---
# <id> · <Title>

## 1. Feature goal
One sentence — what this achieves for the product/user when done.

## 2. Business logic
The rules. What must be true, what's forbidden, edge cases. Reference SRS FR
numbers and UC ids explicitly (e.g. "implements FR-AUTH-003, UC-1.1.3").
Note constitution constraints that apply (e.g. RBAC at API layer).

## 3. What this task DOES
- Concrete deliverable 1
- Concrete deliverable 2

## 4. What this task does NOT do (scope fence)
- Explicit non-goal (deferred to E<NN>-T<YY>)
- The tempting-but-wrong moves ("don't add a new lib", "don't touch login")

## 5. Files & changes
### Add
- `path/to/file` — purpose
### Update
- `path/to/file` — what changes and why
### Delete
- (usually none)
> The diff may not exceed this list (lockfiles excepted). QA enforces.

## 6. Database changes
- Migration: `NNNN_description` — tables/columns, indexes
- Reversible? Data backfill needed?
- (If none: "No DB changes.")

## 7. API changes
| Method | Path | Auth | Request | Response | Status |
|--------|------|------|---------|----------|--------|
| POST | /api/v1/... | Bearer buyer | {...} | {...} | 201 |

Per endpoint also state: **pagination** (lists MUST declare cursor|offset|
page+size + envelope), **required fields**, **validation rules** (one per
field, concrete), **error envelope** statuses reachable, **idempotency**.
(If none: "No API changes.")

## 8. Functions
```yaml
functions:
  - signature: "do_thing(input: TypeA) -> TypeB"
    params: { input: "what it is, where it comes from" }
    returns: "TypeB — shape/meaning; raises on <condition>"
    purpose: "one line — why this exists"
```
(If none: "No new functions.")

## 9. UI changes
- **Design source:** Figma frame `<link/name>` (see docs/design/README.md)
- Surface: requester 🟦 / agent 🟩 / manager·admin 🟪 / widget ⬜ — route per routes doc
- Translate layout + composition + copy; values from design tokens, never
  inline-copied styles
- States required: loading / error / empty / data
- Navigation: from → to
(If none: "No UI changes.")

## 10. External services & feature flags
- Service · env vars needed · failure behavior
- Flag key · default · scope
(If none: "None.")

## 11. Challenges / Risks
- Known pitfalls, race conditions, gotchas for THIS task.

## 12. Implementation checklist  (live execution log)
> Check items off **as you complete them** and append the short commit hash
> (`a1b2c3d`). Multiple items may share one commit; one item may list several
> hashes; `(uncommitted)` only until the next commit — never hand off with it.
> See `agent/workflows/_handoff_protocol.md` §3b.
- [ ] tests written FIRST and failing (red) per EARS/UC ids
- [ ] <granular step>
- [ ] <granular step>

## 13. Test plan
### Automated
- test_FR_XXXX_000_<behavior> → asserts what
### Manual QA (human/agent runs these)
1. Step → expected result

## 14. Acceptance criteria (EARS)
- EARS-<AREA>-n: WHEN <trigger>, the system SHALL <behavior>   (FR-..., UC-...)
- EARS-<AREA>-m: IF <error condition>, THEN the system SHALL <response>

## 15. Self-review (agent fills BEFORE status: review-requested)
- [ ] All checklist items done (with commit hashes)
- [ ] make test && make lint pass for affected app
- [ ] Loading/error/empty states present (if UI) · i18n complete (if applicable)
- [ ] Audit entry on lifecycle writes (Module 14) · no secrets/PII logged
- [ ] Diff confined to §5 list; §4 respected
### Deviations from spec
(none, or list — small ambiguities resolved per protocol §5 get noted here)
### Files touched (actual)
- ...

## 16. Definition of Done
- [ ] All §14 criteria pass via tests named by EARS/FR id
- [ ] **UI fidelity** (frontend tasks only — N/A if no `ui_reference`): per
      [docs/design/README.md](../../docs/design/README.md) (UI is law) — the
      built page matches its `ui_reference` Figma frame in **layout, chrome (Nav/Footer),
      component structure, iconography, copy, and hover/focus states** — not just
      colors/fonts. Reuse shared primitives, consume design tokens (never inline hex), and
      confirm the global base (reset/fonts/body) is present. Any intentional
      divergence (e.g. a spec-required field the design omits) is listed in §15
      Deviations with the SRS/ADR reason.
- [ ] Peer-AI review approved (different model) → QA verdict APPROVE on the PR
- [ ] Squash-merged to epic branch; tracker + metrics stamped
- [ ] Graphiti episode written (or "graph not consulted" noted)
- [ ] Human `verified` (epic-level batches are fine)

## 17. Notes for the implementing agent
- Gotchas, exact copy/strings, links into the sample frontend, anything subtle.

## 18. Handoff (only if status: blocked or frozen — protocol §3/§3A)
- What was tried / Why blocked / What's needed to unblock / Suggested next
- (rate-limit freeze: packet at `agent/handoffs/<id>.yaml` is mandatory)

## Open Questions
> Agent appends a question on a real spec gap and STOPS (small ambiguities: simplest
> interpretation + note in §15 Deviations instead). Each question carries an answer slot
> below — fillable by a HUMAN or an AGENT, MANUALLY or AUTOMATICALLY. Keys are stable
> (`Status:` / `Answer:` / `Answered by:`) so tooling can find + fill them.
> Status: 🟡 open · 🟢 answered · ⚪ deferred.

- **Q-### — <short title>.** <the question / the gap>
  - **Status:** 🟡 open
  - **Answer:** _<empty — fill here>_
  - **Answered by:** _<human name | agent id> (manual|auto)_
  - **Date:** _<YYYY-MM-DD>_
- (none yet)

## Feedback log
- (human feedback on this deliverable lands here)

## Run log
- (key evidence: MCP facts used, decisions applied, session refs)
