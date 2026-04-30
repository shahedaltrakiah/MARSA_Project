<?php
namespace App\Http\Controllers;

use App\Http\Requests\StoreCollaboratorRequest;
use App\Http\Resources\ProjectCollaboratorResource;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectCollaboratorController extends Controller
{
    public function index(Request $request, Project $project): JsonResponse
    {
        $this->authorize('view', $project);
        return response()->json([
            'data' => ProjectCollaboratorResource::collection($project->collaborators),
        ]);
    }

    public function store(StoreCollaboratorRequest $request, Project $project): JsonResponse
    {
        $invitee = User::where('email', $request->email)->first();

        $project->collaborators()->syncWithoutDetaching([
            $invitee->id => ['role' => $request->role],
        ]);

        return response()->json(['message' => 'Collaborator added'], 201);
    }

    public function destroy(Request $request, Project $project, User $user): JsonResponse
    {
        $this->authorize('delete', $project);
        $project->collaborators()->detach($user->id);
        return response()->json(['message' => 'Collaborator removed']);
    }
}
