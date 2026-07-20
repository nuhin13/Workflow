# Subagent Delegation
- Use for: wide codebase search, doc research, log spelunking, "find all
  usages" — anything broad whose RESULT is small.
- Contract with the subagent: a one-paragraph question + "return ≤15 lines:
  findings, paths, line numbers". Route to the trivial tier.
- Don't use for: the core implementation (context handover costs more than
  it saves), or anything needing your accumulated session state.
- Each subagent reloads system+project context fresh — it's a CONDITIONAL
  optimization; the win is keeping junk out of YOUR context, not free labor.
