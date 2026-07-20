# /inject-work  (agent: pm; trigger: human adds a bug/feature/feedback ANYTIME)
1. Classify the input:
   a. Defect → bug task per skills/bug-triage (human sets priority).
   b. New scope → PM drafts task(s) (or a new epic if it's big) traced to a
      NEW SRS amendment id — spec stays the source of truth; 🧍 approve.
   c. Deliverable feedback → reopen that task; append to its ## Feedback log.
   d. Recurring agent miss → lesson now; promotion proposal at next retro.
   e. Project-wide rule → constitution edit + ADR; 🧍 approve.
2. Score + DAG-insert (skills/priority-scheduling). In-progress tasks are
   never edited mid-flight; P1 may preempt via handoff-freeze.
3. Confirm back to the human: what was created, where it landed in the queue.
