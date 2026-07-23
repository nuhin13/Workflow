# workspace/docs/business/ — business source of truth

**Why this exists.** One canonical home for the BRD, so every ID trail
(BR-### → FR → epic → task → test) starts from a single file.

**How it works.** `/kickoff` captures the idea; `/brd` (analyst) writes
`BRD.md` from `harness/templates/business/brd.md`. Every business requirement gets a
stable `BR-###`. Already have a BRD? Drop it in as `BRD.md` and run
`/brd` to shape and ID it.

**What it does NOT cover.** PRD, feature list, and forecast — those live
in `workspace/plan/00-business/`. The SRS (build law) lives in `workspace/spec/`.
