# harness/skills/ — the skills

**Why this exists.** Loading every manual every turn would burn context
and money. Skills load one at a time, only when needed.

**How it works.** One folder per skill, `SKILL.md` inside, frontmatter
`name` + `description`. Two kinds:
- **Pipeline drivers** — `/kickoff /brd /prd /features /forecast /design
  /trace /tech-plan /dev-plan /epic /build /qa /checkpoint /status
  /question /lesson` — each drives one pipeline step.
- **Capability manuals** — git-flow, tdd-workflow, ears-authoring,
  rate-limit-handoff, token-optimization, plain-language… — how-to
  knowledge any role can pull in.
`.claude/skills` symlinks here → every skill is a Claude Code slash
command. Other platforms open the same files by path. Each agent card
lists its usual toolbox in `skills:`.

**What it does NOT cover.** Skills grant knowledge, not permission —
write scopes and gates still apply. Editing a skill is a harness change
(`harness_change_policy`): lesson promotion or skills/skill-authoring,
human-approved.
