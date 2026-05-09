# Admin Dashboard Completions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix two silent backend bugs (admin_site_permissions not saved/returned) and add a "Create Staff User" feature so super admins can create staff accounts directly from the admin dashboard.

**Architecture:** Backend fixes touch the User model and AdminUserController. New `POST /api/admin/users` endpoint added (super_admin only). Frontend adds a create-user form modal to the existing Staff page — no new pages needed.

**Tech Stack:** Laravel 11 (backend), Next.js / React 19, TypeScript, TailwindCSS

---

## File Map

### Backend (modified)
- `backend/app/Models/User.php` — add `admin_site_permissions` to `$fillable` + `array` cast
- `backend/app/Http/Controllers/Admin/AdminUserController.php` — fix `show()` + add `store()` method
- `backend/routes/api.php` — add `POST /admin/users` route

### Backend (modified tests)
- `backend/tests/Feature/Admin/AdminUserTest.php` — add tests for `admin_site_permissions` in detail + create user endpoint

### Frontend (modified)
- `frontend/components/admin/admin-messages.ts` — add create-user translation keys
- `frontend/app/admin/admins/page.tsx` — add "Create Staff" button + inline create form modal
- `frontend/types/admin.ts` — add `CreateUserPayload` type

---

## Task 1: Fix User model — admin_site_permissions fillable + cast

**Files:**
- Modify: `backend/app/Models/User.php`

The `admin_site_permissions` column exists in the DB (JSON, nullable) but is not in `$fillable` and has no `array` cast. This means `$user->update(['admin_site_permissions' => [...]])` is silently ignored and `$user->admin_site_permissions` returns a raw JSON string instead of an array.

- [ ] **Step 1: Open the file and verify the problem**

```bash
grep -n "fillable\|casts\|admin_site" backend/app/Models/User.php
```

Expected output shows `$fillable` without `admin_site_permissions` and no cast for it.

- [ ] **Step 2: Apply the fix**

Full updated `backend/app/Models/User.php`:

```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = ['name', 'email', 'password', 'role', 'admin_site_permissions'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at'       => 'datetime',
            'password'                => 'hashed',
            'admin_site_permissions'  => 'array',
        ];
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, ['admin', 'super_admin']);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function startupProfile()
    {
        return $this->hasOne(StartupProfile::class);
    }

    public function ownedProjects()
    {
        return $this->hasMany(Project::class, 'owner_id');
    }

    public function collaboratingProjects()
    {
        return $this->belongsToMany(Project::class, 'project_collaborators')
            ->withPivot('role')
            ->withTimestamps();
    }
}
```

- [ ] **Step 3: Run existing tests to confirm nothing broke**

```bash
cd backend && php artisan test tests/Feature/Admin/AdminUserTest.php
```

Expected: all tests pass (no regressions).

- [ ] **Step 4: Commit**

```bash
git add backend/app/Models/User.php
git commit -m "fix: add admin_site_permissions to User fillable and cast as array"
```

---

## Task 2: Fix AdminUserController::show() — return admin_site_permissions

**Files:**
- Modify: `backend/app/Http/Controllers/Admin/AdminUserController.php`

The `show()` method returns a manual array that omits `admin_site_permissions`. The frontend user-detail page reads this field to pre-populate the permissions checkboxes — without it the checkboxes are always empty.

- [ ] **Step 1: Write the failing test first**

Add to `backend/tests/Feature/Admin/AdminUserTest.php`:

```php
public function test_user_detail_includes_admin_site_permissions(): void
{
    $target = User::factory()->create([
        'role'                   => 'admin',
        'admin_site_permissions' => ['branding', 'hero'],
    ]);
    [, $token] = $this->userWithToken('super_admin');

    $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson("/api/admin/users/{$target->id}")
        ->assertOk()
        ->assertJsonPath('data.admin_site_permissions', ['branding', 'hero']);
}
```

- [ ] **Step 2: Run it to confirm it fails**

```bash
cd backend && php artisan test --filter test_user_detail_includes_admin_site_permissions
```

Expected: FAIL — `admin_site_permissions` key missing from response.

- [ ] **Step 3: Fix show() in AdminUserController**

Replace the `show()` method body only (keep the rest of the file intact):

