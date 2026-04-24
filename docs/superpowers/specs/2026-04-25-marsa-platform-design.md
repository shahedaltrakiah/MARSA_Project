# MARSA Platform — Design Specification

**Date:** 2026-04-25
**Status:** Approved for implementation planning

---

## 1. Product Vision

MARSA is a tool-based SaaS platform for entrepreneurs and first-time founders. It provides a structured, guided workspace that covers the full startup journey — from idea validation through business modelling, operations, finance, and resourcing — in a single coherent experience.

The platform is AI-assisted: a startup profile acts as a live source of truth that feeds contextual AI recommendations into every section of the workspace. As the user builds their business, the AI helps them improve it.

---

## 2. Target Users

**Primary:** Solo founders and first-time entrepreneurs who need structure, guidance, and step-by-step support to build a coherent business model.

**Growth path:** As the startup grows, founders invite team members. The platform evolves from a solo workspace into a collaborative environment with shared visibility, roles, and task management.

---

## 3. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript | SSR for marketing/SEO, CSR for the interactive app, one codebase |
| Styling | Tailwind CSS + shadcn/ui | Consistent, accessible UI components |
| Theming | CSS variables + next-themes | Two modes: Midnight (deep dark + aurora gradients) and Light (white/gray + violet accents), user-switchable |
| Backend API | Laravel 11 (REST API) | Mature auth, queues, file handling, clean API layer |
| Authentication | Laravel Sanctum | Token-based auth, works cleanly with Next.js |
| Admin Dashboard | Laravel Filament | Full-featured admin panel at `/admin`, saves significant development time |
| Primary Database | MySQL 8+ | Reliable relational DB for structured business data |
| Cache / Queues | Redis | AI job queuing, session cache, recommendation cache |
| AI | Anthropic Claude API | AI-assisted recommendations, financial guidance, document analysis |
| File Storage | Laravel (S3-compatible) | Pitch decks, business plans, images uploaded in profile |

---

## 4. User Flow

```
Register / Login
      ↓
Startup Profile (onboarding form — filled once, always editable)
      ↓
Create / Select Project
      ↓
Main Workspace (6 sections)
```

**Profile → AI coupling:** Every edit to the Startup Profile triggers an async AI re-evaluation job. When the job completes, AI recommendations across all relevant workspace sections are refreshed. The profile is never a static snapshot — it is the live AI context.

---

## 5. System Architecture

### 5.1 Components

```
[Browser]
    │
    ├── Next.js App (marketing + authenticated app)
    │       ├── / → marketing pages (SSR, SEO-optimised)
    │       └── /app/* → workspace app (client-side, authenticated)
    │
    └── Laravel App
            ├── /api/* → REST API (consumed by Next.js)
            └── /admin → Filament admin dashboard
                    │
                    ├── PostgreSQL (primary data store)
                    ├── Redis (queues + cache)
                    └── Claude API (AI, always via queued jobs)
```

### 5.2 Key Architectural Decisions

- **Next.js handles both surfaces.** Marketing pages use SSR for SEO. The `/app` routes are client-side React. One deployment, one codebase.
- **Laravel is a pure API.** No Blade templates, no server-side sessions for the app. Sanctum tokens authenticate Next.js requests.
- **AI calls are always async.** No Claude API call blocks a user request. All AI work is dispatched to a Redis queue and results stored in the database. The frontend polls or receives a push notification when ready.
- **Filament runs on the same Laravel instance** at `/admin`. It is isolated from the API routes and uses its own auth guard.
- **Multi-tenancy by user.** Each user owns their profile and projects. Projects can have collaborators with defined roles.

---

## 6. Frontend Structure (Next.js)

### 6.1 Route Map

```
/                          → Landing page (SSR)
/about, /pricing, /contact → Marketing pages (SSR)
/register                  → Registration
/login                     → Login

/app/onboarding            → Startup Profile form (new users)

/app/projects              → Project list dashboard
/app/projects/new          → Create project

/app/projects/[id]                          → Workspace (redirects to /offering)
/app/projects/[id]/offering                 → Offering section
/app/projects/[id]/business-model           → Business Model section
/app/projects/[id]/customer                 → Customer section
/app/projects/[id]/money                    → Money section
/app/projects/[id]/money/financial-wizard   → Financial Statement Wizard (full-screen)
/app/projects/[id]/assets                   → Assets section
/app/projects/[id]/action                   → Action section

/app/profile               → Edit Startup Profile
/app/account               → Account settings
```

