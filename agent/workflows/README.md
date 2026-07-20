# Workflows — executable process runbooks

Each file is a step sequence an agent follows (invoke as slash-commands if
your tool supports them, or paste "follow agent/workflows/<x>.md"). Skills
carry the depth; workflows carry the ORDER and the GATES.

Lifecycle map:
epic-breakdown → (E00 first) shard-epic → analyze → [loop: implement-task →
qa-review] → bug-sweep → retro → release. Cross-cutting: handoff-freeze /
handoff-resume, inject-work.
