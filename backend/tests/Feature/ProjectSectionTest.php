<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectSectionTest extends TestCase
{
    use RefreshDatabase;

    private function userWithToken(): array
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;
        return [$user, $token];
    }

    private function projectOwnedBy(User $owner): Project
    {
        return Project::factory()->create(['owner_id' => $owner->id]);
    }

    // ── GET show ─────────────────────────────────────────────────────────────

    public function test_owner_can_get_empty_section(): void
    {
        [$owner, $token] = $this->userWithToken();
        $project = $this->projectOwnedBy($owner);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/projects/{$project->id}/sections/offering")
            ->assertOk()
            ->assertJsonPath('data', []);
    }

    public function test_owner_can_get_existing_section_content(): void
    {
        [$owner, $token] = $this->userWithToken();
        $project = $this->projectOwnedBy($owner);
        $project->sections()->create([
            'section' => 'offering',
            'content' => ['value_proposition' => 'We save time.'],
            'updated_by' => $owner->id,
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/projects/{$project->id}/sections/offering")
            ->assertOk()
            ->assertJsonPath('data.value_proposition', 'We save time.');
    }

    public function test_collaborator_can_get_section(): void
    {
        [$owner] = $this->userWithToken();
        [$viewer, $viewerToken] = $this->userWithToken();
        $project = $this->projectOwnedBy($owner);
        $project->collaborators()->attach($viewer->id, ['role' => 'viewer']);

        $this->withHeader('Authorization', "Bearer {$viewerToken}")
            ->getJson("/api/projects/{$project->id}/sections/customer")
            ->assertOk();
    }

    public function test_non_member_cannot_get_section(): void
    {
        [$owner] = $this->userWithToken();
        [$other, $otherToken] = $this->userWithToken();
        $project = $this->projectOwnedBy($owner);

        $this->withHeader('Authorization', "Bearer {$otherToken}")
            ->getJson("/api/projects/{$project->id}/sections/offering")
            ->assertForbidden();
    }

    public function test_invalid_section_name_returns_404(): void
    {
        [$owner, $token] = $this->userWithToken();
        $project = $this->projectOwnedBy($owner);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/projects/{$project->id}/sections/nonexistent")
            ->assertNotFound();
    }

    // ── PUT update ────────────────────────────────────────────────────────────

    public function test_owner_can_create_section_content(): void
    {
        [$owner, $token] = $this->userWithToken();
        $project = $this->projectOwnedBy($owner);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/projects/{$project->id}/sections/offering", [
                'value_proposition' => 'We save founders 10 hours a week.',
                'key_features'      => 'Dashboard, AI hints, collab.',
            ])
            ->assertOk()
            ->assertJsonPath('data.value_proposition', 'We save founders 10 hours a week.')
            ->assertJsonPath('data.key_features', 'Dashboard, AI hints, collab.');

        $this->assertDatabaseHas('project_sections', [
            'project_id' => $project->id,
            'section'    => 'offering',
        ]);
    }

    public function test_owner_can_partially_update_section(): void
    {
        [$owner, $token] = $this->userWithToken();
        $project = $this->projectOwnedBy($owner);
        $project->sections()->create([
            'section' => 'offering',
            'content' => ['value_proposition' => 'Old value', 'key_features' => 'Old features'],
            'updated_by' => $owner->id,
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/projects/{$project->id}/sections/offering", [
                'value_proposition' => 'New value',
            ])
            ->assertOk()
            ->assertJsonPath('data.value_proposition', 'New value')
            ->assertJsonPath('data.key_features', 'Old features');
    }

    public function test_editor_collaborator_can_update_section(): void
    {
        [$owner] = $this->userWithToken();
        [$editor, $editorToken] = $this->userWithToken();
        $project = $this->projectOwnedBy($owner);
        $project->collaborators()->attach($editor->id, ['role' => 'editor']);

        $this->withHeader('Authorization', "Bearer {$editorToken}")
            ->putJson("/api/projects/{$project->id}/sections/action", [
                'current_focus' => 'Ship MVP',
            ])
            ->assertOk()
            ->assertJsonPath('data.current_focus', 'Ship MVP');
    }

    public function test_viewer_collaborator_cannot_update_section(): void
    {
        [$owner] = $this->userWithToken();
        [$viewer, $viewerToken] = $this->userWithToken();
        $project = $this->projectOwnedBy($owner);
        $project->collaborators()->attach($viewer->id, ['role' => 'viewer']);

        $this->withHeader('Authorization', "Bearer {$viewerToken}")
            ->putJson("/api/projects/{$project->id}/sections/offering", [
                'value_proposition' => 'Should not save.',
            ])
            ->assertForbidden();
    }

    public function test_non_member_cannot_update_section(): void
    {
        [$owner] = $this->userWithToken();
        [$other, $otherToken] = $this->userWithToken();
        $project = $this->projectOwnedBy($owner);

        $this->withHeader('Authorization', "Bearer {$otherToken}")
            ->putJson("/api/projects/{$project->id}/sections/money", [
                'monthly_revenue' => '10000',
            ])
            ->assertForbidden();
    }

    public function test_unknown_fields_are_ignored(): void
    {
        [$owner, $token] = $this->userWithToken();
        $project = $this->projectOwnedBy($owner);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/projects/{$project->id}/sections/offering", [
                'value_proposition' => 'Valid field',
                'hacked_field'      => 'Should be ignored',
            ])
            ->assertOk();

        $this->assertArrayNotHasKey('hacked_field', $response->json('data'));
    }

    public function test_update_invalid_section_returns_404(): void
    {
        [$owner, $token] = $this->userWithToken();
        $project = $this->projectOwnedBy($owner);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/projects/{$project->id}/sections/hacking", ['foo' => 'bar'])
            ->assertNotFound();
    }
}
