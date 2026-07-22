# /handoff-resume <packet>  (agent: orchestrator on the NEXT platform)
1. Read packet; verify branch exists and last_commit matches origin.
2. Spawn the same-role developer on the next platform (harness.yaml order);
   inputs = packet + task file + AGENTS.md ONLY (not old chat history).
3. Worktree-add the same task branch; FIRST re-run last_test_status's
   failing tests to re-anchor; then execute next_step literally.
4. Normal flow resumes (implement-task step 5 onward). Delete the packet
   only after the task's PR merges; status frozen → in-progress.
