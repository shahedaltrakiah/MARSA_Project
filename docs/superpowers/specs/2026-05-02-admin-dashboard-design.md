# Admin Dashboard + Dynamic Site — Design Spec

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a two-tier admin system (admin / super_admin) with a read-only user dashboard and a full site content editor, making the marketing site dynamically driven by the backend.

**Architecture:** Option A — two new database tables (`site_settings`, `content_blocks`), role column on `users`, dedicated `/admin` frontend layout, public `GET /api/site` endpoint consumed by marketing pages with 60-second revalidation.

**Tech Stack:** Laravel 11 (backend), Next.js 14 App Router (frontend), TypeScript, Tailwind CSS, shadcn/ui, next-intl (EN + AR).

---

## 1. Data Model

### 1.1 `users` table — add `role` column

```sql
ALTER TABLE users ADD COLUMN role ENUM('user','admin','super_admin') NOT NULL DEFAULT 'user';
```

Migration adds the column with default `user`. Existing users are unaffected.

### 1.2 `site_settings` table

One row, always present (seeded on first run). Never deleted.

| Column | Type | Default |
|---|---|---|
| `id` | bigint PK | — |
| `logo_url` | varchar nullable | null |
| `primary_color` | varchar(7) | `#002d62` |
| `secondary_color` | varchar(7) | `#00c4cc` |
| `updated_at` | timestamp | — |

No `created_at` — a single row, updated in place via `updateOrCreate`.

### 1.3 `content_blocks` table

One row per editable block key.

| Column | Type | Notes |
|---|---|---|
| `id` | bigint PK | — |
| `key` | varchar unique | `hero`, `features`, `pricing_free`, `pricing_pro`, `pricing_team` |
| `content` | json | typed payload — see shapes below |
| `updated_at` | timestamp | — |

**Block content shapes:**

`hero`:
```json
{
  "en": { "badge": "", "headline_start": "", "headline_end": "", "subtitle": "", "cta_primary": "", "cta_secondary": "" },
  "ar": { "badge": "", "headline_start": "", "headline_end": "", "subtitle": "", "cta_primary": "", "cta_secondary": "" }
}
```

`features`:
```json
{
  "en": [{ "title": "", "description": "", "bullets": ["", "", ""] }],
  "ar": [{ "title": "", "description": "", "bullets": ["", "", ""] }]
}
```

`pricing_free` / `pricing_pro` / `pricing_team`:
```json
{
  "en": { "name": "", "price": "", "description": "", "features": [""] },
  "ar": { "name": "", "price": "", "description": "", "features": [""] }
}
```

---

## 2. Backend — API Endpoints

### 2.1 Public endpoint

`GET /api/site` — no auth required, cached with Laravel's response cache for 60 seconds.

Response:
```json
{
  "settings": {
    "logo_url": null,
    "primary_color": "#002d62",
    "secondary_color": "#00c4cc"
  },
  "blocks": {
    "hero": { "en": { ... }, "ar": { ... } },
    "features": { "en": [...], "ar": [...] },
    "pricing_free": { "en": { ... }, "ar": { ... } },
    "pricing_pro": { "en": { ... }, "ar": { ... } },
    "pricing_team": { "en": { ... }, "ar": { ... } }
  }
}
```

If `site_settings` row doesn't exist, returns hardcoded defaults. If a `content_blocks` row doesn't exist for a key, returns hardcoded default for that block (matching current `en.json`/`ar.json` values).

### 2.2 Admin endpoints (role: admin or super_admin)

