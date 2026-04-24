# Backend Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Laravel 11 REST API backend with PostgreSQL, Redis, authentication, startup profile management, project CRUD, and project collaboration — the complete data foundation for the MARSA platform.

**Architecture:** Laravel 11 pure API (no Blade) with Sanctum token auth. All endpoints return JSON. A stub AIReEvaluationJob is dispatched on profile save but does nothing yet — wired up in Plan 4. File uploads use Laravel's local disk (S3-switchable via config). PostgreSQL is the primary DB; Redis handles queues and cache.

**Tech Stack:** PHP 8.2+, Laravel 11, PostgreSQL 15+, Redis 7+, Laravel Sanctum, PHPUnit (via `php artisan test`)

---

## Directory Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/AuthController.php
│   │   │   ├── ProfileController.php
│   │   │   ├── ProfileFileController.php
│   │   │   ├── ProjectController.php
│   │   │   └── ProjectCollaboratorController.php
│   │   ├── Requests/
│   │   │   ├── Auth/RegisterRequest.php
│   │   │   ├── Auth/LoginRequest.php
│   │   │   ├── UpdateProfileRequest.php
│   │   │   ├── StoreProjectRequest.php
│   │   │   ├── UpdateProjectRequest.php
│   │   │   └── StoreCollaboratorRequest.php
│   │   └── Resources/
│   │       ├── UserResource.php
│   │       ├── ProfileResource.php
│   │       ├── ProfileFileResource.php
│   │       ├── ProjectResource.php
│   │       └── ProjectCollaboratorResource.php
│   ├── Jobs/
│   │   └── AIReEvaluationJob.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── StartupProfile.php
│   │   ├── ProfileFile.php
│   │   ├── Project.php
│   │   └── ProjectCollaborator.php
│   └── Policies/
│       └── ProjectPolicy.php
├── database/migrations/
│   ├── 2026_04_25_000001_create_startup_profiles_table.php
│   ├── 2026_04_25_000002_create_profile_files_table.php
│   ├── 2026_04_25_000003_create_projects_table.php
│   └── 2026_04_25_000004_create_project_collaborators_table.php
├── routes/api.php
├── config/cors.php (modify)
└── tests/Feature/
    ├── Auth/AuthTest.php
    ├── ProfileTest.php
    ├── ProfileFileTest.php
    ├── ProjectTest.php
    └── ProjectCollaboratorTest.php
```

---

## Task 1: Laravel Project Scaffold

**Files:**
- Create: `backend/` (Laravel project root)
- Modify: `backend/.env`
- Modify: `backend/config/cors.php`
- Modify: `backend/bootstrap/app.php`

- [ ] **Step 1: Create the Laravel project**

```bash
cd /path/to/MARSA_Project
composer create-project laravel/laravel backend "^11.0"
cd backend
```

Expected: `Application ready! Build something amazing.`

- [ ] **Step 2: Install Sanctum and required packages**

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

Expected: Files published to `config/sanctum.php` and migrations.

- [ ] **Step 3: Configure `.env` for PostgreSQL and Redis**

Edit `backend/.env`:

```dotenv
APP_NAME=MARSA
APP_ENV=local
APP_KEY=  # leave blank — filled by next step
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=marsa
DB_USERNAME=postgres
DB_PASSWORD=your_password

CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

FILESYSTEM_DISK=local
```

- [ ] **Step 4: Generate app key**

```bash
php artisan key:generate
```

Expected: `Application key set successfully.`

- [ ] **Step 5: Create the PostgreSQL database**

```bash
psql -U postgres -c "CREATE DATABASE marsa;"
```

Expected: `CREATE DATABASE`

- [ ] **Step 6: Configure CORS to allow Next.js (localhost:3000)**

Edit `backend/config/cors.php`:

```php
<?php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

- [ ] **Step 7: Register Sanctum middleware in `bootstrap/app.php`**

Edit `backend/bootstrap/app.php` — add `EnsureFrontendRequestsAreStateful` and API middleware:

```php
<?php
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api(prepend: [
            EnsureFrontendRequestsAreStateful::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
```

- [ ] **Step 8: Configure PHPUnit to use a separate test database**

Edit `backend/phpunit.xml` — set the `DB_DATABASE` env for tests:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="vendor/phpunit/phpunit/phpunit.xsd"
         bootstrap="vendor/autoload.php"
         colors="true">
    <testsuites>
        <testsuite name="Unit">
            <directory>tests/Unit</directory>
        </testsuite>
        <testsuite name="Feature">
            <directory>tests/Feature</directory>
        </testsuite>
    </testsuites>
    <source>
        <include>
            <directory>app</directory>
        </include>
    </source>
    <php>
        <env name="APP_ENV" value="testing"/>
        <env name="BCRYPT_ROUNDS" value="4"/>
        <env name="CACHE_STORE" value="array"/>
        <env name="QUEUE_CONNECTION" value="sync"/>
        <env name="SESSION_DRIVER" value="array"/>
        <env name="DB_DATABASE" value="marsa_test"/>
    </php>
