# Admin Dashboard + Dynamic Site — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a two-tier admin system (admin / super_admin) with a read-only user dashboard and a full site content editor, making the marketing site dynamically driven by the backend.

**Architecture:** `role` enum on users, `site_settings` + `content_blocks` tables, `CheckRole` middleware, public `GET /api/site` endpoint consumed by Next.js server components with 60s revalidation, dedicated `/admin` frontend layout.

**Tech Stack:** Laravel 11, PHPUnit, Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui, next-intl.

---

## File Map

**Backend — create:**
- `backend/database/migrations/2026_05_02_200000_add_role_to_users_table.php`
- `backend/database/migrations/2026_05_02_200001_create_site_settings_table.php`
- `backend/database/migrations/2026_05_02_200002_create_content_blocks_table.php`
- `backend/app/Models/SiteSettings.php`
- `backend/app/Models/ContentBlock.php`
- `backend/app/Http/Middleware/CheckRole.php`
- `backend/app/Http/Controllers/SiteController.php`
- `backend/app/Http/Controllers/Admin/AdminUserController.php`
- `backend/app/Http/Controllers/Admin/SiteSettingsAdminController.php`
- `backend/app/Http/Controllers/Admin/ContentBlockController.php`
- `backend/tests/Feature/SiteControllerTest.php`
- `backend/tests/Feature/Admin/AdminUserTest.php`
- `backend/tests/Feature/Admin/SiteSettingsAdminTest.php`
- `backend/tests/Feature/Admin/ContentBlockTest.php`

**Backend — modify:**
- `backend/app/Models/User.php` — add `role` to fillable + casts + `isAdmin()`/`isSuperAdmin()` helpers
- `backend/app/Http/Resources/UserResource.php` — add `role` field
- `backend/bootstrap/app.php` — alias `CheckRole` middleware
- `backend/routes/api.php` — add all new routes

**Frontend — create:**
- `frontend/types/admin.ts`
- `frontend/app/admin/layout.tsx`
- `frontend/app/admin/page.tsx`
- `frontend/app/admin/users/page.tsx`
- `frontend/app/admin/users/[id]/page.tsx`
- `frontend/app/admin/site/branding/page.tsx`
- `frontend/app/admin/site/hero/page.tsx`
- `frontend/app/admin/site/features/page.tsx`
- `frontend/app/admin/site/pricing/page.tsx`
- `frontend/components/admin/AdminSidebar.tsx`

**Frontend — modify:**
- `frontend/middleware.ts` — protect `/admin/*` routes
- `frontend/lib/auth.ts` — include `role` in stored user cookie
- `frontend/contexts/AuthContext.tsx` — expose `role` from user
- `frontend/app/layout.tsx` — fetch `GET /api/site`, inject brand color `<style>` tag
- `frontend/app/[locale]/(marketing)/page.tsx` — consume dynamic blocks
- `frontend/app/[locale]/(marketing)/features/page.tsx` — consume dynamic blocks
- `frontend/app/[locale]/(marketing)/pricing/page.tsx` — consume dynamic blocks

---

## Task 1: Database migrations

**Files:**
- Create: `backend/database/migrations/2026_05_02_200000_add_role_to_users_table.php`
- Create: `backend/database/migrations/2026_05_02_200001_create_site_settings_table.php`
- Create: `backend/database/migrations/2026_05_02_200002_create_content_blocks_table.php`

- [ ] **Step 1: Create the three migration files**

```bash
cd backend
php artisan make:migration add_role_to_users_table
php artisan make:migration create_site_settings_table
php artisan make:migration create_content_blocks_table
```

- [ ] **Step 2: Write `add_role_to_users_table` migration**

```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['user', 'admin', 'super_admin'])
                  ->default('user')
                  ->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
```

- [ ] **Step 3: Write `create_site_settings_table` migration**

```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('logo_url')->nullable();
            $table->string('primary_color', 7)->default('#002d62');
            $table->string('secondary_color', 7)->default('#00c4cc');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};
```

- [ ] **Step 4: Write `create_content_blocks_table` migration**

```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('content_blocks', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->json('content');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_blocks');
    }
};
```

- [ ] **Step 5: Run migrations and verify**

```bash
php artisan migrate
php artisan migrate:status
```

Expected: all three new migrations show `Ran`.

- [ ] **Step 6: Commit**

```bash
git add database/migrations/
git commit -m "feat: add role to users, create site_settings and content_blocks tables"
```

---

## Task 2: Models + User update

**Files:**
- Create: `backend/app/Models/SiteSettings.php`
- Create: `backend/app/Models/ContentBlock.php`
- Modify: `backend/app/Models/User.php`
- Modify: `backend/app/Http/Resources/UserResource.php`

- [ ] **Step 1: Create `SiteSettings` model**

```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSettings extends Model
{
    protected $fillable = ['logo_url', 'primary_color', 'secondary_color'];

    public static function current(): self
    {
        return static::firstOrCreate([], [
            'primary_color'   => '#002d62',
            'secondary_color' => '#00c4cc',
        ]);
    }
}
```

- [ ] **Step 2: Create `ContentBlock` model**

