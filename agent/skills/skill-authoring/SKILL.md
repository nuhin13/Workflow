---
name: skill-authoring
description: Add a NEW skill or evolve an existing one - when a retro justifies it, how to write the SKILL.md, wire it to roles/platforms, and version it like code. Use when a retro promotion proposes a rule with no home skill, when the same how-to gets re-explained across tasks, or when the human asks for a new capability.
---
# Skill Authoring (skills are versioned software)

Skills live in `agent/skills/<name>/SKILL.md`. They are loaded ON DEMAND —
a skill nobody references is dead weight; a wrong skill makes every agent
worse. Hence: skills change only via a human-approved diff (retro rule).

## When a NEW skill is justified (vs folding into an existing one)
- A retro promotion (skills/retro ladder step "rule") has NO existing skill
  that owns the area → new skill.
- The same explanation appeared in ≥2 task files' §17 Notes → extract it.
- A new capability enters the project (new platform, new external service).
Otherwise: fold the rule into the closest existing SKILL.md — fewer, denser
skills beat many thin ones.

## Anatomy (keep the house style)
```markdown
---
name: <kebab-case>            # = folder name
description: <what it does + WHEN to use — the trigger phrases matter;
  this line is how agents/tools decide to load it>
---
# <Title>
<≤60 lines: procedure, hard rules, anti-patterns. Terse. No prose padding.>
```
- Big reference material goes in `references/*.md` beside it (see
  token-optimization) — SKILL.md stays cheap to load.
- Encode lessons with their L-id (e.g. "L-auth-004") so provenance survives.

## Wiring checklist (a skill that isn't wired doesn't exist)
1. Create `agent/skills/<name>/SKILL.md`.
2. Add it to the `skills:` list of every role card in `agent/agents/` that
   should auto-load it.
3. Reference it from the workflow step where it applies
   (`agent/workflows/*.md`) — workflows carry the ORDER, skills the DEPTH.
4. Claude Code native discovery: skills are exposed via the
   `.claude/skills` symlink (`ln -s ../agent/skills .claude/skills`) — a new
   folder is picked up automatically; no extra step.
5. Update the skill count/table in `docs/harness-guide.md` §2.
6. Commit as `chore(harness): add skill <name>` — 🧍 human approves the PR
   (constitution: skill edits are human-gated).

## The post-epic flow (how skills grow in practice)
retro (skills/retro) → lesson written → recurrence ≥2 → promotion proposal
drafted AS A DIFF (new skill or SKILL.md edit) → 🧍 human approves → merged
→ next epic's agents behave better. Never edit a skill mid-epic without the
gate — in-flight tasks were sharded against the old rules.

## Anti-patterns
- Skill as diary ("what we did in E03") — that's a lesson/ADR, not a skill.
- Duplicating constitution rules into skills (AGENTS.md already loads
  every turn).
- Project-specific values (ports, TTLs) in a skill — those belong in ADRs /
  conventions; skills carry the METHOD.
