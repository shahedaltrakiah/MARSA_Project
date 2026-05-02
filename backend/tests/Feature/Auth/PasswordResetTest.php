<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    // ── POST /auth/forgot-password ────────────────────────────────────────────

    public function test_forgot_password_sends_reset_link_for_existing_email(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->postJson('/api/auth/forgot-password', ['email' => $user->email])
            ->assertOk()
            ->assertJsonPath('message', 'If an account with that email exists, a reset link has been sent.');

        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_forgot_password_returns_same_message_for_unknown_email(): void
    {
        $this->postJson('/api/auth/forgot-password', ['email' => 'nobody@example.com'])
            ->assertOk()
            ->assertJsonPath('message', 'If an account with that email exists, a reset link has been sent.');
    }

    public function test_forgot_password_requires_valid_email(): void
    {
        $this->postJson('/api/auth/forgot-password', ['email' => 'not-an-email'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_forgot_password_does_not_expose_dev_url_outside_local_env(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $response = $this->postJson('/api/auth/forgot-password', ['email' => $user->email]);

        $response->assertOk();
        // APP_ENV=testing in tests, so dev_reset_url must NOT be present
        $this->assertArrayNotHasKey('dev_reset_url', $response->json());
        $this->assertArrayHasKey('message', $response->json());
    }

    // ── POST /auth/reset-password ─────────────────────────────────────────────

    public function test_user_can_reset_password_with_valid_token(): void
    {
        $user = User::factory()->create();
        $token = Password::createToken($user);

        $this->postJson('/api/auth/reset-password', [
            'token'                 => $token,
            'email'                 => $user->email,
            'password'              => 'newPassword123',
            'password_confirmation' => 'newPassword123',
        ])
            ->assertOk()
            ->assertJsonPath('message', 'Password has been reset successfully.');
    }

    public function test_reset_password_invalidates_existing_tokens(): void
    {
        $user = User::factory()->create();
        $user->createToken('existing-session');
        $this->assertCount(1, $user->tokens);

        $token = Password::createToken($user);

        $this->postJson('/api/auth/reset-password', [
            'token'                 => $token,
            'email'                 => $user->email,
            'password'              => 'newPassword123',
            'password_confirmation' => 'newPassword123',
        ])->assertOk();

        $this->assertCount(0, $user->fresh()->tokens);
    }

    public function test_reset_password_fails_with_invalid_token(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/auth/reset-password', [
            'token'                 => 'wrong-token',
            'email'                 => $user->email,
            'password'              => 'newPassword123',
            'password_confirmation' => 'newPassword123',
        ])->assertUnprocessable();
    }

    public function test_reset_password_fails_with_wrong_email(): void
    {
        $user = User::factory()->create();
        $token = Password::createToken($user);

        $this->postJson('/api/auth/reset-password', [
            'token'                 => $token,
            'email'                 => 'wrong@example.com',
            'password'              => 'newPassword123',
            'password_confirmation' => 'newPassword123',
        ])->assertUnprocessable();
    }

    public function test_reset_password_requires_minimum_length(): void
    {
        $user = User::factory()->create();
        $token = Password::createToken($user);

        $this->postJson('/api/auth/reset-password', [
            'token'                 => $token,
            'email'                 => $user->email,
            'password'              => 'short',
            'password_confirmation' => 'short',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);
    }

    public function test_reset_password_requires_confirmation_match(): void
    {
        $user = User::factory()->create();
        $token = Password::createToken($user);

        $this->postJson('/api/auth/reset-password', [
            'token'                 => $token,
            'email'                 => $user->email,
            'password'              => 'newPassword123',
            'password_confirmation' => 'differentPassword123',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);
    }

    public function test_user_can_login_with_new_password_after_reset(): void
    {
        $user = User::factory()->create();
        $token = Password::createToken($user);

        $this->postJson('/api/auth/reset-password', [
            'token'                 => $token,
            'email'                 => $user->email,
            'password'              => 'brandNewPass99',
            'password_confirmation' => 'brandNewPass99',
        ])->assertOk();

        $this->postJson('/api/auth/login', [
            'email'    => $user->email,
            'password' => 'brandNewPass99',
        ])->assertOk()
            ->assertJsonStructure(['user', 'token']);
    }
}