</phpunit>
```

- [ ] **Step 9: Create the test database**

```bash
psql -U postgres -c "CREATE DATABASE marsa_test;"
```

Expected: `CREATE DATABASE`

- [ ] **Step 10: Verify Laravel boots**

```bash
php artisan migrate
php artisan test
```

Expected: All default tests pass.

- [ ] **Step 11: Commit**

```bash
git add backend/
git commit -m "feat: scaffold Laravel 11 backend with PostgreSQL, Redis, Sanctum"
```

---

## Task 2: Database Migrations

**Files:**
- Create: `backend/database/migrations/2026_04_25_000001_create_startup_profiles_table.php`
- Create: `backend/database/migrations/2026_04_25_000002_create_profile_files_table.php`
- Create: `backend/database/migrations/2026_04_25_000003_create_projects_table.php`
- Create: `backend/database/migrations/2026_04_25_000004_create_project_collaborators_table.php`

- [ ] **Step 1: Create the startup_profiles migration**

```bash
php artisan make:migration create_startup_profiles_table
```

Edit the generated file (`database/migrations/..._create_startup_profiles_table.php`):

```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('startup_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete()->unique();
            $table->text('idea')->nullable();
            $table->text('problem')->nullable();
            $table->text('solution')->nullable();
            $table->text('customer')->nullable();
            $table->enum('stage', ['idea', 'validation', 'mvp', 'early_traction', 'scaling'])->nullable();
            $table->text('team')->nullable();
            $table->text('traction')->nullable();
            $table->text('challenges')->nullable();
            $table->text('goals')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('startup_profiles');
    }
};
```

- [ ] **Step 2: Create the profile_files migration**

```bash
php artisan make:migration create_profile_files_table
```

Edit:

```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('profile_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('profile_id')->constrained('startup_profiles')->cascadeOnDelete();
            $table->string('original_name');
            $table->string('path');
            $table->string('mime_type');
            $table->unsignedBigInteger('size');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profile_files');
    }
};
```

- [ ] **Step 3: Create the projects migration**

```bash
php artisan make:migration create_projects_table
```

Edit:

```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('last_modified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('logo')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
```

- [ ] **Step 4: Create the project_collaborators migration**

```bash
php artisan make:migration create_project_collaborators_table
```

Edit:

```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('project_collaborators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('role', ['owner', 'editor', 'viewer'])->default('viewer');
            $table->timestamps();
            $table->unique(['project_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_collaborators');
    }
};
```

- [ ] **Step 5: Run migrations**

```bash
php artisan migrate
```

Expected: All 4 new tables created with no errors.

- [ ] **Step 6: Commit**

```bash
git add database/migrations/
git commit -m "feat: add startup_profiles, profile_files, projects, project_collaborators migrations"
```

---

## Task 3: Models & Relationships

**Files:**
- Modify: `backend/app/Models/User.php`
- Create: `backend/app/Models/StartupProfile.php`
- Create: `backend/app/Models/ProfileFile.php`
- Create: `backend/app/Models/Project.php`
- Create: `backend/app/Models/ProjectCollaborator.php`

- [ ] **Step 1: Update `User` model**

Edit `backend/app/Models/User.php`:

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

    protected $fillable = ['name', 'email', 'password'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
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

- [ ] **Step 2: Create `StartupProfile` model**

```bash
php artisan make:model StartupProfile
```

Edit `backend/app/Models/StartupProfile.php`:

```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StartupProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'idea', 'problem', 'solution', 'customer',
        'stage', 'team', 'traction', 'challenges', 'goals',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function files()
    {
        return $this->hasMany(ProfileFile::class, 'profile_id');
    }
}
```

- [ ] **Step 3: Create `ProfileFile` model**

```bash
php artisan make:model ProfileFile
```

Edit `backend/app/Models/ProfileFile.php`:

```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProfileFile extends Model
{
    use HasFactory;

    protected $fillable = ['profile_id', 'original_name', 'path', 'mime_type', 'size'];
}
```

- [ ] **Step 4: Create `Project` model**

```bash
php artisan make:model Project
```

Edit `backend/app/Models/Project.php`:

```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = ['owner_id', 'last_modified_by', 'name', 'logo', 'description'];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function lastModifiedBy()
    {
        return $this->belongsTo(User::class, 'last_modified_by');
    }

    public function collaborators()
    {
        return $this->belongsToMany(User::class, 'project_collaborators')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function isOwnedBy(User $user): bool
    {
        return $this->owner_id === $user->id;
    }

    public function hasCollaborator(User $user): bool
    {
        return $this->collaborators()->where('user_id', $user->id)->exists();
    }

    public function getCollaboratorRole(User $user): ?string
    {
        $collaborator = $this->collaborators()->where('user_id', $user->id)->first();
        return $collaborator?->pivot->role;
    }
}
```

- [ ] **Step 5: Create `ProjectCollaborator` model**

```bash
php artisan make:model ProjectCollaborator
```

Edit `backend/app/Models/ProjectCollaborator.php`:

```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectCollaborator extends Model
{
    protected $fillable = ['project_id', 'user_id', 'role'];
}
```

- [ ] **Step 6: Commit**

```bash
git add app/Models/
git commit -m "feat: add StartupProfile, ProfileFile, Project, ProjectCollaborator models with relationships"
```

---

## Task 4: API Resources

**Files:**
- Create: `backend/app/Http/Resources/UserResource.php`
- Create: `backend/app/Http/Resources/ProfileResource.php`
- Create: `backend/app/Http/Resources/ProfileFileResource.php`
- Create: `backend/app/Http/Resources/ProjectResource.php`
- Create: `backend/app/Http/Resources/ProjectCollaboratorResource.php`

- [ ] **Step 1: Create `UserResource`**

```bash
php artisan make:resource UserResource
```

Edit `backend/app/Http/Resources/UserResource.php`:

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
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'created_at' => $this->created_at,
        ];
    }
}
```

