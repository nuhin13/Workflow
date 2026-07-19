# agent/handoffs/ — rate-limit freeze packets

**Why this exists.** Subscription windows end mid-task. Work must
survive the platform dying under it.

**How it works.** Near the threshold (~80%), the current task freezes
into a YAML packet from `_template.handoff.yaml`: task id, branch, last
green commit, what is done, what is next, open questions. The next
platform in `harness.yaml: platforms` reads the packet and resumes.
Real packets are gitignored (transient); only the template is tracked.
Process: skills/rate-limit-handoff + workflows/handoff-freeze/resume.

**What it does NOT cover.** Phase/agent handoffs — those are Handoff
blocks written at the bottom of each artifact (`templates/handoff.md`),
not files here.