```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContentBlock extends Model
{
    protected $fillable = ['key', 'content'];

    protected function casts(): array
    {
        return ['content' => 'array'];
    }
}
```

- [ ] **Step 3: Update `User` model**

Replace the existing `User.php` with:

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

    protected $fillable = ['name', 'email', 'password', 'role'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
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

- [ ] **Step 4: Update `UserResource` to expose `role`**

```php
<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'email'      => $this->email,
            'role'       => $this->role ?? 'user',
            'created_at' => $this->created_at,
        ];
    }
}
```

- [ ] **Step 5: Commit**

```bash
git add app/Models/SiteSettings.php app/Models/ContentBlock.php app/Models/User.php app/Http/Resources/UserResource.php
git commit -m "feat: add SiteSettings and ContentBlock models, add role to User"
```

---

## Task 3: CheckRole middleware

**Files:**
- Create: `backend/app/Http/Middleware/CheckRole.php`
- Modify: `backend/bootstrap/app.php`

- [ ] **Step 1: Write the failing test**

Create `backend/tests/Feature/Admin/AdminUserTest.php`:

```php
<?php
namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserTest extends TestCase
{
    use RefreshDatabase;

    private function userWithToken(string $role = 'user'): array
    {
        $user = User::factory()->create(['role' => $role]);
        $token = $user->createToken('test')->plainTextToken;
        return [$user, $token];
    }

    public function test_regular_user_cannot_access_admin_user_list(): void
    {
        [, $token] = $this->userWithToken('user');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/users')
            ->assertForbidden();
    }

    public function test_admin_can_access_user_list(): void
    {
        [, $token] = $this->userWithToken('admin');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/users')
            ->assertOk();
    }

    public function test_super_admin_can_access_user_list(): void
    {
        [, $token] = $this->userWithToken('super_admin');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/users')
            ->assertOk();
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
php artisan test tests/Feature/Admin/AdminUserTest.php --no-coverage
```

Expected: FAIL — route not found (404).

- [ ] **Step 3: Create `CheckRole` middleware**

```php
<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! in_array($user->role, $roles)) {
            abort(403, 'Insufficient permissions.');
        }

        return $next($request);
    }
}
```

- [ ] **Step 4: Register alias in `bootstrap/app.php`**

Add inside `->withMiddleware(function (Middleware $middleware) {`:

```php
$middleware->alias([
    'role' => \App\Http\Middleware\CheckRole::class,
]);
```

- [ ] **Step 5: Commit**

```bash
git add app/Http/Middleware/CheckRole.php bootstrap/app.php
git commit -m "feat: add CheckRole middleware with role alias"
```

---

## Task 4: Public GET /api/site endpoint

**Files:**
- Create: `backend/app/Http/Controllers/SiteController.php`
- Create: `backend/tests/Feature/SiteControllerTest.php`
- Modify: `backend/routes/api.php`

- [ ] **Step 1: Write failing tests**

Create `backend/tests/Feature/SiteControllerTest.php`:

```php
<?php
namespace Tests\Feature;

use App\Models\ContentBlock;
use App\Models\SiteSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SiteControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_site_endpoint_is_public(): void
    {
        $this->getJson('/api/site')->assertOk();
    }

    public function test_returns_default_settings_when_none_saved(): void
    {
        $response = $this->getJson('/api/site')->assertOk();

        $this->assertSame('#002d62', $response->json('settings.primary_color'));
        $this->assertSame('#00c4cc', $response->json('settings.secondary_color'));
        $this->assertNull($response->json('settings.logo_url'));
    }

    public function test_returns_saved_settings(): void
    {
        SiteSettings::create([
            'primary_color'   => '#ff0000',
            'secondary_color' => '#00ff00',
            'logo_url'        => 'https://example.com/logo.png',
        ]);

        $response = $this->getJson('/api/site')->assertOk();

        $this->assertSame('#ff0000', $response->json('settings.primary_color'));
        $this->assertSame('https://example.com/logo.png', $response->json('settings.logo_url'));
    }

    public function test_returns_default_blocks_when_none_saved(): void
    {
        $response = $this->getJson('/api/site')->assertOk();

        $response->assertJsonStructure([
            'blocks' => ['hero', 'features', 'pricing_free', 'pricing_pro', 'pricing_team'],
        ]);
        $this->assertNotEmpty($response->json('blocks.hero.en.badge'));
    }

    public function test_returns_saved_block_over_default(): void
    {
        ContentBlock::create([
            'key'     => 'hero',
            'content' => ['en' => ['badge' => 'Custom Badge'], 'ar' => ['badge' => 'شارة مخصصة']],
        ]);

        $response = $this->getJson('/api/site')->assertOk();

        $this->assertSame('Custom Badge', $response->json('blocks.hero.en.badge'));
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
php artisan test tests/Feature/SiteControllerTest.php --no-coverage
```

Expected: FAIL — route not found.

- [ ] **Step 3: Create `SiteController`**

```php
<?php
namespace App\Http\Controllers;

use App\Models\ContentBlock;
use App\Models\SiteSettings;
use Illuminate\Http\JsonResponse;

class SiteController extends Controller
{
    private const DEFAULTS = [
        'hero' => [
            'en' => [
                'badge'          => 'MARSA — your startup workspace',
                'headline_start' => 'Go from idea to execution with a',
                'headline_end'   => ' workspace.',
                'subtitle'       => 'Build your offering, map your business model, track runway, and ship weekly — with guided prompts and a single source of truth for your startup.',
                'cta_primary'    => 'Start free',
                'cta_secondary'  => 'Talk to us',
            ],
            'ar' => [
                'badge'          => 'مارسا — مساحة عملك لريادة الأعمال',
                'headline_start' => 'من الفكرة إلى التنفيذ مع ',
                'headline_end'   => '٫',
                'subtitle'       => 'ابنِ عرضك، وضِح نموذج عملك، تتبع المدى المالي، ونفّذ أسبوعيًا — مع إرشادات موجهة ومصدر واحد للحقيقة لمشروعك الناشئ.',
                'cta_primary'    => 'ابدأ مجانًا',
                'cta_secondary'  => 'تحدث معنا',
            ],
        ],
        'features' => [
            'en' => [
                ['title' => 'Idea validation',        'description' => 'Turn your idea into testable assumptions. Capture hypotheses, experiments, learnings, and next decisions.', 'bullets' => ['Assumption tracking', 'Experiment planning', 'Decision notes']],
                ['title' => 'Business model builder', 'description' => 'Structure your offering, pricing, channels, costs, and customer segments. Keep everything connected and clear.', 'bullets' => ['Value proposition', 'Channels + pricing', 'Cost structure']],
                ['title' => 'Financial wizard',       'description' => 'Plan runway and scenarios without spreadsheet chaos. Make financial decisions grounded and repeatable.', 'bullets' => ['Runway planning', 'Assumptions & scenarios', 'Targets & milestones']],
                ['title' => 'Task management',        'description' => 'Transform strategy into weekly actions. Keep execution aligned with the model and goals you set.', 'bullets' => ['Weekly planning', 'Outcome focus', 'Simple prioritization']],
                ['title' => 'AI recommendations',     'description' => 'Get context-aware suggestions, next steps, and prompts that reduce decision fatigue as you build.', 'bullets' => ['Next-step prompts', 'Clarity questions', 'Workflow guidance']],
                ['title' => 'Trust & security',       'description' => 'A clean, modern foundation designed for SaaS reliability.', 'bullets' => ['Role-ready layout', 'Consistent UI system', 'Future-proof structure']],
            ],
            'ar' => [
                ['title' => 'التحقق من الفكرة',         'description' => 'حوّل فكرتك إلى افتراضات قابلة للاختبار.', 'bullets' => ['تتبع الافتراضات', 'تخطيط التجارب', 'ملاحظات القرار']],
                ['title' => 'بناء نموذج العمل',          'description' => 'هيّئ عرضك والتسعير والقنوات والتكاليف والشرائح.', 'bullets' => ['عرض القيمة', 'القنوات والتسعير', 'هيكل التكلفة']],
                ['title' => 'المعالج المالي',             'description' => 'خطط للمدى والسيناريوهات دون فوضى جداول.', 'bullets' => ['تخطيط المدى', 'الافتراضات والسيناريوهات', 'الأهداف والمعالم']],
                ['title' => 'إدارة المهام',               'description' => 'حوّل الاستراتيجية إلى إجراءات أسبوعية.', 'bullets' => ['التخطيط الأسبوعي', 'التركيع على النتائج', 'أولويات بسيطة']],
                ['title' => 'توصيات الذكاء الاصطناعي',   'description' => 'احصل على اقتراحات وخطوات تالية وأسئلة.', 'bullets' => ['اقتراحات للخطوة التالية', 'أسئلة توضيحية', 'إرشاد سير العمل']],
                ['title' => 'الثقة والأمان',               'description' => 'أساس حديث لموثوقية SaaS.', 'bullets' => ['تخطيط جاهز للأدوار', 'واجهة متسقة', 'هيكل قابل للتوسع']],
            ],
        ],
        'pricing_free' => [
            'en' => ['name' => 'Free',        'price' => '$0',  'description' => 'Start with structure and clarity.',                    'features' => ['1 project', 'Core framework', 'Notes panel', 'Theme switching']],
            'ar' => ['name' => 'مجاني',       'price' => '$0',  'description' => 'ابدأ بهيكلية ووضوح.',                                  'features' => ['مشروع واحد', 'إطار أساسي', 'لوحة ملاحظات', 'تبديل السمة']],
        ],
        'pricing_pro' => [
            'en' => ['name' => 'Pro',         'price' => '$19', 'description' => 'For founders building weekly momentum.',               'features' => ['Unlimited projects', 'Financial wizard', 'AI recommendations', 'Priority updates']],
            'ar' => ['name' => 'احترافي',     'price' => '$19', 'description' => 'للمؤسسين الذين يبنون زخمًا أسبوعيًا.',               'features' => ['مشاريع غير محدودة', 'معالج مالي', 'توصيات ذكاء اصطناعي', 'تحديثات أولوية']],
        ],
        'pricing_team' => [
            'en' => ['name' => 'Team',        'price' => '$49', 'description' => 'For early teams collaborating end-to-end.',            'features' => ['Collaboration', 'Roles & permissions', 'Shared dashboards', 'Admin controls']],
            'ar' => ['name' => 'فريق',        'price' => '$49', 'description' => 'للفرق المبكرة التي تتعاون من البداية للنهاية.',       'features' => ['تعاون', 'أدوار وصلاحيات', 'لوحات مشتركة', 'تحكم إداري']],
        ],
    ];

    public function index(): JsonResponse
    {
        $settings = SiteSettings::first();
        $saved    = ContentBlock::all()->keyBy('key');

        $blocks = [];
        foreach (array_keys(self::DEFAULTS) as $key) {
            $blocks[$key] = $saved->has($key) ? $saved[$key]->content : self::DEFAULTS[$key];
        }

        return response()->json([
            'settings' => [
                'logo_url'        => $settings?->logo_url,
                'primary_color'   => $settings?->primary_color  ?? '#002d62',
                'secondary_color' => $settings?->secondary_color ?? '#00c4cc',
            ],
            'blocks' => $blocks,
        ]);
    }
}
```

- [ ] **Step 4: Add route to `routes/api.php`** (before the auth group)

```php
Route::get('/site', [SiteController::class, 'index']);
```

Also add the import at the top:
```php
use App\Http\Controllers\SiteController;
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
php artisan test tests/Feature/SiteControllerTest.php --no-coverage
```

Expected: 5 passed.

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/SiteController.php tests/Feature/SiteControllerTest.php routes/api.php
git commit -m "feat: add public GET /api/site endpoint with defaults"
```

---

## Task 5: Admin user endpoints

**Files:**
- Create: `backend/app/Http/Controllers/Admin/AdminUserController.php`
- Modify: `backend/tests/Feature/Admin/AdminUserTest.php` (expand)
- Modify: `backend/routes/api.php`

- [ ] **Step 1: Expand `AdminUserTest.php` with full tests**

Replace the file with:

```php
<?php
namespace Tests\Feature\Admin;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserTest extends TestCase
{
    use RefreshDatabase;

    private function userWithToken(string $role = 'user'): array
    {
        $user = User::factory()->create(['role' => $role]);
        $token = $user->createToken('test')->plainTextToken;
        return [$user, $token];
    }

    public function test_regular_user_cannot_access_admin_user_list(): void
    {
        [, $token] = $this->userWithToken('user');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/users')
            ->assertForbidden();
    }

    public function test_admin_can_list_users(): void
    {
        User::factory()->count(3)->create();
        [, $token] = $this->userWithToken('admin');

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/users')
            ->assertOk();

        $this->assertArrayHasKey('data', $response->json());
    }

    public function test_user_list_includes_project_count(): void
    {
        $owner = User::factory()->create(['role' => 'user']);
        Project::factory()->count(2)->create(['owner_id' => $owner->id]);

        [, $token] = $this->userWithToken('admin');

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/users')
            ->assertOk();

        $users = collect($response->json('data'));
        $found = $users->firstWhere('id', $owner->id);
        $this->assertSame(2, $found['project_count']);
    }

    public function test_admin_can_view_user_detail(): void
    {
        $target = User::factory()->create();
        $target->startupProfile()->create();
        [, $token] = $this->userWithToken('admin');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/admin/users/{$target->id}")
            ->assertOk()
            ->assertJsonStructure(['data' => ['id', 'name', 'email', 'startup_profile', 'projects']]);
    }

    public function test_super_admin_can_change_user_role(): void
    {
        $target = User::factory()->create(['role' => 'user']);
        [, $token] = $this->userWithToken('super_admin');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/admin/users/{$target->id}/role", ['role' => 'admin'])
            ->assertOk()
            ->assertJsonPath('data.role', 'admin');

        $this->assertDatabaseHas('users', ['id' => $target->id, 'role' => 'admin']);
    }

    public function test_admin_cannot_change_user_role(): void
    {
        $target = User::factory()->create(['role' => 'user']);
        [, $token] = $this->userWithToken('admin');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/admin/users/{$target->id}/role", ['role' => 'admin'])
            ->assertForbidden();
    }

    public function test_role_change_validates_allowed_values(): void
    {
        $target = User::factory()->create();
        [, $token] = $this->userWithToken('super_admin');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/admin/users/{$target->id}/role", ['role' => 'hacker'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['role']);
    }
}
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
php artisan test tests/Feature/Admin/AdminUserTest.php --no-coverage
```

Expected: FAIL — route not found.

- [ ] **Step 3: Create `AdminUserController`**

```php
<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::withCount('ownedProjects as project_count')
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => $users->map(fn($u) => [
                'id'            => $u->id,
                'name'          => $u->name,
                'email'         => $u->email,
                'role'          => $u->role ?? 'user',
                'project_count' => $u->project_count,
                'created_at'    => $u->created_at,
            ]),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
                'total'        => $users->total(),
            ],
        ]);
    }

    public function show(User $user): JsonResponse
    {
        $user->loadMissing(['startupProfile', 'ownedProjects']);

        return response()->json([
            'data' => [
                'id'              => $user->id,
                'name'            => $user->name,
                'email'           => $user->email,
                'role'            => $user->role ?? 'user',
                'created_at'      => $user->created_at,
                'startup_profile' => $user->startupProfile,
                'projects'        => $user->ownedProjects->map(fn($p) => [
                    'id'         => $p->id,
                    'name'       => $p->name,
                    'created_at' => $p->created_at,
                ]),
            ],
        ]);
    }

    public function updateRole(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'role' => ['required', 'string', 'in:user,admin,super_admin'],
        ]);

        $user->update(['role' => $validated['role']]);

        return response()->json(['data' => new UserResource($user->fresh())]);
    }
}
```

- [ ] **Step 4: Add admin routes to `routes/api.php`**

Add imports:
```php
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\SiteSettingsAdminController;
use App\Http\Controllers\Admin\ContentBlockController;
```

Add route group (inside the `auth:sanctum` middleware group):
```php
Route::prefix('admin')->group(function () {
    // Admin + super_admin
    Route::middleware('role:admin,super_admin')->group(function () {
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::get('/users/{user}', [AdminUserController::class, 'show']);
    });

    // Super admin only
    Route::middleware('role:super_admin')->group(function () {
        Route::patch('/users/{user}/role', [AdminUserController::class, 'updateRole']);
        Route::put('/site-settings', [SiteSettingsAdminController::class, 'update']);
        Route::post('/site-settings/logo', [SiteSettingsAdminController::class, 'uploadLogo']);
        Route::put('/content-blocks/{key}', [ContentBlockController::class, 'update']);
    });
});
```

- [ ] **Step 5: Run tests**

```bash
php artisan test tests/Feature/Admin/AdminUserTest.php --no-coverage
```

Expected: 7 passed.

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/Admin/AdminUserController.php tests/Feature/Admin/AdminUserTest.php routes/api.php
git commit -m "feat: add admin user list, detail, and role change endpoints"
```