- [ ] **Step 2: Create `ProfileFileResource`**

```bash
php artisan make:resource ProfileFileResource
```

Edit `backend/app/Http/Resources/ProfileFileResource.php`:

```php
<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProfileFileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'original_name' => $this->original_name,
            'mime_type' => $this->mime_type,
            'size' => $this->size,
            'created_at' => $this->created_at,
        ];
    }
}
```

- [ ] **Step 3: Create `ProfileResource`**

```bash
php artisan make:resource ProfileResource
```

Edit `backend/app/Http/Resources/ProfileResource.php`:

```php
<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'idea' => $this->idea,
            'problem' => $this->problem,
            'solution' => $this->solution,
            'customer' => $this->customer,
            'stage' => $this->stage,
            'team' => $this->team,
            'traction' => $this->traction,
            'challenges' => $this->challenges,
            'goals' => $this->goals,
            'files' => ProfileFileResource::collection($this->whenLoaded('files')),
            'updated_at' => $this->updated_at,
        ];
    }
}
```

- [ ] **Step 4: Create `ProjectResource`**

```bash
php artisan make:resource ProjectResource
```

Edit `backend/app/Http/Resources/ProjectResource.php`:

```php
<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'logo' => $this->logo,
            'description' => $this->description,
            'owner' => new UserResource($this->whenLoaded('owner')),
            'last_modified_by' => new UserResource($this->whenLoaded('lastModifiedBy')),
            'collaborators' => ProjectCollaboratorResource::collection($this->whenLoaded('collaborators')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

- [ ] **Step 5: Create `ProjectCollaboratorResource`**

```bash
php artisan make:resource ProjectCollaboratorResource
```

Edit `backend/app/Http/Resources/ProjectCollaboratorResource.php`:

```php
<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectCollaboratorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->pivot->role,
        ];
    }
}
```

- [ ] **Step 6: Commit**

```bash
git add app/Http/Resources/
git commit -m "feat: add API resources for User, Profile, Project, Collaborator"
```

---

## Task 5: Authentication Endpoints (TDD)

**Files:**
- Create: `backend/app/Http/Requests/Auth/RegisterRequest.php`
- Create: `backend/app/Http/Requests/Auth/LoginRequest.php`
- Create: `backend/app/Http/Controllers/Auth/AuthController.php`
- Modify: `backend/routes/api.php`
- Create: `backend/tests/Feature/Auth/AuthTest.php`

- [ ] **Step 1: Write the failing auth tests**

Create `backend/tests/Feature/Auth/AuthTest.php`:

```php
<?php
namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['user' => ['id', 'name', 'email'], 'token']);

        $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
        $this->assertDatabaseHas('startup_profiles', [
            'user_id' => $response->json('user.id'),
        ]);
    }

    public function test_register_fails_with_duplicate_email(): void
    {
        User::factory()->create(['email' => 'test@example.com']);

        $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertStatus(422)->assertJsonValidationErrors(['email']);
    }

    public function test_user_can_login(): void
    {
        $user = User::factory()->create(['password' => bcrypt('password123')]);

        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password123',
        ])->assertStatus(200)->assertJsonStructure(['user', 'token']);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ])->assertStatus(422);
    }

    public function test_user_can_logout(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/auth/logout')
            ->assertStatus(200);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
php artisan test tests/Feature/Auth/AuthTest.php
```

Expected: FAIL — routes not found (404).

- [ ] **Step 3: Create `RegisterRequest`**

```bash
mkdir -p app/Http/Requests/Auth
```

Create `backend/app/Http/Requests/Auth/RegisterRequest.php`:

```php
<?php
namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }
}
```

- [ ] **Step 4: Create `LoginRequest`**

Create `backend/app/Http/Requests/Auth/LoginRequest.php`:

```php
<?php
namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }
}
```

- [ ] **Step 5: Create `AuthController`**

```bash
mkdir -p app/Http/Controllers/Auth
```

Create `backend/app/Http/Controllers/Auth/AuthController.php`:

```php
<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $user->startupProfile()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }
}
```

- [ ] **Step 6: Register routes in `api.php`**

Edit `backend/routes/api.php`:

```php
<?php
use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
});
```

- [ ] **Step 7: Run tests to verify they pass**

```bash
php artisan test tests/Feature/Auth/AuthTest.php
```

Expected: 5 tests, 5 passed.

- [ ] **Step 8: Commit**

```bash
git add app/Http/Controllers/Auth/ app/Http/Requests/Auth/ routes/api.php tests/Feature/Auth/
git commit -m "feat: add auth endpoints (register, login, logout) with tests"
```

---

## Task 6: Startup Profile Endpoints (TDD)

**Files:**
- Create: `backend/app/Http/Requests/UpdateProfileRequest.php`
- Create: `backend/app/Http/Controllers/ProfileController.php`
- Create: `backend/app/Jobs/AIReEvaluationJob.php`
- Modify: `backend/routes/api.php`
- Create: `backend/tests/Feature/ProfileTest.php`

- [ ] **Step 1: Write failing profile tests**

Create `backend/tests/Feature/ProfileTest.php`:

```php
<?php
namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsUser(): array
    {
        $user = User::factory()->create();
        $user->startupProfile()->create();
        $token = $user->createToken('test')->plainTextToken;
        return [$user, $token];
    }

    public function test_authenticated_user_can_get_their_profile(): void
    {
        [$user, $token] = $this->actingAsUser();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/profile')
            ->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['id', 'idea', 'problem', 'solution', 'stage', 'files'],
            ]);
    }

    public function test_unauthenticated_user_cannot_get_profile(): void
    {
        $this->getJson('/api/profile')->assertStatus(401);
    }

    public function test_user_can_update_their_profile(): void
    {
        [$user, $token] = $this->actingAsUser();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson('/api/profile', [
                'idea' => 'An AI-powered platform for startups',
                'problem' => 'Founders lack structured tools',
                'stage' => 'idea',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.idea', 'An AI-powered platform for startups')
            ->assertJsonPath('data.stage', 'idea');
    }

    public function test_stage_must_be_valid_enum(): void
    {
        [$user, $token] = $this->actingAsUser();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson('/api/profile', ['stage' => 'invalid_stage'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['stage']);
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
php artisan test tests/Feature/ProfileTest.php
```

Expected: FAIL — routes not found.

- [ ] **Step 3: Create `AIReEvaluationJob` stub**

```bash
php artisan make:job AIReEvaluationJob
```

Edit `backend/app/Jobs/AIReEvaluationJob.php`:

```php
<?php
namespace App\Jobs;

use App\Models\StartupProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class AIReEvaluationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly StartupProfile $profile) {}

    public function handle(): void
    {
        // Stub — AI integration implemented in Plan 4
    }
}
```

- [ ] **Step 4: Create `UpdateProfileRequest`**

Create `backend/app/Http/Requests/UpdateProfileRequest.php`:

```php
<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'idea' => ['nullable', 'string'],
            'problem' => ['nullable', 'string'],
            'solution' => ['nullable', 'string'],
            'customer' => ['nullable', 'string'],
            'stage' => ['nullable', Rule::in(['idea', 'validation', 'mvp', 'early_traction', 'scaling'])],
            'team' => ['nullable', 'string'],
            'traction' => ['nullable', 'string'],
            'challenges' => ['nullable', 'string'],
            'goals' => ['nullable', 'string'],
        ];
    }
}
```

- [ ] **Step 5: Create `ProfileController`**

Create `backend/app/Http/Controllers/ProfileController.php`:

```php
<?php
namespace App\Http\Controllers;

