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