---

## Task 6: Super admin site-settings + content-blocks endpoints

**Files:**
- Create: `backend/app/Http/Controllers/Admin/SiteSettingsAdminController.php`
- Create: `backend/app/Http/Controllers/Admin/ContentBlockController.php`
- Create: `backend/tests/Feature/Admin/SiteSettingsAdminTest.php`
- Create: `backend/tests/Feature/Admin/ContentBlockTest.php`

- [ ] **Step 1: Write failing tests for site settings**

Create `backend/tests/Feature/Admin/SiteSettingsAdminTest.php`:

```php
<?php
namespace Tests\Feature\Admin;

use App\Models\SiteSettings;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SiteSettingsAdminTest extends TestCase
{
    use RefreshDatabase;

    private function token(string $role): string
    {
        return User::factory()->create(['role' => $role])
            ->createToken('test')->plainTextToken;
    }

    public function test_super_admin_can_update_colors(): void
    {
        $this->withHeader('Authorization', 'Bearer ' . $this->token('super_admin'))
            ->putJson('/api/admin/site-settings', [
                'primary_color'   => '#123456',
                'secondary_color' => '#abcdef',
            ])
            ->assertOk()
            ->assertJsonPath('data.primary_color', '#123456');

        $this->assertDatabaseHas('site_settings', ['primary_color' => '#123456']);
    }

    public function test_admin_cannot_update_site_settings(): void
    {
        $this->withHeader('Authorization', 'Bearer ' . $this->token('admin'))
            ->putJson('/api/admin/site-settings', ['primary_color' => '#123456'])
            ->assertForbidden();
    }

    public function test_color_must_be_valid_hex(): void
    {
        $this->withHeader('Authorization', 'Bearer ' . $this->token('super_admin'))
            ->putJson('/api/admin/site-settings', ['primary_color' => 'not-a-color'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['primary_color']);
    }

    public function test_super_admin_can_upload_logo(): void
    {
        Storage::fake('public');

        $this->withHeader('Authorization', 'Bearer ' . $this->token('super_admin'))
            ->post('/api/admin/site-settings/logo', [
                'logo' => UploadedFile::fake()->image('logo.png', 200, 200),
            ])
            ->assertOk()
            ->assertJsonStructure(['data' => ['logo_url']]);

        $settings = SiteSettings::first();
        $this->assertNotNull($settings->logo_url);
    }
}
```

