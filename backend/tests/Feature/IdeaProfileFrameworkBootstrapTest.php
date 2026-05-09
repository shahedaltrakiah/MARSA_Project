<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class IdeaProfileFrameworkBootstrapTest extends TestCase
{
    use RefreshDatabase;

    private function userWithToken(): array
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        return [$user, $token];
    }

    /** @return array<string, string> */
    private function validCompleteIdeaProfile(): array
    {
        return [
            'business_category' => 'Software',
            'business_audience' => 'b2b',
            'stage' => 'Early stage',
            'core_idea' => 'Core idea text minimum eight.',
            'problem' => 'Problem text minimum eight chars.',
            'solution' => 'Solution text minimum eight chars.',
            'customer_market' => 'Customer market text eight.',
            'team' => 'Team description eight chars.',
            'traction' => 'Traction description eight.',
            'current_challenge' => 'Current challenge text eight.',
            'goal_3m' => 'Three month goal text eight.',
        ];
    }

    private function anthropicJsonPayload(): string
    {
        $block = fn (string $n, string $p) => json_encode(['notes' => $n, 'points' => [['text' => $p]]], JSON_UNESCAPED_UNICODE);

        return '{"offering":{'
            .'"value_proposition":'.$block('<p>VP</p>', 'Value prop bullet').','
            .'"swot":'.$block('<p>SW</p>', 'Swot bullet').','
            .'"solution":'.$block('<p>So</p>', 'Solution bullet').','
            .'"future_growth":'.$block('<p>Fg</p>', 'Growth bullet')
            .'}}';
    }

    public function test_mark_complete_without_api_key_skips_bootstrap(): void
    {
        config(['services.anthropic.key' => null]);

        [$owner, $token] = $this->userWithToken();
        $project = Project::factory()->create(['owner_id' => $owner->id]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/projects/{$project->id}/idea-profile", [
                'idea_profile' => $this->validCompleteIdeaProfile(),
                'mark_complete' => true,
            ])
            ->assertOk()
            ->assertJsonPath('meta.framework_bootstrap.status', 'skipped')
            ->assertJsonPath('meta.framework_bootstrap.reason', 'no_api_key');
    }

    public function test_mark_complete_applies_ai_content_to_empty_sections(): void
    {
        config(['services.anthropic.key' => 'test-key']);
        Http::fake([
            'api.anthropic.com/*' => Http::response([
                'content' => [['type' => 'text', 'text' => $this->anthropicJsonPayload()]],
            ], 200),
        ]);

        [$owner, $token] = $this->userWithToken();
        $project = Project::factory()->create(['owner_id' => $owner->id]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/projects/{$project->id}/idea-profile", [
                'idea_profile' => $this->validCompleteIdeaProfile(),
                'mark_complete' => true,
            ])
            ->assertOk()
            ->assertJsonPath('meta.framework_bootstrap.status', 'applied');

        $project->refresh();
        $offering = $project->sections()->where('section', 'offering')->first();
        $this->assertNotNull($offering);
        $content = $offering->content;
        $this->assertSame('<p>VP</p>', $content['value_proposition']['notes']);
        $this->assertSame('Value prop bullet', $content['value_proposition']['points'][0]['text']);
        $this->assertArrayHasKey('id', $content['value_proposition']['points'][0]);
    }

    public function test_mark_complete_does_not_overwrite_existing_pillar_content(): void
    {
        config(['services.anthropic.key' => 'test-key']);
        Http::fake([
            'api.anthropic.com/*' => Http::response([
                'content' => [['type' => 'text', 'text' => $this->anthropicJsonPayload()]],
            ], 200),
        ]);

        [$owner, $token] = $this->userWithToken();
        $project = Project::factory()->create(['owner_id' => $owner->id]);
        $project->sections()->create([
            'section' => 'offering',
            'content' => [
                'value_proposition' => [
                    'notes' => '<p>User wrote this.</p>',
                    'points' => [
                        ['id' => 'existing-id', 'text' => 'Existing point'],
                    ],
                ],
            ],
            'updated_by' => $owner->id,
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/projects/{$project->id}/idea-profile", [
                'idea_profile' => $this->validCompleteIdeaProfile(),
                'mark_complete' => true,
            ])
            ->assertOk()
            ->assertJsonPath('meta.framework_bootstrap.status', 'applied');

        $project->refresh();
        $offering = $project->sections()->where('section', 'offering')->first();
        $this->assertSame('<p>User wrote this.</p>', $offering->content['value_proposition']['notes']);
        $this->assertSame('Existing point', $offering->content['value_proposition']['points'][0]['text']);

        $this->assertSame('Swot bullet', $offering->content['swot']['points'][0]['text']);
    }

    public function test_mark_complete_records_failed_status_when_anthropic_errors(): void
    {
        config(['services.anthropic.key' => 'test-key']);
        Http::fake(['api.anthropic.com/*' => Http::response([], 500)]);

        [$owner, $token] = $this->userWithToken();
        $project = Project::factory()->create(['owner_id' => $owner->id]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/projects/{$project->id}/idea-profile", [
                'idea_profile' => $this->validCompleteIdeaProfile(),
                'mark_complete' => true,
            ])
            ->assertOk()
            ->assertJsonPath('meta.framework_bootstrap.status', 'failed')
            ->assertJsonPath('meta.framework_bootstrap.reason', 'anthropic_error');
    }
}
