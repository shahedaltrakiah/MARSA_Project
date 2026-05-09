<?php

namespace Tests\Feature\Admin;

use App\Models\SiteSettings;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SiteSettingsAdminTest extends TestCase
{
    use RefreshDatabase;

    private function token(string $role): string
    {
        return User::factory()->create(['role' => $role])
            ->createToken('test')->plainTextToken;
    }

    public function test_super_admin_can_update_colors(): void
    {
        $this->withHeader('Authorization', 'Bearer '.$this->token('super_admin'))
            ->putJson('/api/admin/site-settings', [
                'primary_color' => '#123456',
                'secondary_color' => '#abcdef',
            ])
            ->assertOk()
            ->assertJsonPath('data.primary_color', '#123456');

        $this->assertDatabaseHas('site_settings', ['primary_color' => '#123456']);
    }

    public function test_admin_without_branding_permission_cannot_update_site_settings(): void
    {
        $this->withHeader('Authorization', 'Bearer '.$this->token('admin'))
            ->putJson('/api/admin/site-settings', ['primary_color' => '#123456'])
            ->assertForbidden();
    }

    public function test_admin_with_branding_permission_can_update_site_settings(): void
    {
        $token = User::factory()->create([
            'role' => 'admin',
            'admin_site_permissions' => ['branding'],
        ])->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson('/api/admin/site-settings', [
                'primary_color' => '#abcdef',
                'secondary_color' => '#fedcba',
            ])
            ->assertOk()
            ->assertJsonPath('data.primary_color', '#abcdef');
    }

    public function test_color_must_be_valid_hex(): void
    {
        $this->withHeader('Authorization', 'Bearer '.$this->token('super_admin'))
            ->putJson('/api/admin/site-settings', ['primary_color' => 'not-a-color'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['primary_color']);
    }

    public function test_super_admin_can_upload_logo(): void
    {
        Storage::fake('public');

        $this->withHeader('Authorization', 'Bearer '.$this->token('super_admin'))
            ->post('/api/admin/site-settings/logo', [
                'logo' => UploadedFile::fake()->image('logo.png', 200, 200),
            ])
            ->assertOk()
            ->assertJsonStructure(['data' => ['logo_url']]);

        $settings = SiteSettings::first();
        $this->assertNotNull($settings->logo_url);
    }
}
