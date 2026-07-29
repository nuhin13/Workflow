# Garazo Glossary

- Version: 1
- Status: approved with SRS v1 on 2026-07-29
- Date: 2026-07-29

| Term | Meaning in the specification |
|---|---|
| Acknowledged record | A record for which Garazo reported a successful save |
| Active workshop | A workshop meeting the KPI's retained-activity rule |
| Approved | Explicitly accepted by the human gate or named approved source |
| Attributed income | Retained payment value linked to a return job that is linked to a sent reminder |
| Batch entry | Owner flow for entering completed jobs and related money after the rush |
| Bill | Retained charge lines and their calculated total for one job |
| Business date | The workshop-accounting date confirmed for an entry |
| Customer due | Positive unpaid balance remaining on a customer bill |
| Customer touchpoint | WhatsApp, SMS, or a future approved public link used without a customer Garazo app |
| Customer/vehicle relationship | The customer and vehicle records, when supplied, plus their linkage to the originating job |
| Failure cycle | Five consecutive invalid owner-PIN entries |
| Due recovery | A retained payment applied to an existing customer due |
| Entry mode | `live` or `batch` creation path used for a job |
| Free | Entitlement with the BRD-defined job/device limits and approved light ads |
| Job card | Workshop record anchored by a vehicle plate and at least one problem icon |
| Kill switch | Authorized remote control that disables an approved scoped capability |
| Live entry | Job information captured during the workshop workflow rather than in batch |
| Minimum job | A job with one non-empty plate and at least one problem icon |
| Money summary | Aggregated income, expense, due, recovery, profit, or net value protected by owner PIN |
| Owner PIN | Separate owner authorization used to reveal protected money on a shared device |
| PIN cooldown | Period during which owner-PIN verification is rejected after a failure cycle |
| Permitted workshop user | Authenticated non-owner or owner allowed to perform the current operational action |
| Pro | Paid entitlement exposing only the BRD-approved capabilities available in the current release |
| Protected value | Due, bill-due, money summary, profit, reminder ROI, or attributed income hidden until owner authorization |
| Protected route | Screen or flow capable of revealing a protected value after owner-PIN authorization |
| Region profile | Configuration controlling approved language, number, and Bangladesh-specific presentation |
| Reminder due occurrence | One scheduled instance at which one reminder becomes eligible to send |
| `reminder_returned` | KPI count increased once for an eligible return job attributed to a sent reminder |
| Reminder ROI | Owner-only sent, returned, and attributed-income outcome view |
| Scope | Product, workshop, branch, or other later-approved boundary to which an authorized operation applies |
| SMS credit | One retained unit consumed by one successful approved bill or reminder SMS |
| Support assistance | Qualifying human help under the definition awaiting `Q-006` |
| Tenant isolation | Rule that a workshop session returns zero record belonging to another workshop |
| Vehicle history | Chronological set of jobs linked to one vehicle |
| Workshop | Tenant-scoped garage or service-center business using Garazo |

## Naming rules

- Business source anchors: `BR-###`
- PRD requirements: `FR-###`
- SRS functional requirements: `FR-<AREA>-NN`
- SRS non-functional requirements: `NFR-<AREA>-NN`
- Acceptance criteria: `EARS-<AREA>-n`
- Features: `FT-###`
- Screens: `SCR-###`
- Open questions: `Q-###`
