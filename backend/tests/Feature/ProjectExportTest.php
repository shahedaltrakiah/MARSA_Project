<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectExportTest extends TestCase
{
    use RefreshDatabase;

    private function ownerWithToken(): array
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        return [$user, $token];
    }

    public function test_guest_cannot_export_plan(): void
    {
        $owner = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $owner->id]);

        $this->getJson("/api/projects/{$project->id}/export/plan")
            ->assertUnauthorized();
    }

    public function test_owner_downloads_business_plan_pdf(): void
    {
        [$owner, $token] = $this->ownerWithToken();
        $project = Project::factory()->create([
            'owner_id' => $owner->id,
            'name' => 'Acme Startup Inc.',
            'idea_profile' => [
                'core_idea' => 'Something at least eight.',
                'problem' => 'Problem text eight chars.',
                'solution' => 'Solution text eight chars.',
                'customer_market' => 'Market text eight chars.',
                'team' => 'Team text eight chars.',
                'traction' => 'Traction text eight.',
                'current_challenge' => 'Challenge text eight.',
                'goal_3m' => 'Goal text eight chars.',
                'business_category' => 'Cat',
                'business_audience' => 'b2b',
                'stage' => 'Early',
            ],
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->get("/api/projects/{$project->id}/export/plan");

        $response->assertOk();
        $this->assertStringContainsString('application/pdf', (string) $response->headers->get('content-type'));
        $this->assertStringStartsWith('%PDF', (string) $response->getContent());
        $this->assertStringContainsString('business-plan-acme-startup-inc.pdf', (string) $response->headers->get('content-disposition'));
    }

    public function test_owner_downloads_canvas_pdf(): void
    {
        [$owner, $token] = $this->ownerWithToken();
        $project = Project::factory()->create(['owner_id' => $owner->id, 'name' => 'Canvas Co']);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->get("/api/projects/{$project->id}/export/canvas");

        $response->assertOk();
        $this->assertStringContainsString('application/pdf', (string) $response->headers->get('content-type'));
        $this->assertStringStartsWith('%PDF', (string) $response->getContent());
    }

    public function test_owner_downloads_zip_bundle(): void
    {
        if (! class_exists(\ZipArchive::class)) {
            $this->markTestSkipped('Zip extension not available.');
        }

        [$owner, $token] = $this->ownerWithToken();
        $project = Project::factory()->create(['owner_id' => $owner->id, 'name' => 'Zip Test']);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->get("/api/projects/{$project->id}/export/all");

        $response->assertOk();
        $this->assertStringContainsString('application/zip', (string) $response->headers->get('content-type'));
        $this->assertStringContainsString('project-export-zip-test.zip', (string) $response->headers->get('content-disposition'));
    }
}
