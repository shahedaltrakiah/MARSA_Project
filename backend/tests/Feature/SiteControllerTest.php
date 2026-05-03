<?php
namespace Tests\Feature;

use App\Models\ContentBlock;
use App\Models\SiteSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SiteControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_site_endpoint_is_public(): void
    {
        $this->getJson('/api/site')->assertOk();
    }

    public function test_returns_default_settings_when_none_saved(): void
    {
        $response = $this->getJson('/api/site')->assertOk();

        $this->assertSame('#002d62', $response->json('settings.primary_color'));
        $this->assertSame('#00c4cc', $response->json('settings.secondary_color'));
        $this->assertNull($response->json('settings.logo_url'));
    }

    public function test_returns_saved_settings(): void
    {
        SiteSettings::create([
            'primary_color'   => '#ff0000',
            'secondary_color' => '#00ff00',
            'logo_url'        => 'https://example.com/logo.png',
        ]);

        $response = $this->getJson('/api/site')->assertOk();

        $this->assertSame('#ff0000', $response->json('settings.primary_color'));
        $this->assertSame('https://example.com/logo.png', $response->json('settings.logo_url'));
    }

    public function test_returns_default_blocks_when_none_saved(): void
    {
        $response = $this->getJson('/api/site')->assertOk();

        $response->assertJsonStructure([
            'blocks' => ['hero', 'features', 'pricing_free', 'pricing_pro', 'pricing_team'],
        ]);
        $this->assertNotEmpty($response->json('blocks.hero.en.badge'));
    }

    public function test_returns_saved_block_over_default(): void
    {
        ContentBlock::create([
            'key'     => 'hero',
            'content' => ['en' => ['badge' => 'Custom Badge'], 'ar' => ['badge' => 'شارة مخصصة']],
        ]);

        $response = $this->getJson('/api/site')->assertOk();

        $this->assertSame('Custom Badge', $response->json('blocks.hero.en.badge'));
    }
}
