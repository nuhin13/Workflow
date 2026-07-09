# **Business Requirements Document (BRD)**

## **Basic Ticketing System**

|  |  |
| ----- | ----- |
| **Document title** | Basic Ticketing System — Business Requirements |
| **Version** | 0.2 (Draft) |
| **Date** | 05 July 2026 |
| **Author** | Polygon Information & Technology Ltd. |
| **Status** | For review |

---

## **1\. Purpose**

This document defines the business requirements for a basic help-desk **ticketing system**. It describes what the system must do from a business and user perspective.

The system is delivered as an **embeddable, SDK-style solution**: any external system can integrate it to let its own end customers raise and track tickets. Internally, staff use the same system to manage those tickets end to end.

The BRD is deliberately scoped to a foundational feature set. It is not a technical design or architecture document.

## **2\. Background**

Support and internal-service teams need a single place to log, route, track, and resolve requests ("tickets"). Requests arrive from many channels — internal employees, a company website, and external chat platforms — and without a structured tool they get lost, ownership is unclear, and there is no visibility into workload or resolution times. This system provides a lightweight, structured workflow, plus an integration layer so any host application can feed tickets into it.

## **3\. Business Objectives**

* Let external customers raise tickets from any integrated channel via a simple integration.  
* Capture every incoming request as a trackable ticket with a clear owner and status.  
* Route tickets to the right person or team, manually or automatically.  
* Give agents and managers visibility into open work, priorities, and performance.  
* Reduce resolution time by standardising the ticket lifecycle and notifications.  
* Keep a complete, auditable history of activity on each ticket.

## **4\. Scope**

### **4.1 In scope**

* The modules below: Authentication, Role & Access Management, User Management, Ticket Creation, Ticket Assignment, Ticket Workflow, Comments & Activity, Notifications, Dashboard, Search & Filters, Settings, and Integration & SDK.  
* **Customer-facing ticket generation** through an embeddable widget / SDK that host systems can integrate.  
* Minimal role & access management for internal staff.

### **4.2 Out of scope (for this version)**

Full knowledge base, live agent chat/co-browsing, deep native connectors beyond the generic SDK (e.g. CRM, telephony), dynamic access control, dynamic workflow, advanced reporting/BI, multi-language UI, native mobile apps, and billing. These may be considered in later phases.

## **5\. Stakeholders & User Roles**

| Role | Description |
| ----- | ----- |
| **Administrator** | Configures the system, manages users, roles, categories, priorities, and SLAs. |
| **Manager** | Oversees a department or team, assigns work, monitors the dashboard. |
| **Agent** | Works assigned tickets, updates status, comments, resolves. |
| **Requester** | User who raises a ticket |
|  |  |

## **6\. Functional Requirements**

Requirements are grouped by module. Each has a unique ID for traceability. Priority uses **M** (Must-have), **S** (Should-have), **C** (Could-have).

### **6.1 Authentication**

*Login, sessions.*

| ID | Requirement | Priority |
| ----- | ----- | ----- |
| FR-AUTH-01 | System  users can log in with an email and password. | M |
| FR-AUTH-02 | Users can log out securely, ending their session. | M |
| FR-AUTH-03 | The system supports password reset via email. | S |
| FR-AUTH-04 | Failed login attempts are handled gracefully with a clear error message. | S |
| FR-AUTH-05 | Requesters can raise tickets without  login. | M |

### **6.2 Role & Access Management**

*Minimal roles and permissions.* Kept intentionally simple for this version.

| ID | Requirement | Priority |
| ----- | ----- | ----- |
| FR-ROLE-01 | The system provides a small fixed set of roles: Admin, Manager, Agent, Requester. | M |
| FR-ROLE-02 | Each staff user is assigned exactly one role. | M |
| FR-ROLE-03 | Access to features and data is restricted based on the user's role. | M |
| FR-ROLE-04 | Only Admins can manage users, settings, and configuration. | M |
| FR-ROLE-05 | Agents see and act on tickets assigned to them or their team; Managers see their department/team. | M |

### **6.3 User Management**

*Departments, teams, employees.*

| ID | Requirement | Priority |
| ----- | ----- | ----- |
| FR-USER-01 | Admins can create, edit, deactivate, and view staff (employee) accounts. | M |
| FR-USER-02 | Admins can create and manage departments. | M |
| FR-USER-03 | Admins can create teams and assign them to departments. | M |
| FR-USER-04 | Users can be assigned to one or more teams. | M |
| FR-USER-05 | Each user record stores name, email, role, department, and team. | M |
| FR-USER-06 | Admins can search and filter the user list. | S |

