<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Models\User;
use App\Notifications\MarsaVerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ProjectInvitationAcceptTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_with_invite_token_joins_project(): void
    {
        Notification::fake();
        Mail::fake();

        $owner = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $owner->id]);

        $invitation = ProjectInvitation::create([
            'project_id' => $project->id,
            'email' => 'joiner@example.com',
            'role' => 'editor',
            'token' => str_repeat('a', 64),
            'expires_at' => now()->addDay(),
            'invited_by' => $owner->id,
        ]);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Joiner User',
            'email' => 'joiner@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'invite_token' => $invitation->token,
        ]);

        $response->assertCreated()->assertJsonPath('meta.joined_project_id', $project->id);

        $this->assertDatabaseHas('project_collaborators', [
            'project_id' => $project->id,
            'user_id' => $response->json('user.id'),
            'role' => 'editor',
        ]);

        $this->assertNotNull($invitation->fresh()->accepted_at);

        Notification::assertSentTo(User::find($response->json('user.id')), MarsaVerifyEmail::class);
    }

    public function test_public_invitation_preview_returns_project_info(): void
    {
        $owner = User::factory()->create();
        $project = Project::factory()->create(['owner_id' => $owner->id, 'name' => 'Acme']);

        $invitation = ProjectInvitation::create([
            'project_id' => $project->id,
            'email' => 'x@y.com',
            'role' => 'viewer',
            'token' => str_repeat('b', 64),
            'expires_at' => now()->addDay(),
            'invited_by' => $owner->id,
        ]);

        $this->getJson('/api/invitations/'.$invitation->token)
            ->assertOk()
            ->assertJsonPath('data.project_name', 'Acme')
            ->assertJsonPath('data.role', 'viewer');
    }
}