```php
public function show(User $user): JsonResponse
{
    $user->loadMissing(['startupProfile', 'ownedProjects']);
    $role = $user->role ?? 'user';

    return response()->json([
        'data' => [
            'id'                      => $user->id,
            'name'                    => $user->name,
            'email'                   => $user->email,
            'role'                    => $role,
            'created_at'              => $user->created_at,
            'admin_site_permissions'  => $role === 'admin'
                ? ($user->admin_site_permissions ?? [])
                : null,
            'startup_profile' => $user->startupProfile,
            'projects' => $user->ownedProjects->map(fn ($p) => [
                'id'         => $p->id,
                'name'       => $p->name,
                'created_at' => $p->created_at,
            ]),
        ],
    ]);
}
```

- [ ] **Step 4: Run the new test**

```bash
cd backend && php artisan test --filter test_user_detail_includes_admin_site_permissions
```

Expected: PASS.

- [ ] **Step 5: Run full admin test suite**

```bash
cd backend && php artisan test tests/Feature/Admin/
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add backend/app/Http/Controllers/Admin/AdminUserController.php \
        backend/tests/Feature/Admin/AdminUserTest.php
git commit -m "fix: return admin_site_permissions in user detail response"
```

---

## Task 3: Add POST /api/admin/users — create staff user

**Files:**
- Modify: `backend/app/Http/Controllers/Admin/AdminUserController.php` — add `store()` method
- Modify: `backend/routes/api.php` — register route
- Modify: `backend/tests/Feature/Admin/AdminUserTest.php` — add tests

Only `super_admin` may create new users. The endpoint accepts `name`, `email`, `password`, `role` (must be `admin` or `super_admin`), and optional `admin_site_permissions`.

- [ ] **Step 1: Write the failing tests**

Add to `backend/tests/Feature/Admin/AdminUserTest.php`:

```php
public function test_super_admin_can_create_staff_user(): void
{
    [, $token] = $this->userWithToken('super_admin');

    $response = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/admin/users', [
            'name'     => 'New Staff',
            'email'    => 'staff@marsa.com',
            'password' => 'Secret@123',
            'role'     => 'admin',
            'admin_site_permissions' => ['branding'],
        ])
        ->assertCreated();

    $response->assertJsonPath('data.role', 'admin');
    $response->assertJsonPath('data.admin_site_permissions', ['branding']);
    $this->assertDatabaseHas('users', ['email' => 'staff@marsa.com', 'role' => 'admin']);
}

public function test_admin_cannot_create_staff_user(): void
{
    [, $token] = $this->userWithToken('admin');

    $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/admin/users', [
            'name'     => 'Sneaky',
            'email'    => 'sneaky@marsa.com',
            'password' => 'Secret@123',
            'role'     => 'admin',
        ])
        ->assertForbidden();
}

public function test_create_user_validates_duplicate_email(): void
{
    User::factory()->create(['email' => 'taken@marsa.com']);
    [, $token] = $this->userWithToken('super_admin');

    $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/admin/users', [
            'name'     => 'Dup',
            'email'    => 'taken@marsa.com',
            'password' => 'Secret@123',
            'role'     => 'admin',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);
}

public function test_create_user_only_allows_admin_roles(): void
{
    [, $token] = $this->userWithToken('super_admin');

    $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/admin/users', [
            'name'     => 'Regular',
            'email'    => 'regular@marsa.com',
            'password' => 'Secret@123',
            'role'     => 'user',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['role']);
}
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd backend && php artisan test --filter "test_super_admin_can_create_staff_user|test_admin_cannot_create_staff_user|test_create_user_validates_duplicate_email|test_create_user_only_allows_admin_roles"
```

Expected: all FAIL (route not found → 404 or method not found).

- [ ] **Step 3: Add store() method to AdminUserController**

Add after the `show()` method:

```php
public function store(Request $request): JsonResponse
{
    $validated = $request->validate([
        'name'                    => ['required', 'string', 'max:255'],
        'email'                   => ['required', 'email', 'max:255', 'unique:users,email'],
        'password'                => ['required', 'string', 'min:8'],
        'role'                    => ['required', 'string', 'in:admin,super_admin'],
        'admin_site_permissions'  => ['sometimes', 'nullable', 'array'],
        'admin_site_permissions.*'=> ['string', 'in:branding,hero,features,pricing'],
    ]);

    $perms = null;
    if ($validated['role'] === 'admin') {
        $perms = array_values(array_unique($validated['admin_site_permissions'] ?? []));
    }

    $user = User::create([
        'name'                   => $validated['name'],
        'email'                  => $validated['email'],
        'password'               => $validated['password'],
        'role'                   => $validated['role'],
        'admin_site_permissions' => $perms,
    ]);

    return response()->json(['data' => new UserResource($user)], 201);
}
```

Note: `password` is NOT pre-hashed here — the `hashed` cast on the User model handles hashing automatically when the value is not already a hash.

