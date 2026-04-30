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

    public function test_non_owner_cannot_remove_collaborator(): void
    {
        $project = Project::factory()->create();
        $collaborator = User::factory()->create();
        $project->collaborators()->attach($collaborator->id, ['role' => 'viewer']);

        $other = User::factory()->create();
        $token = $other->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/projects/{$project->id}/collaborators/{$collaborator->id}")
            ->assertStatus(403);

        $this->assertDatabaseHas('project_collaborators', [
            'project_id' => $project->id,
            'user_id' => $collaborator->id,
        ]);
    }

    public function test_re_inviting_existing_collaborator_updates_role(): void
    {
        [$owner, $token, $project] = $this->ownerWithProject();
        $collaborator = User::factory()->create(['email' => 'collab@example.com']);
        $project->collaborators()->attach($collaborator->id, ['role' => 'viewer']);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/projects/{$project->id}/collaborators", [
                'email' => 'collab@example.com',
                'role' => 'editor',
            ])
            ->assertStatus(201);

        $this->assertDatabaseHas('project_collaborators', [
            'project_id' => $project->id,
            'user_id' => $collaborator->id,
            'role' => 'editor',
        ]);

        $this->assertDatabaseCount('project_collaborators', 1);
    }

    public function test_owner_cannot_be_added_as_collaborator(): void
    {
        [$owner, $token, $project] = $this->ownerWithProject();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/projects/{$project->id}/collaborators", [
                'email' => $owner->email,
                'role' => 'editor',
            ])
            ->assertStatus(422);

        $this->assertDatabaseMissing('project_collaborators', [
            'project_id' => $project->id,
            'user_id' => $owner->id,
        ]);
    }
}