use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\ProfileResource;
use App\Jobs\AIReEvaluationJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $profile = $request->user()->startupProfile()->with('files')->firstOrCreate();
        return response()->json(['data' => new ProfileResource($profile)]);
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $profile = $request->user()->startupProfile()->with('files')->firstOrCreate();
        $profile->update($request->validated());

        AIReEvaluationJob::dispatch($profile);

        return response()->json(['data' => new ProfileResource($profile)]);
    }
}
```

- [ ] **Step 6: Add profile routes to `api.php`**

Add inside authenticated middleware group in `backend/routes/api.php`:

```php
<?php
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
});
```

- [ ] **Step 7: Run tests to verify they pass**

```bash
php artisan test tests/Feature/ProfileTest.php
```

Expected: 4 tests, 4 passed.

- [ ] **Step 8: Commit**

```bash
git add app/Http/Controllers/ProfileController.php app/Http/Requests/UpdateProfileRequest.php app/Jobs/AIReEvaluationJob.php routes/api.php tests/Feature/ProfileTest.php
git commit -m "feat: add startup profile endpoints with AI re-evaluation job stub"
```

---

## Task 7: Profile File Uploads (TDD)

**Files:**
- Create: `backend/app/Http/Controllers/ProfileFileController.php`
- Modify: `backend/routes/api.php`
- Create: `backend/tests/Feature/ProfileFileTest.php`

- [ ] **Step 1: Write failing file upload tests**

Create `backend/tests/Feature/ProfileFileTest.php`:

```php
<?php
namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileFileTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsUser(): array
    {
        $user = User::factory()->create();
        $user->startupProfile()->create();
        $token = $user->createToken('test')->plainTextToken;
        return [$user, $token];
    }

    public function test_user_can_upload_a_profile_file(): void
    {
        Storage::fake('local');
        [$user, $token] = $this->actingAsUser();
        $file = UploadedFile::fake()->create('pitch-deck.pdf', 500, 'application/pdf');

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/profile/files', ['file' => $file]);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'original_name', 'mime_type', 'size']]);

        $this->assertDatabaseHas('profile_files', ['original_name' => 'pitch-deck.pdf']);
    }

    public function test_upload_requires_a_file(): void
    {
        [$user, $token] = $this->actingAsUser();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/profile/files', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    public function test_upload_only_accepts_pdf_docx_pptx(): void
    {
        [$user, $token] = $this->actingAsUser();
        $file = UploadedFile::fake()->create('image.png', 100, 'image/png');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/profile/files', ['file' => $file])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    public function test_user_can_delete_their_profile_file(): void
    {
        Storage::fake('local');
        [$user, $token] = $this->actingAsUser();
        $file = UploadedFile::fake()->create('plan.pdf', 200, 'application/pdf');

        $uploadResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/profile/files', ['file' => $file]);

        $fileId = $uploadResponse->json('data.id');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/profile/files/{$fileId}")
            ->assertStatus(200);

        $this->assertDatabaseMissing('profile_files', ['id' => $fileId]);
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
php artisan test tests/Feature/ProfileFileTest.php
```

Expected: FAIL — routes not found.

- [ ] **Step 3: Create `ProfileFileController`**

Create `backend/app/Http/Controllers/ProfileFileController.php`:

```php
<?php
namespace App\Http\Controllers;

use App\Http\Resources\ProfileFileResource;
use App\Models\ProfileFile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\File;

class ProfileFileController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => [
                'required',
                File::types(['pdf', 'docx', 'pptx'])->max(20 * 1024),
            ],
        ]);

        $profile = $request->user()->startupProfile()->firstOrCreate();
        $uploaded = $request->file('file');
        $path = $uploaded->store("profile-files/{$profile->id}", 'local');

        $file = $profile->files()->create([
            'original_name' => $uploaded->getClientOriginalName(),
            'path' => $path,
            'mime_type' => $uploaded->getMimeType(),
            'size' => $uploaded->getSize(),
        ]);

        return response()->json(['data' => new ProfileFileResource($file)], 201);
    }

    public function destroy(Request $request, ProfileFile $profileFile): JsonResponse
    {
        $profile = $request->user()->startupProfile;
        abort_if($profileFile->profile_id !== $profile?->id, 403);

        Storage::disk('local')->delete($profileFile->path);
        $profileFile->delete();

        return response()->json(['message' => 'File deleted']);
    }
}
```

- [ ] **Step 4: Add file routes to `api.php`**

Inside the `auth:sanctum` middleware group, add:

```php
Route::post('/profile/files', [ProfileFileController::class, 'store']);
Route::delete('/profile/files/{profileFile}', [ProfileFileController::class, 'destroy']);
```

Add import at top: `use App\Http\Controllers\ProfileFileController;`

- [ ] **Step 5: Run tests to verify they pass**

```bash
php artisan test tests/Feature/ProfileFileTest.php
```

Expected: 4 tests, 4 passed.

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/ProfileFileController.php routes/api.php tests/Feature/ProfileFileTest.php
git commit -m "feat: add profile file upload and delete endpoints"
```

