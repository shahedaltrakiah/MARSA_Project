<?php
namespace Tests\Feature\Admin;

use App\Models\ContentBlock;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContentBlockTest extends TestCase
{
    use RefreshDatabase;

    private function token(string $role): string
    {
        return User::factory()->create(['role' => $role])
            ->createToken('test')->plainTextToken;
    }

    public function test_super_admin_can_update_content_block(): void
    {
        $content = ['en' => ['badge' => 'New Badge'], 'ar' => ['badge' => 'شارة جديدة']];

        $this->withHeader('Authorization', 'Bearer ' . $this->token('super_admin'))
            ->putJson('/api/admin/content-blocks/hero', ['content' => $content])
            ->assertOk()
            ->assertJsonPath('data.key', 'hero');

        $this->assertDatabaseHas('content_blocks', ['key' => 'hero']);
        $this->assertSame('New Badge', ContentBlock::where('key', 'hero')->first()->content['en']['badge']);
    }

    public function test_invalid_block_key_returns_404(): void
    {
        $this->withHeader('Authorization', 'Bearer ' . $this->token('super_admin'))
            ->putJson('/api/admin/content-blocks/nonexistent', ['content' => []])
            ->assertNotFound();
    }

    public function test_admin_cannot_update_content_blocks(): void
    {
        $this->withHeader('Authorization', 'Bearer ' . $this->token('admin'))
            ->putJson('/api/admin/content-blocks/hero', ['content' => []])
            ->assertForbidden();
    }

    public function test_content_block_updates_are_reflected_in_site_endpoint(): void
    {
        ContentBlock::create([
            'key'     => 'hero',
            'content' => ['en' => ['badge' => 'Saved Badge'], 'ar' => ['badge' => 'شارة محفوظة']],
        ]);

        $this->getJson('/api/site')
            ->assertOk()
            ->assertJsonPath('blocks.hero.en.badge', 'Saved Badge');
    }
}
