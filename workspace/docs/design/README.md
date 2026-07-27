# UI design canon — Garazo

The registered UI reference is **law** for all UI work (the frontend equivalent
of "spec is law").

- **Version:** 1
- **Accepted form:** `html_prototype`
- **Source:** `workspace/assets/design-imports/GarazoPrototypeStandalone.html`
- **Human approval:** Project owner on 2026-07-26, confirmed at kickoff
- **Figma file:** N/A — the approved source is an HTML prototype
- **Import status:** Approved on 2026-07-27. Tokens, reusable components,
  14 canonical screen specs, and a clickable prototype live in
  `workspace/plan/01-design/`.
- **Approved additions:** `Q-003` authorized SCR-013 owner batch entry and
  SCR-014 authorized admin controls. Each stays within its cited FR/FT scope.
- **Privacy resolution:** `Q-004` makes the locked BRD privacy law
  authoritative. Due, bill-due, reminder ROI, and attributed-income values
  stay masked outside an owner-PIN-unlocked context. Non-money job details
  remain visible.

The prototype defines visual treatment, screen structure, states, and navigation.
The approved SRS will remain authoritative for product behavior.

Rules for frontend tasks:

1. Every frontend task file references the exact imported `SCR-###` screen spec
   and its source state in the HTML prototype.
2. Design tokens (colors, spacing, type) are extracted ONCE during the genesis
   epic into a tokens package; components consume tokens, never raw hex values.
3. Visual or navigation deviation from the approved prototype is a spec
   deviation and must be raised as an Open Question.