- [ ] **Step 2: Write failing tests for content blocks**

Create `backend/tests/Feature/Admin/ContentBlockTest.php`:

```php
<?php
namespace Tests\Feature\Admin;

use App\Models\ContentBlock;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContentBlockTest extends TestCase
{
    use RefreshDatabase;

    private function token(string $role): string
    {
        return User::factory()->create(['role' => $role])
            ->createToken('test')->plainTextToken;
    }

    public function test_super_admin_can_update_content_block(): void
    {
        $content = ['en' => ['badge' => 'New Badge'], 'ar' => ['badge' => 'شارة جديدة']];

        $this->withHeader('Authorization', 'Bearer ' . $this->token('super_admin'))
            ->putJson('/api/admin/content-blocks/hero', ['content' => $content])
            ->assertOk()
            ->assertJsonPath('data.key', 'hero');

        $this->assertDatabaseHas('content_blocks', ['key' => 'hero']);
        $this->assertSame('New Badge', ContentBlock::where('key', 'hero')->first()->content['en']['badge']);
    }

    public function test_invalid_block_key_returns_404(): void
    {
        $this->withHeader('Authorization', 'Bearer ' . $this->token('super_admin'))
            ->putJson('/api/admin/content-blocks/nonexistent', ['content' => []])
            ->assertNotFound();
    }

    public function test_admin_cannot_update_content_blocks(): void
    {
        $this->withHeader('Authorization', 'Bearer ' . $this->token('admin'))
            ->putJson('/api/admin/content-blocks/hero', ['content' => []])
            ->assertForbidden();
    }

    public function test_content_block_updates_are_reflected_in_site_endpoint(): void
    {
        ContentBlock::create([
            'key'     => 'hero',
            'content' => ['en' => ['badge' => 'Saved Badge'], 'ar' => ['badge' => 'شارة محفوظة']],
        ]);

        $this->getJson('/api/site')
            ->assertOk()
            ->assertJsonPath('blocks.hero.en.badge', 'Saved Badge');
    }
}
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
php artisan test tests/Feature/Admin/SiteSettingsAdminTest.php tests/Feature/Admin/ContentBlockTest.php --no-coverage
```