All require `auth:sanctum` + `role:admin,super_admin` middleware.

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/admin/users` | Paginated user list — id, name, email, role, created_at, project_count |
| `GET` | `/api/admin/users/{user}` | User detail — user fields + startup profile + projects list with section completion |

### 2.3 Super admin endpoints (role: super_admin only)

All require `auth:sanctum` + `role:super_admin` middleware.

| Method | Route | Description |
|---|---|---|
| `PUT` | `/api/admin/site-settings` | Update primary_color, secondary_color, logo_url |
| `POST` | `/api/admin/site-settings/logo` | Upload logo (multipart/form-data), store in public disk, save URL |
| `PUT` | `/api/admin/content-blocks/{key}` | Replace content JSON for a block key |
| `PATCH` | `/api/admin/users/{user}/role` | Set user role (user/admin/super_admin) |

### 2.4 Middleware

`CheckRole` middleware — reads `$request->user()->role`, aborts 403 if insufficient.

Applied as named middleware: `role:admin,super_admin` and `role:super_admin`.

---

## 3. Frontend — Admin Layout

### 3.1 Route structure

All routes under `app/admin/` — no locale prefix (admin is English-only).

```
app/admin/layout.tsx              → admin shell with sidebar
app/admin/page.tsx                → redirect to /admin/users
app/admin/users/page.tsx          → user list table
app/admin/users/[id]/page.tsx     → user detail
app/admin/site/branding/page.tsx  → logo + color editor (super_admin only)
app/admin/site/hero/page.tsx      → hero content editor (super_admin only)
app/admin/site/features/page.tsx  → features list editor (super_admin only)
app/admin/site/pricing/page.tsx   → pricing tiers editor (super_admin only)
```

### 3.2 Middleware protection

`middleware.ts` extended: `/admin/*` requires a valid token AND `role` of `admin` or `super_admin`. Regular users are redirected to `/app/projects`. Admin users hitting super-admin-only pages get redirected to `/admin/users`.

The `marsa_user` cookie stores `{ ..., role }` so middleware can check role without an API call.

### 3.3 Admin sidebar

Two sections:

**Users** (admin + super_admin):
- Users → `/admin/users`

**Site** (super_admin only — hidden for admin):
- Branding → `/admin/site/branding`
- Hero → `/admin/site/hero`
- Features → `/admin/site/features`
- Pricing → `/admin/site/pricing`

Role promotion is available on the user detail page (`/admin/users/[id]`) for super_admin only — a role selector dropdown with Save button.

### 3.4 Admin pages detail

**`/admin/users`**
- Table columns: Name, Email, Role badge, Joined, Projects
- Pagination (20 per page)
- Click row → navigate to `/admin/users/[id]`

**`/admin/users/[id]`**
- User card: name, email, role, joined date
- Role selector + Save button (super_admin only)
- Startup profile section: all profile fields displayed read-only
- Projects list: name, section completion %, created date

**`/admin/site/branding`**
- Current logo preview + "Upload logo" button (calls `POST /api/admin/site-settings/logo`)
- Primary color: hex text input + `<input type="color">` picker
- Secondary color: hex text input + `<input type="color">` picker
- Save button → `PUT /api/admin/site-settings`

**`/admin/site/hero`**
- Two-column layout: EN tab | AR tab (or side-by-side)
- Fields: Badge, Headline Start, Headline End, Subtitle, CTA Primary, CTA Secondary
- Save button → `PUT /api/admin/content-blocks/hero`

**`/admin/site/features`**
- 6 feature cards, each with: Title, Description, Bullet 1, Bullet 2, Bullet 3
- EN + AR tabs
- Save button → `PUT /api/admin/content-blocks/features`

**`/admin/site/pricing`**
- 3 accordions (Free, Pro, Team), each with: Name, Price, Description, Features (textarea, one per line)
- EN + AR tabs
- Each tier saves independently → `PUT /api/admin/content-blocks/pricing_{tier}`

---

## 4. Dynamic Marketing Site

### 4.1 How pages become dynamic

The root layout (`app/layout.tsx`) fetches `GET /api/site` as a server component with `next: { revalidate: 60 }`. It injects a `<style>` tag:

```html
<style>
  :root {
    --marsa-anchor-blue: {primary_color};
    --marsa-action-teal: {secondary_color};
  }
</style>
```

This overrides the hardcoded values in `globals.css` globally — affects both marketing site and the app.

If `logo_url` is set, the Topbar component receives it as a prop and renders the dynamic logo instead of the static `public/brand/` image.

### 4.2 Which pages become dynamic

| Page | Blocks consumed |
|---|---|
| `/` (home) | `hero`, `features`, `pricing_free`, `pricing_pro`, `pricing_team` |
| `/features` | `features` |
| `/pricing` | `pricing_free`, `pricing_pro`, `pricing_team` |

About, Contact, Privacy, Terms, Refund — remain hardcoded in translation files.

### 4.3 Fallback strategy

Each page receives the `blocks` object from the API. If a block's content is empty/missing, it falls back to the hardcoded defaults that match the current `en.json`/`ar.json` values. The site never shows blank content.

The API itself seeds defaults from code constants — it does not read from `en.json` at runtime.

### 4.4 Locale handling

The `GET /api/site` endpoint returns both `en` and `ar` for every block. The marketing page reads the correct locale from Next.js `params.locale` and picks `blocks.hero.en` or `blocks.hero.ar` accordingly.

---

## 5. Implementation Order

1. Backend migrations + models + `CheckRole` middleware
2. Public `GET /api/site` endpoint + defaults
3. Admin user endpoints (list + detail)
4. Super admin site-settings + content-blocks endpoints
5. Backend tests for all endpoints
6. Frontend: middleware extension for admin role checking
7. Frontend: `/admin` layout + sidebar
8. Frontend: users list + detail pages
9. Frontend: branding editor
10. Frontend: hero / features / pricing editors
11. Frontend: dynamic marketing pages (home, features, pricing)
12. Frontend: dynamic brand colors injected in root layout

---

## 6. What Claude implements vs Cursor

**Claude (backend + data layer):**
- All migrations, models, middleware
- All API controllers + routes
- All backend tests
- Frontend: middleware extension, `useAdminSite` hook, API type definitions

**Cursor (UI):**
- `/admin` layout + sidebar component
- All admin pages (users list, user detail, branding, hero, features, pricing editors)
- Updated marketing pages (home, features, pricing) consuming dynamic blocks
- Root layout style injection for brand colors