---

## Task 8: Project CRUD & Clone (TDD)

**Files:**
- Create: `backend/app/Http/Requests/StoreProjectRequest.php`
- Create: `backend/app/Http/Requests/UpdateProjectRequest.php`
- Create: `backend/app/Http/Controllers/ProjectController.php`
- Create: `backend/app/Policies/ProjectPolicy.php`
- Modify: `backend/routes/api.php`
- Create: `backend/tests/Feature/ProjectTest.php`

- [ ] **Step 1: Write failing project tests**

Create `backend/tests/Feature/ProjectTest.php`:

```php
<?php
namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectTest extends TestCase
{
    use RefreshDatabase;

    private function userWithToken(): array
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;
        return [$user, $token];
    }

    public function test_user_can_create_a_project(): void
    {
        [$user, $token] = $this->userWithToken();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/projects', [
                'name' => 'My Startup',
                'description' => 'An awesome idea',
            ])
            ->assertStatus(201)
            ->assertJsonPath('data.name', 'My Startup')
            ->assertJsonPath('data.owner.id', $user->id);

        $this->assertDatabaseHas('projects', ['name' => 'My Startup', 'owner_id' => $user->id]);
    }

    public function test_user_can_list_their_projects(): void
    {
        [$user, $token] = $this->userWithToken();
        Project::factory()->count(3)->create(['owner_id' => $user->id]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/projects');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_user_can_get_a_single_project(): void
    {
        [$user, $token] = $this->userWithToken();
        $project = Project::factory()->create(['owner_id' => $user->id]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/projects/{$project->id}")
            ->assertStatus(200)
            ->assertJsonPath('data.id', $project->id);
    }

    public function test_user_cannot_view_another_users_project(): void
    {
        [$user, $token] = $this->userWithToken();
        $other = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $other->id]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/projects/{$project->id}")
            ->assertStatus(403);
    }

    public function test_user_can_update_their_project(): void
    {
        [$user, $token] = $this->userWithToken();
        $project = Project::factory()->create(['owner_id' => $user->id]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/projects/{$project->id}", ['name' => 'Updated Name'])
            ->assertStatus(200)
            ->assertJsonPath('data.name', 'Updated Name');
    }

    public function test_user_can_delete_their_project(): void
    {
        [$user, $token] = $this->userWithToken();
        $project = Project::factory()->create(['owner_id' => $user->id]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/projects/{$project->id}")
            ->assertStatus(200);

        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
    }

    public function test_user_can_clone_a_project(): void
    {
        [$user, $token] = $this->userWithToken();
        $project = Project::factory()->create(['owner_id' => $user->id, 'name' => 'Original']);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/projects/{$project->id}/clone")
            ->assertStatus(201)
            ->assertJsonPath('data.name', 'Original (Copy)');

        $this->assertDatabaseCount('projects', 2);
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
php artisan test tests/Feature/ProjectTest.php
```

