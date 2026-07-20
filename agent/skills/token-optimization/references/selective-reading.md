# Selective Reading
- Locate first: `grep -rn "symbol" src/ --include="*.py" | head`, `git grep`,
  language server / repo map if available. THEN open only the matched region
  (sed -n 'a,bp' / ranged read), ±20 lines context.
- The task's `files:` + `functions:` sections tell you where to look — trust
  them before exploring.
- Re-reading a file you already summarized = waste; consult your note.
- Logs/output: tail and grep; never dump full CI logs into context.
