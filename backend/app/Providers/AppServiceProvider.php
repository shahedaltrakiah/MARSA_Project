<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        // Point the built-in password-reset email to the Next.js frontend
        // instead of trying to resolve a 'password.reset' named web route.
        ResetPassword::createUrlUsing(function ($notifiable, string $token) {
            $base = rtrim(config('app.frontend_url', 'http://localhost:3001'), '/');
            return $base . '/reset-password?token=' . $token
                . '&email=' . rawurlencode((string) $notifiable->getEmailForPasswordReset());
        });
    }
}