Expected: FAIL — routes not found.

- [ ] **Step 3: Create `Project` factory**

```bash
php artisan make:factory ProjectFactory --model=Project
```

Edit `backend/database/factories/ProjectFactory.php`:

```php
<?php
namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectFactory extends Factory
{
    public function definition(): array
    {
        return [
            'owner_id' => User::factory(),
            'name' => $this->faker->company(),
            'description' => $this->faker->sentence(),
        ];
    }
}
```

- [ ] **Step 4: Create `StoreProjectRequest` and `UpdateProjectRequest`**

Create `backend/app/Http/Requests/StoreProjectRequest.php`:

```php
<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'logo' => ['nullable', 'string', 'max:500'],
        ];
    }
}
```

Create `backend/app/Http/Requests/UpdateProjectRequest.php`:

```php
<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'logo' => ['nullable', 'string', 'max:500'],
        ];
    }
}
```

- [ ] **Step 5: Create `ProjectPolicy`**

```bash
php artisan make:policy ProjectPolicy --model=Project
```

Edit `backend/app/Policies/ProjectPolicy.php`:

```php
<?php
namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function view(User $user, Project $project): bool
    {
        return $project->isOwnedBy($user) || $project->hasCollaborator($user);
    }

    public function update(User $user, Project $project): bool
    {
        if ($project->isOwnedBy($user)) return true;
        return in_array($project->getCollaboratorRole($user), ['editor']);
    }

    public function delete(User $user, Project $project): bool
    {
        return $project->isOwnedBy($user);
    }
}
```

- [ ] **Step 6: Create `ProjectController`**

Create `backend/app/Http/Controllers/ProjectController.php`:

