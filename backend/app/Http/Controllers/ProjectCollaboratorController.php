<?php
namespace App\Http\Controllers;

use App\Http\Requests\StoreCollaboratorRequest;
use App\Http\Resources\ProjectCollaboratorResource;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\JsonResponse;

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
        $invitee = User::where('email', $request->validated('email'))->firstOrFail();

        if ($project->isOwnedBy($invitee)) {
            abort(422, 'The project owner cannot be added as a collaborator.');
        }

        $project->collaborators()->syncWithoutDetaching([
            $invitee->id => ['role' => $request->validated('role')],
        ]);

        return response()->json(['message' => 'Collaborator added'], 201);
    }

    public function destroy(Project $project, User $user): JsonResponse
    {
        $this->authorize('delete', $project);
        $project->collaborators()->detach($user->id);
        return response()->json(['message' => 'Collaborator removed']);
    }
}
