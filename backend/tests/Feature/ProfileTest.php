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

        $this->assertDatabaseHas('startup_profiles', [
            'idea' => 'An AI-powered platform for startups',
            'stage' => 'idea',
        ]);
    }

    public function test_unauthenticated_user_cannot_update_profile(): void
    {
        $this->putJson('/api/profile', ['idea' => 'x'])->assertStatus(401);
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
