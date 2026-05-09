<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectSectionTest extends TestCase
{
    use RefreshDatabase;

    /** @param  array<int, array{id: string, text?: string, starred?: bool, target_date?: string|null}>  $points */
    private function workspaceTab(string $notes = '', array $points = []): array
    {
        return ['notes' => $notes, 'points' => $points];
    }

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
            'content' => [
                'value_proposition' => $this->workspaceTab('', [
                    ['id' => 'p1', 'text' => 'We save time.', 'starred' => false],
                ]),
            ],
            'updated_by' => $owner->id,
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/projects/{$project->id}/sections/offering")
            ->assertOk()
            ->assertJsonPath('data.value_proposition.points.0.text', 'We save time.');
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
                'value_proposition' => $this->workspaceTab('<p>Notes</p>', [
                    ['id' => 'a1', 'text' => 'We save founders 10 hours a week.', 'starred' => true],
                ]),
                'swot' => $this->workspaceTab('', [
                    ['id' => 'b1', 'text' => 'Strength: team', 'starred' => false],
                ]),
            ])
            ->assertOk()
            ->assertJsonPath('data.value_proposition.points.0.text', 'We save founders 10 hours a week.')
            ->assertJsonPath('data.swot.points.0.text', 'Strength: team');

        $this->assertDatabaseHas('project_sections', [
            'project_id' => $project->id,
            'section' => 'offering',
        ]);
    }

    public function test_owner_can_partially_update_section(): void
    {
        [$owner, $token] = $this->userWithToken();
        $project = $this->projectOwnedBy($owner);
        $project->sections()->create([
            'section' => 'offering',
            'content' => [
                'value_proposition' => $this->workspaceTab('', [['id' => 'x', 'text' => 'Old value']]),
                'swot' => $this->workspaceTab('', [['id' => 'y', 'text' => 'Old SWOT']]),
            ],
            'updated_by' => $owner->id,
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/projects/{$project->id}/sections/offering", [
                'value_proposition' => $this->workspaceTab('', [['id' => 'x', 'text' => 'New value']]),
            ])
            ->assertOk()
            ->assertJsonPath('data.value_proposition.points.0.text', 'New value')
            ->assertJsonPath('data.swot.points.0.text', 'Old SWOT');
    }

    public function test_editor_collaborator_can_update_section(): void
    {
        [$owner] = $this->userWithToken();
        [$editor, $editorToken] = $this->userWithToken();
        $project = $this->projectOwnedBy($owner);
        $project->collaborators()->attach($editor->id, ['role' => 'editor']);

        $this->withHeader('Authorization', "Bearer {$editorToken}")
            ->putJson("/api/projects/{$project->id}/sections/action", [
                'tasks' => $this->workspaceTab('', [['id' => 'c1', 'text' => 'Ship MVP']]),
            ])
            ->assertOk()
            ->assertJsonPath('data.tasks.points.0.text', 'Ship MVP');
    }

    public function test_viewer_collaborator_cannot_update_section(): void
    {
        [$owner] = $this->userWithToken();
        [$viewer, $viewerToken] = $this->userWithToken();
        $project = $this->projectOwnedBy($owner);
        $project->collaborators()->attach($viewer->id, ['role' => 'viewer']);

        $this->withHeader('Authorization', "Bearer {$viewerToken}")
            ->putJson("/api/projects/{$project->id}/sections/offering", [
                'value_proposition' => $this->workspaceTab('', [['id' => 'z', 'text' => 'Should not save.']]),
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
                'monthly_revenue' => $this->workspaceTab('', [['id' => 'm1', 'text' => '10000']]),
            ])
            ->assertForbidden();
    }

    public function test_unknown_fields_are_ignored(): void
    {
        [$owner, $token] = $this->userWithToken();
        $project = $this->projectOwnedBy($owner);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/projects/{$project->id}/sections/offering", [
                'value_proposition' => $this->workspaceTab('', [['id' => 'v1', 'text' => 'Valid field']]),
                'hacked_field' => 'Should be ignored',
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

    // ── Reach (workspace tabs) ───────────────────────────────────────────────

    public function test_owner_can_save_reach_workspace_tabs(): void
    {
        [$owner, $token] = $this->userWithToken();
        $project = $this->projectOwnedBy($owner);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/projects/{$project->id}/sections/reach", [
                'business_model' => $this->workspaceTab('', [
                    ['id' => 'r1', 'text' => 'SaaS subscriptions'],
                ]),
            ])
            ->assertOk()
            ->assertJsonPath('data.business_model.points.0.text', 'SaaS subscriptions');
    }

    public function test_reach_tabs_merge_independently(): void
    {
        [$owner, $token] = $this->userWithToken();
        $project = $this->projectOwnedBy($owner);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/projects/{$project->id}/sections/reach", [
                'branding' => $this->workspaceTab('', [
                    ['id' => 'b1', 'text' => 'Modern SaaS'],
                ]),
            ])
            ->assertOk();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/projects/{$project->id}/sections/reach", [
                'business_model' => $this->workspaceTab('', [
                    ['id' => 'm1', 'text' => 'Subscriptions'],
                ]),
            ])
            ->assertOk()
            ->assertJsonPath('data.branding.points.0.text', 'Modern SaaS')
            ->assertJsonPath('data.business_model.points.0.text', 'Subscriptions');
    }

    public function test_owner_can_save_targets_workspace_tabs(): void
    {
        [$owner, $token] = $this->userWithToken();
        $project = $this->projectOwnedBy($owner);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/projects/{$project->id}/sections/targets", [
                'cash' => $this->workspaceTab('', [
                    ['id' => 't1', 'text' => '$1M ARR goal'],
                ]),
            ])
            ->assertOk()
            ->assertJsonPath('data.cash.points.0.text', '$1M ARR goal');
    }

    public function test_targets_tabs_merge_independently(): void
    {
        [$owner, $token] = $this->userWithToken();
        $project = $this->projectOwnedBy($owner);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/projects/{$project->id}/sections/targets", [
                'position' => $this->workspaceTab('', [
                    ['id' => 'p1', 'text' => 'Market leader'],
                ]),
            ])
            ->assertOk();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/projects/{$project->id}/sections/targets", [
                'cash' => $this->workspaceTab('', [
                    ['id' => 'c1', 'text' => '$2M ARR'],
                ]),
            ])
            ->assertOk()
            ->assertJsonPath('data.position.points.0.text', 'Market leader')
            ->assertJsonPath('data.cash.points.0.text', '$2M ARR');
    }

    public function test_business_model_section_no_longer_valid(): void
    {
        [$owner, $token] = $this->userWithToken();
        $project = $this->projectOwnedBy($owner);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/projects/{$project->id}/sections/business-model")
            ->assertNotFound();
    }
}