### 6.2 Workspace Layout

Every workspace route shares a persistent layout:

```
┌─────────────────────────────────────────────────────┐
│  Top bar: Project name · breadcrumb · actions        │
├──────────┬──────────────────────────────┬────────────┤
│  Left    │  Content area                │  Notes     │
│  Nav     │  ┌────────────────────────┐  │  sidebar   │
│          │  │ Sub-section tabs        │  │  (right)   │
│  6       │  ├────────────────────────┤  │            │
│  sections│  │ Tool / form / canvas   │  │  Per-      │
│          │  │                        │  │  section,  │
│  +       │  ├────────────────────────┤  │  context-  │
│  Profile │  │ 🤖 AI recommendation   │  │  aware     │
│  Account │  ├────────────────────────┤  │            │
│          │  │ Tasks · KPIs widgets   │  │  Text      │
│          │  └────────────────────────┘  │  Images    │
│          │                              │  Links     │
│          │                              │  Checklists│
└──────────┴──────────────────────────────┴────────────┘
```

---

## 7. Startup Profile (AI Source of Truth)

Filled during onboarding. Accessible and editable from the workspace at any time via `/app/profile`.

### 7.1 Fields

| Field | Type |
|---|---|
| Idea description | Long text |
| Problem being solved | Long text |
| Proposed solution | Long text |
| Target customer & market | Long text |
| Startup stage | Enum: Idea / Validation / MVP / Early Traction / Scaling |
| Team description | Long text |
| Current traction | Long text |
| Current challenges | Long text |
| Short-term goals | Long text |
| File uploads | Multiple files (PDF, DOCX, PPTX — pitch deck, business plan, etc.) |

### 7.2 AI Re-evaluation Flow

```
User edits profile field or uploads file
         ↓
Frontend sends PUT /api/profile
         ↓
Laravel saves change, dispatches AIReEvaluationJob to Redis queue
         ↓
Job runs: sends profile + documents to Claude API
         ↓
Claude returns structured recommendations per section
         ↓
Results saved to ai_recommendations table (keyed by project + section)
         ↓
Frontend refreshes AI panels (polling or websocket push)
```

---

## 8. The 6 Workspace Sections

### 8.1 Offering
Sub-sections: Value Proposition · SWOT · Solution · Future Growth · Reach

Covers what the startup offers and why it is differentiated. The Value Proposition builder and SWOT are the core interactive tools. AI suggests improvements to positioning and identifies SWOT gaps.

### 8.2 Business Model
Sub-sections: Branding · Marketing · Sales

Covers how the startup reaches and converts customers, and how it presents itself. The Lean Canvas lives here as the master business model artefact. AI highlights weak blocks and suggests channel strategies.

### 8.3 Customer
Sub-sections: Segments · Profile · Market · Journey

Covers who the customer is and how they interact with the product. Includes customer persona builder, market sizing inputs, and a customer journey map. AI suggests segment refinements and journey gaps based on the profile.

### 8.4 Money
Sub-sections: Investment · Revenue · CAC & CLV · Cashflow

Covers the financial picture. Each sub-section has structured input forms. A **Financial Statement Wizard** button opens the full-screen wizard. AI flags financial risks, suggests revenue model adjustments, and validates assumptions.

### 8.5 Assets
Sub-sections: Team · Partners · Setup · Technology

Covers what the startup has and needs. Team roster, key partnerships, operational setup, and tech stack. AI suggests critical hires and tool recommendations based on stage.

### 8.6 Action
Sub-sections: Tasks · KPIs · Research · Validation

The operational hub. Tasks and KPIs defined here are also surfaced as widgets in other sections. Research and Validation items help founders track experiments and decisions. AI suggests KPIs appropriate for the startup's stage and business model.

---

## 9. Financial Statement Wizard

Accessed from the Money section. Opens as a full-screen, step-by-step wizard.

### Steps

| Step | Content |
|---|---|
| 1 — Assumptions | Time period, currency, growth rate assumptions |
| 2 — Revenue & Costs | Revenue streams with quantities/prices, fixed & variable costs |
| 3 — Review Statements | Auto-generated Income Statement, Cash Flow Statement, Break-even |
| 4 — Export | Download as PDF or Excel |

AI assists at each step: validates assumptions, flags anomalies, and annotates the generated statements with plain-language explanations.

---

## 10. Notes System

Every section has a persistent right-side Notes panel. Notes are:

