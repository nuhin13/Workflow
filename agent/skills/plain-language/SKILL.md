---
name: plain-language
description: Write every human-facing document in simple, friendly English — short sentences, common words, visuals over prose. Apply when writing or revising any README, guide, BRD/PRD, checkpoint, QA report, or handoff a human will read. Also usable as a rewrite pass - /plain-language <file>.
---

# plain-language — docs a human can actually read

Every document a human reads must pass this skill. Task specs and code
comments follow it too, except where precise legal/spec wording matters
(EARS criteria, ADR decisions — keep those exact).

## The rules

1. **Short sentences.** Target under 20 words. Hard stop at 30. One idea
   per sentence. Split anything longer.
2. **Simple words.** Say "use", not "utilize". Say "start", not
   "instantiate" (unless it is the real technical term). Define every
   acronym once, at first use.
3. **Front-load the point.** First sentence = the takeaway. Details after.
   Never make the reader hunt.
4. **Visuals over prose.** Before writing a paragraph, ask: is this really
   a table, a list, or a diagram?
   - process / flow → Mermaid `flowchart` or `sequenceDiagram`
   - comparisons / options / who-does-what → table
   - steps → numbered list
   - statuses → the standard emoji set: ✅ done · 🔄 in progress ·
     ⬜ pending · ⛔ blocked · 🧍 human gate
5. **Small paragraphs.** 1–3 sentences. White space is free.
6. **Active voice.** "QA verifies the epic", not "the epic is verified".
7. **Speak to the reader.** "You approve each checkpoint", not "the
   operator shall approve".
8. **No filler.** Delete "in order to", "it should be noted that",
   "basically", "leverage". They add nothing.

## Self-check before finishing any document

- [ ] Could a newcomer follow this without asking anything?
- [ ] Is every sentence under ~20 words (hard max 30)?
- [ ] Did every list of 3+ parallel facts become a table or list?
- [ ] Does every process have a diagram?
- [ ] Is the main point in the first two lines?

## Rewrite pass (`/plain-language <file>`)

1. Read the file. Keep ALL meaning, IDs, and traceability links intact.
2. Apply the rules above. Turn prose into tables/lists/diagrams where
   they fit. Do not change what the document promises — only how it reads.
3. Precision islands stay verbatim: EARS criteria, ADR decision lines,
   API contracts, code blocks, frontmatter.
4. Commit as `docs(<file>): plain-language pass`.

## Example

Before:
> In order to facilitate the verification process, it should be noted
> that the QA agent must be instantiated within a fresh context so as to
> prevent contamination from the builder's reasoning.

After:
> QA runs in a fresh context. It never sees the implementer's reasoning.
> This keeps the verdict honest.
