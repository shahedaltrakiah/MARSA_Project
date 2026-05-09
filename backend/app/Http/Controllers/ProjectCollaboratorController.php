<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCollaboratorRequest;
use App\Http\Resources\ProjectCollaboratorResource;
use App\Http\Resources\ProjectResource;
use App\Mail\CollaboratorAddedToProjectMail;
use App\Mail\ProjectInvitationMail;
use App\Models\Project;
use App\Models\ProjectInvitation;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class ProjectCollaboratorController extends Controller
{
    public function index(Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        return response()->json([
            'data' => ProjectCollaboratorResource::collection($project->collaborators),
        ]);
    }

    public function store(StoreCollaboratorRequest $request, Project $project): JsonResponse
    {
        $email = $request->validated('email');
        $role = $request->validated('role');

        $invitee = User::where('email', $email)->first();

        if ($invitee !== null) {
            ProjectInvitation::query()
                ->where('project_id', $project->id)
                ->where('email', $email)
                ->delete();

            if ($project->isOwnedBy($invitee)) {
                abort(422, 'The project owner cannot be added as a collaborator.');
            }

            $project->collaborators()->syncWithoutDetaching([
                $invitee->id => ['role' => $role],
            ]);

            Mail::to($invitee->email)->send(
                new CollaboratorAddedToProjectMail(
                    $project->fresh()->load('owner'),
                    $request->user(),
                    $invitee,
                    $role
                )
            );

            return response()->json([
                'data' => new ProjectResource($project->fresh()->load(['owner', 'lastModifiedBy', 'collaborators'])),
                'meta' => [
                    'collaborator_added' => true,
                ],
            ], 201);
        }

        $invitation = ProjectInvitation::query()->updateOrCreate(
            [
                'project_id' => $project->id,
                'email' => $email,
            ],
            [
                'role' => $role,
                'token' => Str::random(64),
                'expires_at' => now()->addDays(14),
                'invited_by' => $request->user()->id,
                'accepted_at' => null,
            ]
        );

        $locale = (string) config('app.frontend_default_locale', 'en');
        $registerUrl = rtrim((string) config('app.frontend_url'), '/').'/'.$locale.'/register?invite='.$invitation->token;

        Mail::to($email)->send(new ProjectInvitationMail(
            $invitation,
            $project->fresh()->load('owner'),
            $request->user(),
            $registerUrl
        ));

        return response()->json([
            'data' => new ProjectResource($project->fresh()->load(['owner', 'lastModifiedBy', 'collaborators'])),
            'meta' => [
                'invitation_sent' => true,
                'email' => $email,
            ],
        ], 201);
    }

    public function destroy(Project $project, User $user): JsonResponse
    {
        $project->loadMissing('collaborators');
        $this->authorize('update', $project);
        $project->collaborators()->detach($user->id);

        return response()->json([
            'data' => new ProjectResource($project->fresh()->load(['owner', 'lastModifiedBy', 'collaborators'])),
        ]);
    }
}
