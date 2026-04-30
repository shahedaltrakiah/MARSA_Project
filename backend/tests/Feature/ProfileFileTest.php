<?php
namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileFileTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsUser(): array
    {
        $user = User::factory()->create();
        $user->startupProfile()->create();
        $token = $user->createToken('test')->plainTextToken;
        return [$user, $token];
    }

    public function test_user_can_upload_a_profile_file(): void
    {
        Storage::fake('local');
        [$user, $token] = $this->actingAsUser();
        $file = UploadedFile::fake()->create('pitch-deck.pdf', 500, 'application/pdf');

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/profile/files', ['file' => $file]);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'original_name', 'mime_type', 'size']]);

        $this->assertDatabaseHas('profile_files', ['original_name' => 'pitch-deck.pdf']);
    }

    public function test_upload_requires_a_file(): void
    {
        Storage::fake('local');
        [$user, $token] = $this->actingAsUser();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/profile/files', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    public function test_upload_only_accepts_pdf_docx_pptx(): void
    {
        Storage::fake('local');
        [$user, $token] = $this->actingAsUser();
        $file = UploadedFile::fake()->create('image.png', 100, 'image/png');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/profile/files', ['file' => $file])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    public function test_user_can_delete_their_profile_file(): void
    {
        Storage::fake('local');
        [$user, $token] = $this->actingAsUser();
        $file = UploadedFile::fake()->create('plan.pdf', 200, 'application/pdf');

        $uploadResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/profile/files', ['file' => $file]);

        $fileId = $uploadResponse->json('data.id');

        $fileRecord = \App\Models\ProfileFile::find($fileId);
        $filePath = $fileRecord->path;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/profile/files/{$fileId}")
            ->assertStatus(200);

        $this->assertDatabaseMissing('profile_files', ['id' => $fileId]);
        Storage::disk('local')->assertMissing($filePath);
    }

    public function test_user_cannot_delete_another_users_file(): void
    {
        Storage::fake('local');
        [$userA, $tokenA] = $this->actingAsUser();
        [$userB, $tokenB] = $this->actingAsUser();

        $file = UploadedFile::fake()->create('plan.pdf', 200, 'application/pdf');

        $uploadResponse = $this->withHeader('Authorization', "Bearer {$tokenA}")
            ->postJson('/api/profile/files', ['file' => $file]);

        $fileId = $uploadResponse->json('data.id');

        $this->actingAs($userB, 'sanctum')
            ->deleteJson("/api/profile/files/{$fileId}")
            ->assertStatus(403);
    }
}