- [ ] **Step 4: Register the route in api.php**

Inside the `role:super_admin` group (after the existing `patch` route), add:

```php
Route::post('/users', [AdminUserController::class, 'store']);
```

The super_admin group in `routes/api.php` should look like:

```php
Route::middleware('role:super_admin')->group(function () {
    Route::post('/users', [AdminUserController::class, 'store']);
    Route::patch('/users/{user}/role', [AdminUserController::class, 'updateRole']);
    Route::put('/site-settings', [SiteSettingsAdminController::class, 'update']);
    Route::post('/site-settings/logo', [SiteSettingsAdminController::class, 'uploadLogo']);
});
```

- [ ] **Step 5: Run the new tests**

```bash
cd backend && php artisan test --filter "test_super_admin_can_create_staff_user|test_admin_cannot_create_staff_user|test_create_user_validates_duplicate_email|test_create_user_only_allows_admin_roles"
```

Expected: all 4 PASS.

- [ ] **Step 6: Run full test suite**

```bash
cd backend && php artisan test
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add backend/app/Http/Controllers/Admin/AdminUserController.php \
        backend/routes/api.php \
        backend/tests/Feature/Admin/AdminUserTest.php
git commit -m "feat: add POST /admin/users endpoint to create staff accounts"
```

---

## Task 4: Frontend — Create Staff User form on Staff page

**Files:**
- Modify: `frontend/components/admin/admin-messages.ts` — add create-user translation keys
- Modify: `frontend/types/admin.ts` — add `CreateUserPayload` type
- Modify: `frontend/app/admin/admins/page.tsx` — add "Create staff" button + inline modal form

The Staff page already shows the admin/super_admin user list. We add a "Create staff" button in the page header that opens a modal form with: Name, Email, Password, Role (admin | super_admin), and Site permissions checkboxes (when role = admin).

- [ ] **Step 1: Add translation keys to admin-messages.ts**

Add the following keys to the `AdminMsg` type and both `en` and `ar` message objects:

New keys to add to `AdminMsg` type (after `staffPageHint`):
```ts
createStaffBtn: string
createStaffTitle: string
createStaffHint: string
fieldName: string
fieldEmail: string
fieldPassword: string
fieldRole: string
createStaffSubmit: string
createStaffSuccess: string
```

New `en` values (add after `staffPageHint`):
```ts
createStaffBtn: "Create staff account",
createStaffTitle: "New staff account",
createStaffHint: "Creates a login for a staff member. They can log in at /admin/login.",
fieldName: "Full name",
fieldEmail: "Email address",
fieldPassword: "Password",
fieldRole: "Role",
createStaffSubmit: "Create account",
createStaffSuccess: "Account created.",
```

New `ar` values (add after `staffPageHint`):
```ts
createStaffBtn: "إنشاء حساب موظف",
createStaffTitle: "حساب موظف جديد",
createStaffHint: "ينشئ بيانات دخول لعضو الطاقم. يمكنهم تسجيل الدخول عبر /admin/login.",
fieldName: "الاسم الكامل",
fieldEmail: "البريد الإلكتروني",
fieldPassword: "كلمة المرور",
fieldRole: "الدور",
createStaffSubmit: "إنشاء الحساب",
createStaffSuccess: "تم إنشاء الحساب.",
```

- [ ] **Step 2: Add CreateUserPayload type to types/admin.ts**

Append to `frontend/types/admin.ts`:

```ts
export interface CreateUserPayload {
  name: string
  email: string
  password: string
  role: 'admin' | 'super_admin'
  admin_site_permissions?: string[]
}
```

- [ ] **Step 3: Replace admins/page.tsx with version including the create form**

Full replacement for `frontend/app/admin/admins/page.tsx`:

```tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { useAdminI18n } from "@/components/admin/AdminI18nContext"
import { useAuthContext } from "@/contexts/AuthContext"
import api from "@/lib/api"
import type { AdminUser } from "@/types/admin"
import type { CreateUserPayload } from "@/types/admin"
import type { AdminSiteSection } from "@/types/api"

const SITE_SECTIONS: AdminSiteSection[] = ["branding", "hero", "features", "pricing"]

function CreateStaffModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (user: AdminUser) => void
}) {
  const { t } = useAdminI18n()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"admin" | "super_admin">("admin")
  const [perms, setPerms] = useState<AdminSiteSection[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function togglePerm(s: AdminSiteSection) {
    setPerms((prev) => (prev.includes(s) ? prev.filter((p) => p !== s) : [...prev, s]))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const payload: CreateUserPayload = { name, email, password, role }
      if (role === "admin") payload.admin_site_permissions = perms
      const res = await api.post<{ data: AdminUser }>("/admin/users", payload)
      onCreated(res.data.data)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })
          ?.response?.data?.errors
          ? Object.values(
              (err as { response: { data: { errors: Record<string, string[]> } } }).response.data
                .errors
            )
              .flat()
              .join(" ")
          : "Failed to create account."
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
        <h2 className="mb-1 text-lg font-semibold">{t.createStaffTitle}</h2>
        <p className="mb-5 text-sm text-muted-foreground">{t.createStaffHint}</p>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">{t.fieldName}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={saving}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t.fieldEmail}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={saving}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t.fieldPassword}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={saving}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t.fieldRole}</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "admin" | "super_admin")}
              disabled={saving}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50"
            >
              <option value="admin">admin</option>
              <option value="super_admin">super_admin</option>
            </select>
          </div>

          {role === "admin" && (
            <div className="rounded-md border bg-muted/30 p-3">
              <p className="mb-2 text-xs text-muted-foreground">{t.siteAccessHint}</p>
              <div className="space-y-1.5">
                {SITE_SECTIONS.map((s) => (
                  <label key={s} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={perms.includes(s)}
                      onChange={() => togglePerm(s)}
                      disabled={saving}
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>
          )}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {saving ? "Creating…" : t.createStaffSubmit}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminStaffPage() {
  const { t } = useAdminI18n()
  const { user: currentUser } = useAuthContext()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const router = useRouter()

  async function fetchAdmins(page = 1) {
    setLoading(true)
    try {
      const res = await api.get(`/admin/users?scope=admins&page=${page}`)
      setUsers(res.data.data)
      setMeta(res.data.meta)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchAdmins(1)
  }, [])

  function handleCreated(user: AdminUser) {
    setShowCreate(false)
    setSuccessMsg(t.createStaffSuccess)
    setUsers((prev) => [user, ...prev])
    setTimeout(() => setSuccessMsg(""), 4000)
  }

  const roleBadgeClass = (role: string) => {
    if (role === "super_admin")
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
    if (role === "admin") return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
  }

  const isSuperAdmin = currentUser?.role === "super_admin"

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t.navStaff}</h1>
          {successMsg ? (
            <p className="mt-1 text-sm text-green-600 dark:text-green-400">{successMsg}</p>
          ) : null}
        </div>
        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t.createStaffBtn}
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-muted-foreground">Loading…</div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Role</th>
                  <th className="px-4 py-3 text-left font-medium">Joined</th>
                  <th className="px-4 py-3 text-left font-medium">Projects</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="cursor-pointer border-t transition-colors hover:bg-muted/30"
                    onClick={() => router.push(`/admin/users/${u.id}`)}
                  >
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${roleBadgeClass(u.role)}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">{u.project_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta.last_page > 1 && (
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                disabled={meta.current_page === 1}
                onClick={() => void fetchAdmins(meta.current_page - 1)}
                className="rounded border px-3 py-1 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {meta.current_page} of {meta.last_page}
              </span>
              <button
                type="button"
                disabled={meta.current_page === meta.last_page}
                onClick={() => void fetchAdmins(meta.current_page + 1)}
                className="rounded border px-3 py-1 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {showCreate && (
        <CreateStaffModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run TypeScript check**

```bash
cd frontend && npx tsc --noEmit 2>&1 | grep -E "admin|Error" | head -20
```

Expected: no errors in admin files.

- [ ] **Step 5: Commit**

```bash
git add frontend/components/admin/admin-messages.ts \
        frontend/types/admin.ts \
        frontend/app/admin/admins/page.tsx
git commit -m "feat: add create staff user form to admin staff page"
```

---

## Self-Review

**Spec coverage:**
1. ✅ Fix `admin_site_permissions` not saving — Task 1 (User model fillable + cast)
2. ✅ Fix `admin_site_permissions` not returned in detail — Task 2 (show() fix)
3. ✅ Create staff account — Task 3 (backend) + Task 4 (frontend)
4. ✅ Role management works end-to-end — permissions save and display correctly after Tasks 1–2

**Placeholder scan:** No TBDs, TODOs, or vague steps found.

**Type consistency:**
- `AdminUser` type used in `admins/page.tsx` has `id, name, email, role, project_count, created_at` — matches what `POST /admin/users` returns via `UserResource`
- `UserResource` returns `admin_site_permissions` for `admin` role — matches `AdminUser` detail type
- `CreateUserPayload` type matches the `store()` validation rules exactly
