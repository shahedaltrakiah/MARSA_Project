<?php

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\URL;

Route::get('/', function () {
    return view('welcome');
});

/** API-only app: named route so auth middleware never throws when redirecting guests (e.g. session + Sanctum). */
Route::get('/login', function () {
    return redirect()->away(rtrim((string) config('app.frontend_url'), '/').'/login');
})->name('login');

Route::get('/email/verify/{id}/{hash}', function (Request $request) {
    $user = User::findOrFail($request->route('id'));

    if (! URL::hasValidSignature($request)) {
        abort(403);
    }

    if (! hash_equals((string) $request->route('hash'), sha1($user->getEmailForVerification()))) {
        abort(403);
    }

    if ($user->hasVerifiedEmail()) {
        return redirect()->away(rtrim((string) config('app.frontend_url'), '/').'/login?verified=already');
    }

    if ($user->markEmailAsVerified()) {
        event(new Verified($user));
    }

    return redirect()->away(rtrim((string) config('app.frontend_url'), '/').'/login?verified=1');
})->middleware('signed')->name('verification.verify');