- **Context-aware:** each section has its own note set
- **Content types:** plain text, images, links, checklists
- **Always accessible:** panel can be collapsed but notes persist
- **Stored per project + section:** `notes` table with `project_id`, `section`, `content` (JSON)

---

## 11. Project Management

Projects are the top-level workspace container. A user can have multiple projects (e.g., different startup ideas).

### 11.1 Fields
- Name, logo/icon, description
- Created at, last edited at, last modified by
- Owner (user) + collaborators

### 11.2 Operations
- Create, Edit, Clone, Delete, Export (full project PDF report)

### 11.3 Collaboration
- Owner invites collaborators by email
- Roles: Owner · Editor · Viewer
- All collaborators see the same workspace; edit access controlled by role

---

## 12. Backend API (Laravel)

### 12.1 Key API Domains

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout

GET    /api/profile
PUT    /api/profile               ← triggers AI re-evaluation job
POST   /api/profile/files         ← file upload
DELETE /api/profile/files/{id}

GET    /api/projects
POST   /api/projects
GET    /api/projects/{id}
PUT    /api/projects/{id}
DELETE /api/projects/{id}
POST   /api/projects/{id}/clone
GET    /api/projects/{id}/export

GET    /api/projects/{id}/collaborators
POST   /api/projects/{id}/collaborators
DELETE /api/projects/{id}/collaborators/{userId}

GET    /api/projects/{id}/sections/{section}
PUT    /api/projects/{id}/sections/{section}

GET    /api/projects/{id}/notes/{section}
POST   /api/projects/{id}/notes/{section}
PUT    /api/projects/{id}/notes/{noteId}
DELETE /api/projects/{id}/notes/{noteId}

GET    /api/projects/{id}/ai/{section}         ← latest AI recommendations
GET    /api/projects/{id}/financial-wizard
PUT    /api/projects/{id}/financial-wizard
POST   /api/projects/{id}/financial-wizard/export

GET    /api/projects/{id}/tasks
POST   /api/projects/{id}/tasks
PUT    /api/projects/{id}/tasks/{taskId}
DELETE /api/projects/{id}/tasks/{taskId}

GET    /api/projects/{id}/kpis
POST   /api/projects/{id}/kpis
PUT    /api/projects/{id}/kpis/{kpiId}
```

### 12.2 Key Database Tables

```
users                  id, name, email, password, ...
startup_profiles       id, user_id, idea, problem, solution, customer, stage, team, traction, challenges, goals
profile_files          id, profile_id, path, type, original_name
projects               id, owner_id, name, logo, description, created_at, updated_at, last_modified_by
project_collaborators  id, project_id, user_id, role (owner|editor|viewer)
section_data           id, project_id, section, sub_section, data (JSON)
notes                  id, project_id, section, content (JSON), created_at
ai_recommendations     id, project_id, section, content (JSON), generated_at
financial_wizard_data  id, project_id, assumptions (JSON), inputs (JSON), statements (JSON)
tasks                  id, project_id, title, description, status, due_date, assigned_to
kpis                   id, project_id, name, target, current, unit, section
```

---

## 13. Admin Dashboard (Filament)

Accessible at `/admin` on the Laravel app. Admin-only auth guard.

**Manages:**
- Users (list, view, suspend, delete)
- Projects (overview, metadata)
- Platform analytics (signups, active projects, AI usage)
- File storage overview
- AI recommendation logs (for debugging)

---

## 14. AI Integration Design

- **Model:** Claude API (claude-sonnet-4-6 for recommendations, claude-haiku-4-5-20251001 for lighter tasks)
- **Input:** Startup Profile fields + parsed file content + section-specific user data
- **Output:** Structured JSON recommendations per section (stored in `ai_recommendations`)
- **Trigger events:** Profile save, profile file upload, significant section data change
- **Delivery:** Async via Redis queue. Frontend shows a "Generating recommendations..." state and refreshes when done.
- **Document parsing:** Uploaded PDFs/DOCX are parsed server-side (text extracted), text passed as context to Claude alongside profile fields.
- **Prompt caching:** System prompt and profile context are cached using Claude's prompt caching to reduce cost on repeated re-evaluations.

---

## 15. MVP Scope

All 6 sections are available from launch in a simplified form. Depth is added in subsequent iterations. The Financial Statement Wizard, AI recommendations, Notes system, and Project collaboration are all in scope for v1.

**Out of scope for v1:**
- Mobile app
- Third-party integrations (Stripe, Slack, etc.)
- Public sharing / shareable links
- Advanced analytics dashboard
- Custom branding per project
