<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_signed_verification_link_verifies_email_and_redirects_to_frontend(): void
    {
        config(['app.frontend_url' => 'http://frontend.test']);

        $user = User::factory()->unverified()->create();

        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            [
                'id' => $user->id,
                'hash' => sha1($user->getEmailForVerification()),
            ]
        );

        $response = $this->get($url);

        $response->assertRedirect('http://frontend.test/login?verified=1');
        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_signed_link_for_already_verified_user_redirects_without_error(): void
    {
        config(['app.frontend_url' => 'http://frontend.test']);

        $user = User::factory()->create();

        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            [
                'id' => $user->id,
                'hash' => sha1($user->getEmailForVerification()),
            ]
        );

        $this->get($url)->assertRedirect('http://frontend.test/login?verified=already');
    }
}
