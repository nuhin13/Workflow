# Model Routing (tiers from harness.yaml)
- plan_review (opus-tier): epic breakdown, sharding, architecture, final
  review, retro synthesis — where wrong = expensive.
- implement (sonnet-tier): default for coding tasks.
- trivial (haiku-tier): renames, boilerplate, commit messages, summaries,
  doc tweaks, exploration subagents.
- The task's `model:` field is set at sharding; developers don't upgrade
  themselves — if a task is too hard for its tier, that's an Open Question
  (the spec was wrong, fix the spec).
- Rough price anchor (verify agent/rates/cost-config.yaml): haiku ≈ ⅓ of
  sonnet, sonnet ≈ ⅕ of opus per output token — tiering is the #1 lever.
