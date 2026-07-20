# Prompt Caching
- Cache reads bill ≈10% of base input; cache WRITES bill ≈1.25×, so churn
  kills the benefit. Stability is the strategy.
- Keep the prefix byte-stable within a session: AGENTS.md, role file, skill
  body, task file — load once, in the same order, don't edit mid-session.
- Long idle gaps expire the cache TTL → the whole prefix re-bills as a
  write. Batch your turns; finish the sub-goal before stepping away.
- Watch the ratio in metrics.csv: cache_read should dwarf cache_creation in
  healthy sessions; inverted ratio = prefix churn, find what's mutating.
