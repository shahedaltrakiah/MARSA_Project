<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\ProjectSection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectFrameworkOverviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_receives_project_and_all_section_slots_in_one_call(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;
        $project = Project::factory()->create(['owner_id' => $user->id]);
        ProjectSection::query()->create([
            'project_id' => $project->id,
            'section' => 'offering',
            'content' => ['value_proposition' => ['notes' => '<p>x</p>', 'points' => []]],
            'updated_by' => $user->id,
        ]);

        $res = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/projects/{$project->id}/framework-overview")
            ->assertOk()
            ->json('data');

        $this->assertArrayHasKey('project', $res);
        $this->assertSame($project->id, $res['project']['id']);
        $this->assertArrayHasKey('sections', $res);
        $this->assertArrayHasKey('offering', $res['sections']);
        $this->assertArrayHasKey('targets', $res['sections']);
        $this->assertNotEmpty($res['sections']['offering']);
        $this->assertSame([], $res['sections']['targets']);
    }

    public function test_non_member_cannot_view_framework_overview(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $token = $other->createToken('test')->plainTextToken;
        $project = Project::factory()->create(['owner_id' => $owner->id]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/projects/{$project->id}/framework-overview")
            ->assertForbidden();
    }
}