Expected: FAIL — controllers don't exist yet.

- [ ] **Step 4: Create `SiteSettingsAdminController`**

```php
<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSettings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class SiteSettingsAdminController extends Controller
{
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'primary_color'   => ['sometimes', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'secondary_color' => ['sometimes', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'logo_url'        => ['sometimes', 'nullable', 'url'],
        ]);

        $settings = SiteSettings::current();
        $settings->update($validated);

        return response()->json(['data' => $settings->fresh()]);
    }

    public function uploadLogo(Request $request): JsonResponse
    {
        $request->validate([
            'logo' => ['required', 'image', 'max:2048'],
        ]);

        $path = $request->file('logo')->store('logos', 'public');
        $url  = Storage::disk('public')->url($path);

        $settings = SiteSettings::current();
        $settings->update(['logo_url' => $url]);

        return response()->json(['data' => $settings->fresh()]);
    }
}
```

- [ ] **Step 5: Create `ContentBlockController`**

```php
<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContentBlock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContentBlockController extends Controller
{
    private const VALID_KEYS = ['hero', 'features', 'pricing_free', 'pricing_pro', 'pricing_team'];

    public function update(Request $request, string $key): JsonResponse
    {
        if (! in_array($key, self::VALID_KEYS, true)) {
            abort(404, 'Unknown content block key.');
        }

        $validated = $request->validate([
            'content' => ['required', 'array'],
        ]);

        $block = ContentBlock::updateOrCreate(
            ['key' => $key],
            ['content' => $validated['content']]
        );

        return response()->json(['data' => $block->fresh()]);
    }
}
```

