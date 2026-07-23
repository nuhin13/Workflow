# Model Routing (tiers from harness.yaml)
- `deep`: epic breakdown, sharding, architecture, final
  review, retro synthesis — where wrong = expensive.
- `build`: default for coding tasks against a written contract.
- `cheap`: renames, boilerplate, commit messages, summaries,
  doc tweaks, exploration subagents.
- The task's portable `tier:` is set at sharding. The scheduler resolves it
  through `harness.yaml: model_tiers` for the explicit active platform.
- Developers do not upgrade themselves. If a task is too hard for its tier,
  raise an Open Question and fix the task spec.
- Verify current prices in `harness/rates/cost-config.yaml`; vendor aliases
  never belong in task frontmatter.
