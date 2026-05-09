<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_regular_user_cannot_access_admin_dashboard(): void
    {
        $token = User::factory()->create(['role' => 'user'])
            ->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/admin/dashboard')
            ->assertForbidden();
    }

    public function test_admin_can_load_dashboard_payload(): void
    {
        User::factory()->create(['role' => 'user']);
        $token = User::factory()->create(['role' => 'admin'])
            ->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/admin/dashboard')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'stats' => ['workspace_members', 'staff', 'profiles_with_content'],
                    'recent_entrepreneurs',
                ],
            ]);
    }

    public function test_admin_can_list_entrepreneurs(): void
    {
        User::factory()->count(2)->create(['role' => 'user']);
        $token = User::factory()->create(['role' => 'admin'])
            ->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/admin/entrepreneurs')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }
}