- [ ] **Step 6: Run all tests**

```bash
php artisan test --no-coverage
```

Expected: all tests pass (including previous tasks).

- [ ] **Step 7: Commit**

```bash
git add app/Http/Controllers/Admin/ tests/Feature/Admin/ tests/Feature/SiteControllerTest.php
git commit -m "feat: add super admin site-settings and content-blocks endpoints"
```

---

## Task 7: Frontend — middleware + auth cookie role (Cursor)

**Files:**
- Modify: `frontend/middleware.ts`
- Modify: `frontend/lib/auth.ts`
- Modify: `frontend/contexts/AuthContext.tsx`
- Create: `frontend/types/admin.ts`

**Cursor prompt:**

```
You are working on a Next.js 14 App Router project (TypeScript, Tailwind CSS).

TASK: Extend the auth system to support admin roles and protect /admin/* routes.

1. In `lib/auth.ts`:
   The `storeUser` function already saves user to a cookie. The user object now includes a `role` field ('user' | 'admin' | 'super_admin'). No changes needed to `storeUser` itself — it already stores whatever is passed. Add a new export:
   ```ts
   export function getStoredRole(): string {
     const user = getStoredUser<{ role?: string }>()
     return user?.role ?? 'user'
   }
   ```

2. In `middleware.ts`:
   Add protection for /admin/* routes. After the existing /app check, add:
   ```ts
   if (pathname.startsWith('/admin')) {
     if (!token) {
       return NextResponse.redirect(new URL('/login', request.url))
     }
     const raw = request.cookies.get('marsa_user')?.value
     const user = raw ? JSON.parse(raw) : null
     const role = user?.role ?? 'user'
     if (!['admin', 'super_admin'].includes(role)) {
       return NextResponse.redirect(new URL('/app/projects', request.url))
     }
     return NextResponse.next()
   }
   ```

3. Create `types/admin.ts`:
   ```ts
   export type AdminRole = 'user' | 'admin' | 'super_admin'

   export interface AdminUser {
     id: number
     name: string
     email: string
     role: AdminRole
     project_count: number
     created_at: string
   }

   export interface AdminUserDetail {
     id: number
     name: string
     email: string
     role: AdminRole
     created_at: string
     startup_profile: Record<string, string | null> | null
     projects: { id: number; name: string; created_at: string }[]
   }

   export interface SiteSettingsData {
     logo_url: string | null
     primary_color: string
     secondary_color: string
   }

   export interface SiteBlock {
     en: Record<string, unknown>
     ar: Record<string, unknown>
   }

   export interface SiteData {
     settings: SiteSettingsData
     blocks: {
       hero: { en: HeroBlock; ar: HeroBlock }
       features: { en: FeatureItem[]; ar: FeatureItem[] }
       pricing_free: { en: PricingTier; ar: PricingTier }
       pricing_pro: { en: PricingTier; ar: PricingTier }
       pricing_team: { en: PricingTier; ar: PricingTier }
     }
   }

   export interface HeroBlock {
     badge: string
     headline_start: string
     headline_end: string
     subtitle: string
     cta_primary: string
     cta_secondary: string
   }

   export interface FeatureItem {
     title: string
     description: string
     bullets: string[]
   }

   export interface PricingTier {
     name: string
     price: string
     description: string
     features: string[]
   }
   ```

Run: npm run lint && npm run build — fix all errors.
```