### **6.4 Ticket Creation**

*Create, categorize, attachments.*

| ID | Requirement | Priority |
| ----- | ----- | ----- |
| FR-CREATE-01 | Users can create a ticket with a title and description. | M |
| FR-CREATE-02 | The requester can select a **category** and priority when creating a ticket, chosen from the list defined by the Admin in Settings (see 6.11). | M |
| FR-CREATE-03 | Each new ticket receives a unique, human-readable reference ID. | M |
| FR-CREATE-04 | Tickets can be created through the internal UI **and** through the embedded SDK/widget on external channels (see 6.12). | M |
| FR-CREATE-05 | Users can attach one or more files to a ticket (with size/type limits). | S |
| FR-CREATE-06 | Mandatory fields are validated before a ticket can be submitted. | M |
| FR-CREATE-07 | The requester (internal user or external customer), source channel, and creation timestamp are recorded automatically. | M |

### **6.5 Ticket Assignment**

*Manual / automatic assignment.*

| ID | Requirement | Priority |
| ----- | ----- | ----- |
| FR-ASSIGN-01 | A Manager or Agent can manually assign a ticket to a specific agent. | M |
| FR-ASSIGN-02 | A ticket can be assigned to a team as well as an individual. | S |
| FR-ASSIGN-03 | The system can auto-assign tickets based on a configurable rule (e.g. by category or round-robin). | S |
| FR-ASSIGN-04 | Tickets can be reassigned, and each reassignment is logged. | M |
| FR-ASSIGN-05 | Unassigned tickets are clearly identifiable in the queue. | M |

### **6.6 Ticket Workflow**

*Open → Assigned → In Progress → Waiting → Resolved → Closed.*

| ID | Requirement | Priority |
| ----- | ----- | ----- |
| FR-FLOW-01 | Every ticket has a status from the defined lifecycle. | M |
| FR-FLOW-02 | Status transitions follow the allowed sequence and are enforced by the system. | M |
| FR-FLOW-03 | A ticket set to "Waiting" indicates it is paused pending input. | S |
| FR-FLOW-04 | Resolving a ticket requires a resolution note or comment. | S |
| FR-FLOW-05 | Closed tickets are read-only except for authorised reopening. | S |
| FR-FLOW-06 | Every status change is timestamped and attributed to a user. | M |

*Allowed transitions:* Open → Assigned → In Progress → (Waiting ⇄ In Progress) → Resolved → Closed. A Resolved or Closed ticket may be reopened to In Progress by an authorised user.

### **6.7 Comments & Activity**

*Internal / public comments, timeline.*

| ID | Requirement | Priority |
| ----- | ----- | ----- |
| FR-COMM-01 | Users can add comments to a ticket. | M |
| FR-COMM-02 | Comments can be marked internal (staff only) or public (visible to the requester/customer). | M |
| FR-COMM-03 | Each ticket has a chronological activity timeline of comments and key events. | M |
| FR-COMM-04 | The timeline records status changes, assignments, and attachments automatically. | M |
| FR-COMM-05 | Comment author and timestamp are always shown. | M |
| FR-COMM-06 | Public comments can be surfaced back to the customer on the originating channel via the SDK. | S |

### **6.8 Notifications**

*Email / in-app notifications.*

| ID | Requirement | Priority |
| ----- | ----- | ----- |
| FR-NOTIF-01 | An agent is notified when a ticket is assigned to them. | M |
| FR-NOTIF-02 | A requester/customer is notified when their ticket status changes or receives a public comment. | M |
| FR-NOTIF-03 | Notifications are delivered in-app for staff. | M |
| FR-NOTIF-04 | Notifications are delivered by email. | S |
| FR-NOTIF-05 | Customer notifications can be pushed back to the originating channel (e.g. chat reply) via the SDK. | S |
| FR-NOTIF-06 | Users can view and mark in-app notifications as read. | S |

### **6.9 Dashboard**

*Statistics and ticket summaries.*

