# workspace/docs/business/ — business source of truth

**Why this exists.** One canonical home for the BRD, so every ID trail
(BR-### → FR → epic → task → test) starts from a single file.

**How it works.** Before `/kickoff`, import a real BRD as `BRD.md` or fill
`harness/templates/business/brd.md`, assign stable `BR-###` IDs, and obtain
human approval. `/kickoff` verifies that this is no longer the placeholder;
`/brd` then normalizes or revises the approved source without inventing scope.

**What it does NOT cover.** PRD, feature list, and forecast — those live
in `workspace/plan/00-business/`. The SRS (build law) lives in `workspace/spec/`.