---

## Task 8: Frontend — /admin layout + sidebar (Cursor)

**Files:**
- Create: `frontend/components/admin/AdminSidebar.tsx`
- Create: `frontend/app/admin/layout.tsx`
- Create: `frontend/app/admin/page.tsx`

**Cursor prompt:**

```
Create the /admin layout with a sidebar. No locale prefix — admin is English-only.

1. Create `components/admin/AdminSidebar.tsx`:
   - Import useAuth from @/hooks/useAuth (or @/contexts/AuthContext — check which is exported)
   - Two nav sections:
     - "Users" section (all admins): link to /admin/users (Users icon from lucide-react)
     - "Site" section (super_admin only — hide if role !== 'super_admin'):
       - Branding → /admin/site/branding (Palette icon)
       - Hero → /admin/site/hero (Type icon)
       - Features → /admin/site/features (LayoutGrid icon)
       - Pricing → /admin/site/pricing (BadgeDollarSign icon)
   - Active link: bold + primary color bg. Use usePathname() to detect active route.
   - Top of sidebar: "MARSA Admin" label + "Back to app" link → /app/projects

2. Create `app/admin/layout.tsx`:
   - "use client" — this layout reads auth context
   - Two-column layout: fixed left sidebar (w-64) + main content area (flex-1, overflow-y-auto)
   - Wraps content in <AdminSidebar /> + <main> with padding
   - No AuthProvider here — it's already in the root layout

3. Create `app/admin/page.tsx`:
   - Simple redirect: import { redirect } from 'next/navigation'; export default function AdminPage() { redirect('/admin/users') }

Run: npm run lint && npm run build.
```

---

## Task 9: Frontend — admin user pages (Cursor)

**Files:**
- Create: `frontend/app/admin/users/page.tsx`
- Create: `frontend/app/admin/users/[id]/page.tsx`

**Cursor prompt:**

```
Create the admin user list and user detail pages. Use the existing `api` client from @/lib/api for all calls (it handles Bearer token automatically).

API shapes (from the backend):
  GET /api/admin/users → { data: AdminUser[], meta: { current_page, last_page, total } }
  GET /api/admin/users/{id} → { data: AdminUserDetail }
  PATCH /api/admin/users/{id}/role → body: { role: 'user'|'admin'|'super_admin' } → { data: UserResource }

Import AdminUser, AdminUserDetail from @/types/admin.

1. `app/admin/users/page.tsx` — "use client"
   - Fetch GET /api/admin/users on mount
   - Table with columns: Name, Email, Role (badge — user=gray, admin=blue, super_admin=purple), Joined date, Projects count
   - Click row → navigate to /admin/users/{id}
   - Pagination: prev/next buttons using meta.current_page and meta.last_page
   - Loading skeleton while fetching
   - Page title: "Users"

2. `app/admin/users/[id]/page.tsx` — "use client"
   - Fetch GET /api/admin/users/{id} on mount
   - User card: name, email, role, joined date
   - Role selector (super_admin only — read the role from useAuth): <select> with options user/admin/super_admin, Save button → PATCH /api/admin/users/{id}/role
   - Startup profile section: render all non-null fields as label+value pairs in a card
   - Projects list: table with name and created_at
   - Back link → /admin/users

Run: npm run lint && npm run build.
```

---

## Task 10: Frontend — admin site editors (Cursor)

**Files:**
- Create: `frontend/app/admin/site/branding/page.tsx`
- Create: `frontend/app/admin/site/hero/page.tsx`
- Create: `frontend/app/admin/site/features/page.tsx`
- Create: `frontend/app/admin/site/pricing/page.tsx`

**Cursor prompt:**

