# /qa-review PR(E<NN>-T<MM>)  (agents: peer reviewer + qa)
> Runs at the epic QA gate (each task PR re-verified against the full epic
> diff) and on demand for high-risk task PRs (constitution rule 3). Per-task
> peer review is the merge gate for ordinary task PRs.
0. Precondition: PEER review done by a different agent/model than
   `executed_by` (protocol §2); peer notes in the tracker Review log.
1. QA applies skills/qa-pr-review fully; runs the suite itself.
1a. Frontend tasks (`ui_reference` set): QA verifies **UI fidelity** vs the Figma
    frame (workspace/docs/design/README.md — the design is law) — boot the web app dev
    server, screenshot the built route, compare to the Figma frame at the same
    viewport for layout/chrome/structure/icons/copy/hover, confirm design
    tokens + the global base. Mismatch (not a logged §15 deviation) = CHANGES.
1b. **Journey consistency:** screenshot the page's flow SIBLINGS side-by-side
    (e.g. all auth pages) and confirm they share one shell — same nav + same
    surface convention. A page that matches its own frame but clashes with
    siblings = CHANGES.
1c. **Field parity:** every input/select/textarea visible in the Figma frame must be
    present in the build. If a field can't be wired to the API contract yet, keep it in
    the form (collected to local state) and document the gap in §15 Deviations + an Open
    Question — DO NOT silently omit visible fields.
2. Verdict comment on the PR (📋 QA VERDICT format).
3. APPROVE → orchestrator squash-merges to the epic branch, status → done,
   stamps `reviewed_at/by` + `review_outcome`, removes worktree, stamps
   metrics, Graphiti episode (VERIFIED_BY). Human batch sign-off later
   flips done → verified.
   CHANGES → status → changes-requested with the ❌ evidence list; back to
   the SAME developer; on resume status → in-progress. 2nd rejection of the
   same task → escalate to team-lead (spec problem, not coding problem).
