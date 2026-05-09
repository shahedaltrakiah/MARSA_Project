<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\ProjectInvitation;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->startupProfile()->create();

        $joinedProjectId = $this->acceptPendingProjectInvitation($user, $validated['invite_token'] ?? null);

        $user->sendEmailVerificationNotification();

        $token = $user->createToken('auth_token')->plainTextToken;

        $payload = [
            'user' => new UserResource($user->fresh()),
            'token' => $token,
        ];

        if ($joinedProjectId !== null) {
            $payload['meta'] = ['joined_project_id' => $joinedProjectId];
        }

        return response()->json($payload, 201);
    }

    private function acceptPendingProjectInvitation(User $user, ?string $inviteToken): ?int
    {
        if ($inviteToken === null || $inviteToken === '') {
            return null;
        }

        $invitation = ProjectInvitation::query()
            ->where('token', $inviteToken)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->first();

        if ($invitation === null) {
            return null;
        }

        if (strcasecmp((string) $invitation->email, (string) $user->email) !== 0) {
            return null;
        }

        $project = $invitation->project;

        if ($project->isOwnedBy($user)) {
            $invitation->delete();

            return null;
        }

        $project->collaborators()->syncWithoutDetaching([
            $user->id => ['role' => $invitation->role],
        ]);

        $invitation->update(['accepted_at' => now()]);

        return $project->id;
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        Password::sendResetLink(['email' => $request->email]);

        $response = ['message' => 'If an account with that email exists, a reset link has been sent.'];

        // In local dev, surface the reset URL so testers don't need email configured
        if (app()->environment('local')) {
            $user = User::where('email', $request->email)->first();
            if ($user) {
                $token = Password::createToken($user);
                $base = rtrim(config('app.frontend_url', 'http://localhost:3001'), '/');
                $response['dev_reset_url'] = $base
                    .'/reset-password?token='.$token
                    .'&email='.rawurlencode($user->email);
            }
        }

        return response()->json($response);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required', 'string'],
        ]);

        $status = Password::reset(
            $validated,
            function (User $user, string $password) {
                $user->forceFill(['password' => Hash::make($password)])->save();
                $user->tokens()->delete();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Password has been reset successfully.']);
        }

        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => new UserResource($request->user())]);
    }

    public function updateMe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $request->user()->update(['name' => $validated['name']]);

        return response()->json(['user' => new UserResource($request->user()->fresh())]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required', 'string'],
        ]);

        if (! Hash::check($validated['current_password'], $request->user()->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $request->user()->update(['password' => Hash::make($validated['password'])]);

        return response()->json(['message' => 'Password updated successfully']);
    }
}
