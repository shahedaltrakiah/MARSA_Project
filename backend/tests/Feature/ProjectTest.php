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
