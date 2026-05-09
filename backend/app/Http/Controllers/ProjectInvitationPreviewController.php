<?php

namespace App\Http\Controllers;

use App\Models\ProjectInvitation;
use Illuminate\Http\JsonResponse;

/**
 * Public preview for invite links (register page banner).
 */
class ProjectInvitationPreviewController extends Controller
{
    public function show(string $token): JsonResponse
    {
        $invitation = ProjectInvitation::query()
            ->where('token', $token)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->with(['project:id,name'])
            ->first();

        if ($invitation === null) {
            return response()->json(['message' => 'Invitation not found or expired.'], 404);
        }

        return response()->json([
            'data' => [
                'project_name' => $invitation->project->name,
                'role' => $invitation->role,
                'email' => $invitation->email,
                'expires_at' => $invitation->expires_at,
            ],
        ]);
    }
}
