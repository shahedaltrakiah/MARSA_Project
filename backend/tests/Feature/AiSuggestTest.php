<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AiSuggestTest extends TestCase
{
    use RefreshDatabase;

    private function userWithToken(): array
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        return [$user, $token];
    }

    private function fakeSuccessResponse(string $text = 'Here are 3 suggestions.'): void
    {
        Http::fake([
            'api.anthropic.com/*' => Http::response([
                'content' => [['type' => 'text', 'text' => $text]],
            ], 200),
        ]);
    }

    public function test_unauthenticated_cannot_get_suggestions(): void
    {
        $owner = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $owner->id]);

        $this->postJson("/api/projects/{$project->id}/ai-suggest", ['section' => 'offering'])
            ->assertUnauthorized();
    }

    public function test_non_member_cannot_get_suggestions(): void
    {
        [$owner] = $this->userWithToken();
        [$other, $otherToken] = $this->userWithToken();
        $project = Project::factory()->create(['owner_id' => $owner->id]);

        $this->withHeader('Authorization', "Bearer {$otherToken}")
            ->postJson("/api/projects/{$project->id}/ai-suggest", ['section' => 'offering'])
            ->assertForbidden();
    }

    public function test_owner_gets_suggestion_for_flat_section(): void
    {
        $this->fakeSuccessResponse('1. Add pricing details. 2. Clarify your target market.');
        config(['services.anthropic.key' => 'test-key']);

        [$owner, $token] = $this->userWithToken();
        $project = Project::factory()->create(['owner_id' => $owner->id]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/projects/{$project->id}/ai-suggest", ['section' => 'offering'])
            ->assertOk()
            ->assertJsonPath('suggestion', '1. Add pricing details. 2. Clarify your target market.');
    }

    public function test_owner_gets_suggestion_for_pillar_section(): void
    {
        $this->fakeSuccessResponse('1. Define revenue model. 2. Clarify pricing tiers.');
        config(['services.anthropic.key' => 'test-key']);

        [$owner, $token] = $this->userWithToken();
        $project = Project::factory()->create(['owner_id' => $owner->id]);
        $project->sections()->create([
            'section' => 'reach',
            'content' => ['business_model' => ['revenue_streams' => 'SaaS']],
            'updated_by' => $owner->id,
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/projects/{$project->id}/ai-suggest", [
                'section' => 'reach',
                'pillar' => 'business_model',
            ])
            ->assertOk()
            ->assertJsonStructure(['suggestion']);
    }

    public function test_collaborator_viewer_can_get_suggestion(): void
    {
        $this->fakeSuccessResponse('Suggestions here.');
        config(['services.anthropic.key' => 'test-key']);

        [$owner] = $this->userWithToken();
        [$viewer, $viewerToken] = $this->userWithToken();
        $project = Project::factory()->create(['owner_id' => $owner->id]);
        $project->collaborators()->attach($viewer->id, ['role' => 'viewer']);

        $this->withHeader('Authorization', "Bearer {$viewerToken}")
            ->postJson("/api/projects/{$project->id}/ai-suggest", ['section' => 'customer'])
            ->assertOk();
    }

    public function test_invalid_section_returns_422(): void
    {
        [$owner, $token] = $this->userWithToken();
        $project = Project::factory()->create(['owner_id' => $owner->id]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/projects/{$project->id}/ai-suggest", ['section' => 'nonexistent'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['section']);
    }

    public function test_missing_api_key_returns_503(): void
    {
        config(['services.anthropic.key' => null]);

        [$owner, $token] = $this->userWithToken();
        $project = Project::factory()->create(['owner_id' => $owner->id]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/projects/{$project->id}/ai-suggest", ['section' => 'offering'])
            ->assertStatus(503)
            ->assertJsonPath('suggestion', 'AI suggestions are not configured.');
    }

    public function test_anthropic_api_failure_returns_502(): void
    {
        Http::fake(['api.anthropic.com/*' => Http::response([], 500)]);
        config(['services.anthropic.key' => 'test-key']);

        [$owner, $token] = $this->userWithToken();
        $project = Project::factory()->create(['owner_id' => $owner->id]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/projects/{$project->id}/ai-suggest", ['section' => 'offering'])
            ->assertStatus(502)
            ->assertJsonPath('error', 'AI service unavailable. Please try again.');
    }
}
