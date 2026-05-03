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