```
Create the four super admin site editor pages. Use api from @/lib/api. All pages are "use client".

API calls:
  GET /api/site → SiteData (import from @/types/admin)
  PUT /api/admin/site-settings → body: { primary_color?, secondary_color?, logo_url? }
  POST /api/admin/site-settings/logo → multipart FormData with 'logo' file field
  PUT /api/admin/content-blocks/{key} → body: { content: object }

Load initial data from GET /api/site on mount for all four pages.

1. `app/admin/site/branding/page.tsx`
   - Title: "Branding"
   - Logo section: show current logo_url in an <img> if set, otherwise "No logo set"
   - Upload button: <input type="file" accept="image/*"> → POST /api/admin/site-settings/logo as FormData
   - Primary color: <input type="color"> + hex text input (keep in sync)
   - Secondary color: same pattern
   - Save colors button → PUT /api/admin/site-settings with { primary_color, secondary_color }
   - Success/error messages

2. `app/admin/site/hero/page.tsx`
   - Title: "Hero Section"
   - Two tabs: English | Arabic
   - Fields for each locale: Badge, Headline Start, Headline End, Subtitle, CTA Primary, CTA Secondary
   - Save button → PUT /api/admin/content-blocks/hero with { content: { en: {...}, ar: {...} } }

3. `app/admin/site/features/page.tsx`
   - Title: "Features"
   - Two tabs: English | Arabic
   - 6 feature cards, each with: Title, Description, Bullet 1, Bullet 2, Bullet 3
   - Save button → PUT /api/admin/content-blocks/features with { content: { en: [...], ar: [...] } }

4. `app/admin/site/pricing/page.tsx`
   - Title: "Pricing"
   - Two tabs: English | Arabic
   - 3 sections (Free, Pro, Team) each with: Name, Price, Description, Features (textarea — one feature per line, split by \n on save)
   - Each tier saves independently: PUT /api/admin/content-blocks/pricing_{free|pro|team}
   - Three save buttons — one per tier

Run: npm run lint && npm run build.
```

---

## Task 11: Frontend — dynamic marketing pages + brand color injection (Cursor)

**Files:**
- Modify: `frontend/app/layout.tsx`
- Modify: `frontend/app/[locale]/(marketing)/page.tsx`
- Modify: `frontend/app/[locale]/(marketing)/features/page.tsx`
- Modify: `frontend/app/[locale]/(marketing)/pricing/page.tsx`

**Cursor prompt:**

```
Make the marketing site dynamic — pull content from the backend API instead of hardcoded translation keys.

Backend URL for server-side fetching: use process.env.BACKEND_URL (e.g. http://localhost:8000) + '/api/site'.
Add BACKEND_URL=http://localhost:8000 to frontend/.env.local.

The GET /api/site response shape is defined in @/types/admin as SiteData.

1. `app/layout.tsx` — add brand color injection
   This is a React Server Component. Add a fetch at the top of the RootLayout function:
   ```ts
   const siteRes = await fetch(`${process.env.BACKEND_URL}/api/site`, {
     next: { revalidate: 60 },
   }).catch(() => null)
   const site = siteRes?.ok ? await siteRes.json() : null
   const primary = site?.settings?.primary_color ?? '#002d62'
   const secondary = site?.settings?.secondary_color ?? '#00c4cc'
   ```
   Inside <html>, add before </head> (or inside <body> before children):
   ```tsx
   <style>{`:root { --marsa-anchor-blue: ${primary}; --marsa-action-teal: ${secondary}; }`}</style>
   ```
   If site?.settings?.logo_url is set, pass it down as a prop to children via a context or server layout prop — OR just leave logo dynamic for a later iteration and only do colors now.

2. `app/[locale]/(marketing)/page.tsx` — dynamic hero + features + pricing
   This is a server component. Fetch site data:
   ```ts
   const siteRes = await fetch(`${process.env.BACKEND_URL}/api/site`, {
     next: { revalidate: 60 },
   }).catch(() => null)
   const site = siteRes?.ok ? await siteRes.json() as SiteData : null
   ```
   Pass params.locale to pick the right language: `const locale = params.locale === 'ar' ? 'ar' : 'en'`

   For the hero section: instead of `t('badge')` etc., use `site?.blocks.hero[locale].badge ?? t('badge')` (fall back to translation if API is down).

   For features: use `site?.blocks.features[locale] ?? []` — iterate to render.

   For pricing: use `site?.blocks.pricing_free[locale]` etc.

   Keep the existing page structure and className — only replace the hardcoded translation calls for hero/features/pricing with the API data.

3. `app/[locale]/(marketing)/features/page.tsx` — same pattern, only features block.

4. `app/[locale]/(marketing)/pricing/page.tsx` — same pattern, only pricing blocks.

IMPORTANT:
- Always fall back to the translation file values (t('...')) if the API fetch fails or returns null.
- Do NOT remove the getTranslations() calls — they are still needed for the fallback.
- Run: npm run lint && npm run build — fix all errors before finishing.
```

---

## Final verification

- [ ] Run full backend test suite: `php artisan test --no-coverage` — all tests pass
- [ ] Run frontend build: `npm run build` — zero errors
- [ ] Run frontend lint: `npm run lint` — zero warnings
- [ ] Commit any remaining changes

```bash
cd backend && php artisan test --no-coverage
cd ../frontend && npm run lint && npm run build
git add -A && git commit -m "feat: complete admin dashboard and dynamic site"
```