| ID | Requirement | Priority |
| ----- | ----- | ----- |
| FR-DASH-01 | Users see a dashboard summarising ticket counts by status. | M |
| FR-DASH-02 | The dashboard shows tickets assigned to the current user. | M |
| FR-DASH-03 | Managers see team- or department-level statistics. | S |
| FR-DASH-04 | The dashboard highlights overdue tickets or SLA breaches. | S |
| FR-DASH-05 | Dashboard data reflects the current state of the system. | M |

### **6.10 Search & Filters**

*Priority, assignee, status, department.*

| ID | Requirement | Priority |
| ----- | ----- | ----- |
| FR-SEARCH-01 | Users can search tickets by keyword (title, ID, description). | M |
| FR-SEARCH-02 | Users can filter tickets by status. | M |
| FR-SEARCH-03 | Users can filter tickets by priority, assignee, and department. | M |
| FR-SEARCH-04 | Filters can be combined. | S |
| FR-SEARCH-05 | Results respect the user's role and access permissions. | M |

### **6.11 Settings**

*Categories, priorities, SLA — the admin control centre.*

| ID | Requirement | Priority |
| ----- | ----- | ----- |
| FR-SET-01 | Admins can **create, edit, rename, and deactivate ticket categories** from a dedicated Category Management screen in Settings. | M |
| FR-SET-02 | The categories defined here populate the category picker shown to requesters and customers at ticket creation (see FR-CREATE-02). | M |
| FR-SET-03 | Deactivating a category hides it from new tickets but preserves it on existing tickets. | S |
| FR-SET-04 | Admins can create and manage priority levels. | M |
| FR-SET-05 | Admins can define SLA targets (e.g. response/resolution time) per priority. | S |
| FR-SET-06 | Changes to settings apply to newly created tickets. | M |
| FR-SET-07 | Only Admins can access the settings module. | M |

### **6.12 Integration & SDK**

*Embeddable, channel-agnostic ticket generation.*

| ID | Requirement | Priority |
| ----- | ----- | ----- |
| FR-SDK-01 | The system exposes an SDK/API that any host application can integrate to create and track tickets. | M |
| FR-SDK-02 | An embeddable widget lets an external customer raise a ticket from a host surface (website, chat, in-app). | M |
| FR-SDK-03 | Each integration is identified by a credential/key so tickets are attributed to the correct host and channel. | M |
| FR-SDK-04 | Tickets created via the SDK enter the same workflow, assignment, and notification pipeline as internal tickets. | M |
| FR-SDK-05 | The SDK can return ticket status and public updates back to the customer on the originating channel. | S |
| FR-SDK-06 | Customers can be identified lightly by channel handle or email, without a full staff account. | M |

## **7\. Non-Functional Requirements**

| ID | Requirement |
| ----- | ----- |
| NFR-01 | The system should load core pages and respond to SDK calls within an acceptable time under normal load. |
| NFR-02 | Passwords are stored securely (hashed); access is controlled by role; SDK keys are kept secret. |
| NFR-03 | The staff interface is usable on standard desktop browsers; the customer widget is responsive. |
| NFR-04 | Ticket data is persisted reliably; no ticket is lost once submitted from any channel. |
| NFR-05 | The activity timeline provides a basic audit trail of who did what and when. |

## **8\. Assumptions & Constraints**

* Internal requesters are employees; external requesters are end customers of a host system reached through the SDK.  
* Role & access management is intentionally minimal — a fixed set of roles, no custom permission sets in this version.  
* Email delivery relies on an available mail service; channel replies rely on the host platform's messaging capability.  
* The initial version targets a single organisation (no multi-tenancy) but multiple integrated channels.  
* Each module is sized to be built independently by one developer or pair.

## **9\. Glossary**

| Term | Meaning |
| ----- | ----- |
| **Ticket** | A logged request or issue tracked to resolution. |
| **Agent** | Staff member who works and resolves tickets. |
| **Requester** | Person who raises a ticket — internal employee or external customer. |
| **SDK / Widget** | Embeddable component and API that lets a host system generate and track tickets. |
| **Channel** | The source through which a ticket was raised (web, WhatsApp, Messenger, internal UI, etc.). |
| **SLA** | Service Level Agreement — target time to respond to or resolve a ticket. |
| **Internal comment** | A note visible only to staff, not the requester. |

---

*End of document — Draft v0.2. Open items: confirm SLA definitions, auto-assignment rule logic, attachment size/type limits, and the initial list of supported SDK channels for v1.*