```php
<?php
namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $projects = Project::where('owner_id', $request->user()->id)
            ->orWhereHas('collaborators', fn($q) => $q->where('user_id', $request->user()->id))
            ->with(['owner', 'lastModifiedBy'])
            ->get();

        return response()->json(['data' => ProjectResource::collection($projects)]);
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $project = Project::create([
            ...$request->validated(),
            'owner_id' => $request->user()->id,
        ]);

        return response()->json(['data' => new ProjectResource($project->load('owner'))], 201);
    }

    public function show(Request $request, Project $project): JsonResponse
    {
        $this->authorize('view', $project);
        return response()->json(['data' => new ProjectResource($project->load(['owner', 'lastModifiedBy', 'collaborators']))]);
    }

    public function update(UpdateProjectRequest $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);
        $project->update([...$request->validated(), 'last_modified_by' => $request->user()->id]);
        return response()->json(['data' => new ProjectResource($project->load(['owner', 'lastModifiedBy']))]);
    }

    public function destroy(Request $request, Project $project): JsonResponse
    {
        $this->authorize('delete', $project);
        $project->delete();
        return response()->json(['message' => 'Project deleted']);
    }

    public function clone(Request $request, Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $clone = $project->replicate();
        $clone->name = $project->name . ' (Copy)';
        $clone->owner_id = $request->user()->id;
        $clone->last_modified_by = null;
        $clone->save();

        return response()->json(['data' => new ProjectResource($clone->load('owner'))], 201);
    }
}
```

- [ ] **Step 7: Register project routes in `api.php`**

Inside the `auth:sanctum` group, add:

```php
Route::get('/projects', [ProjectController::class, 'index']);
Route::post('/projects', [ProjectController::class, 'store']);
Route::get('/projects/{project}', [ProjectController::class, 'show']);
Route::put('/projects/{project}', [ProjectController::class, 'update']);
Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);
Route::post('/projects/{project}/clone', [ProjectController::class, 'clone']);
```

Add import: `use App\Http\Controllers\ProjectController;`

- [ ] **Step 8: Run tests to verify they pass**

```bash
php artisan test tests/Feature/ProjectTest.php
```

Expected: 7 tests, 7 passed.

- [ ] **Step 9: Commit**

```bash
git add app/Http/Controllers/ProjectController.php app/Http/Requests/StoreProjectRequest.php app/Http/Requests/UpdateProjectRequest.php app/Policies/ProjectPolicy.php database/factories/ProjectFactory.php routes/api.php tests/Feature/ProjectTest.php
git commit -m "feat: add project CRUD and clone endpoints with policy authorization"
```

---

## Task 9: Project Collaborators (TDD)

**Files:**
- Create: `backend/app/Http/Requests/StoreCollaboratorRequest.php`
- Create: `backend/app/Http/Controllers/ProjectCollaboratorController.php`
- Modify: `backend/routes/api.php`
- Create: `backend/tests/Feature/ProjectCollaboratorTest.php`

- [ ] **Step 1: Write failing collaborator tests**

Create `backend/tests/Feature/ProjectCollaboratorTest.php`:

```php
<?php
namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectCollaboratorTest extends TestCase
{
    use RefreshDatabase;

    private function ownerWithProject(): array
    {
        $owner = User::factory()->create();
        $token = $owner->createToken('test')->plainTextToken;
        $project = Project::factory()->create(['owner_id' => $owner->id]);
        return [$owner, $token, $project];
    }

    public function test_owner_can_list_collaborators(): void
    {
        [$owner, $token, $project] = $this->ownerWithProject();
        $collaborator = User::factory()->create();
        $project->collaborators()->attach($collaborator->id, ['role' => 'editor']);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/projects/{$project->id}/collaborators")
            ->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_owner_can_invite_collaborator_by_email(): void
    {
        [$owner, $token, $project] = $this->ownerWithProject();
        $invitee = User::factory()->create(['email' => 'invitee@example.com']);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/projects/{$project->id}/collaborators", [
                'email' => 'invitee@example.com',
                'role' => 'editor',
            ])
            ->assertStatus(201);

        $this->assertDatabaseHas('project_collaborators', [
            'project_id' => $project->id,
            'user_id' => $invitee->id,
            'role' => 'editor',
        ]);
    }

    public function test_invite_fails_if_email_not_registered(): void
    {
        [$owner, $token, $project] = $this->ownerWithProject();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/projects/{$project->id}/collaborators", [
                'email' => 'nobody@example.com',
                'role' => 'viewer',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_owner_can_remove_collaborator(): void
    {
        [$owner, $token, $project] = $this->ownerWithProject();
        $collaborator = User::factory()->create();
        $project->collaborators()->attach($collaborator->id, ['role' => 'viewer']);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/projects/{$project->id}/collaborators/{$collaborator->id}")
            ->assertStatus(200);

        $this->assertDatabaseMissing('project_collaborators', [
            'project_id' => $project->id,
            'user_id' => $collaborator->id,
        ]);
    }

    public function test_non_owner_cannot_invite_collaborator(): void
    {
        $project = Project::factory()->create();
        $other = User::factory()->create();
        $token = $other->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/projects/{$project->id}/collaborators", [
                'email' => 'someone@example.com',
                'role' => 'viewer',
            ])
            ->assertStatus(403);
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
php artisan test tests/Feature/ProjectCollaboratorTest.php
```

