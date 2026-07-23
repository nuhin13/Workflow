# harness/memory/ — long-term memory

**Why this exists.** Sessions die; knowledge must not. This is what the
harness carries from epic to epic and project to project.

**How it works.**
| Folder | Question it answers | Written | Read |
|---|---|---|---|
| `lessons/` | what went wrong before? (`L-<area>-nnn`) | after QA fails / surprises (`/lesson`) | before planning or building in that area |
| `decisions/` | why did the reusable harness change? (`HADR-*`) | when a harness decision is accepted | before changing governed harness policy |
| `graphiti/` | what connects to what, over time? | after tasks/retros (optional MCP) | before tasks on shared files |

Lessons compound: repeat twice → promoted to a rule in a SKILL.md →
deterministic rules become git hooks. ADRs are never edited — reversals
are new superseding ADRs.

**What it does NOT cover.** Pipeline position (`workspace/state.yaml`) and
chat transcripts — reasoning is deliberately not stored;
anything important must land in state, a lesson, an ADR, or a handoff.