Expected: FAIL — routes not found.

- [ ] **Step 3: Create `StoreCollaboratorRequest`**

Create `backend/app/Http/Requests/StoreCollaboratorRequest.php`:

```php
<?php
namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCollaboratorRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'email' => [
                'required',
                'email',
                Rule::exists('users', 'email'),
            ],
            'role' => ['required', Rule::in(['editor', 'viewer'])],
        ];
    }

    public function messages(): array
    {
        return [
            'email.exists' => 'No registered user found with this email address.',
        ];
    }
}
```

- [ ] **Step 4: Create `ProjectCollaboratorController`**

Create `backend/app/Http/Controllers/ProjectCollaboratorController.php`:

```php
<?php
namespace App\Http\Controllers;

use App\Http\Requests\StoreCollaboratorRequest;
use App\Http\Resources\ProjectCollaboratorResource;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectCollaboratorController extends Controller
{
    public function index(Request $request, Project $project): JsonResponse
    {
        $this->authorize('view', $project);
        return response()->json([
            'data' => ProjectCollaboratorResource::collection($project->collaborators),
        ]);
    }

    public function store(StoreCollaboratorRequest $request, Project $project): JsonResponse
    {
        $this->authorize('delete', $project); // only owner can manage collaborators

        $invitee = User::where('email', $request->email)->first();

        $project->collaborators()->syncWithoutDetaching([
            $invitee->id => ['role' => $request->role],
        ]);

        return response()->json(['message' => 'Collaborator added'], 201);
    }

    public function destroy(Request $request, Project $project, User $user): JsonResponse
    {
        $this->authorize('delete', $project);
        $project->collaborators()->detach($user->id);
        return response()->json(['message' => 'Collaborator removed']);
    }
}
```

- [ ] **Step 5: Add collaborator routes to `api.php`**

Inside the `auth:sanctum` group, add:

```php
Route::get('/projects/{project}/collaborators', [ProjectCollaboratorController::class, 'index']);
Route::post('/projects/{project}/collaborators', [ProjectCollaboratorController::class, 'store']);
Route::delete('/projects/{project}/collaborators/{user}', [ProjectCollaboratorController::class, 'destroy']);
```

Add import: `use App\Http\Controllers\ProjectCollaboratorController;`

- [ ] **Step 6: Run tests to verify they pass**

```bash
php artisan test tests/Feature/ProjectCollaboratorTest.php
```

Expected: 5 tests, 5 passed.

- [ ] **Step 7: Run the full test suite**

```bash
php artisan test
```

Expected: All tests pass with no errors.

- [ ] **Step 8: Commit**

```bash
git add app/Http/Controllers/ProjectCollaboratorController.php app/Http/Requests/StoreCollaboratorRequest.php routes/api.php tests/Feature/ProjectCollaboratorTest.php
git commit -m "feat: add project collaborator invite, list, and remove endpoints"
```

---

## Task 10: Final Wiring & Smoke Test

**Files:**
- Modify: `backend/routes/api.php` (verify complete)

- [ ] **Step 1: Verify the complete route list**

```bash
php artisan route:list --path=api
```

Expected output includes all of these paths:
```
POST   api/auth/register
POST   api/auth/login
POST   api/auth/logout
GET    api/profile
PUT    api/profile
POST   api/profile/files
DELETE api/profile/files/{profileFile}
GET    api/projects
POST   api/projects
GET    api/projects/{project}
PUT    api/projects/{project}
DELETE api/projects/{project}
POST   api/projects/{project}/clone
GET    api/projects/{project}/collaborators
POST   api/projects/{project}/collaborators
DELETE api/projects/{project}/collaborators/{user}
```

- [ ] **Step 2: Run full test suite**

```bash
php artisan test --coverage
```

Expected: All tests pass.

- [ ] **Step 3: Start the dev server and verify it responds**

```bash
php artisan serve
curl http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"t@t.com","password":"password123","password_confirmation":"password123"}'
```

Expected: `{"user":{...},"token":"..."}`

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "feat: complete backend foundation — auth, profile, files, projects, collaborators"
```

---

## Summary

After completing all tasks you will have:

- A running Laravel 11 API at `http://localhost:8000`
- 16 REST endpoints fully tested (36 tests total)
- PostgreSQL database with 6 tables
- Redis queue wired with an AIReEvaluationJob stub (ready for Plan 4)
- File upload to local disk (S3-ready via config change)
- Sanctum token auth with CORS configured for Next.js on port 3000
- Project ownership/collaboration with role-based policy authorization
