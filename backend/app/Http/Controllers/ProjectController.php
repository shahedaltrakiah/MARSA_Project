<?php
namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $projects = Project::where('owner_id', $request->user()->id)
            ->orWhereHas('collaborators', fn($q) => $q->where('user_id', $request->user()->id))
            ->with(['owner', 'lastModifiedBy'])
            ->get();

        return response()->json(['data' => ProjectResource::collection($projects)]);
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $project = Project::create([
            ...$request->validated(),
            'owner_id' => $request->user()->id,
        ]);

        return response()->json(['data' => new ProjectResource($project->load('owner'))], 201);
    }

    public function show(Request $request, Project $project): JsonResponse
    {
        $project->loadMissing('collaborators');
        $this->authorize('view', $project);
        return response()->json(['data' => new ProjectResource($project->load(['owner', 'lastModifiedBy', 'collaborators']))]);
    }

    public function update(UpdateProjectRequest $request, Project $project): JsonResponse
    {
        $project->loadMissing('collaborators');
        $this->authorize('update', $project);
        $project->update([...$request->validated(), 'last_modified_by' => $request->user()->id]);
        return response()->json(['data' => new ProjectResource($project->load(['owner', 'lastModifiedBy']))]);
    }

    public function destroy(Request $request, Project $project): JsonResponse
    {
        $this->authorize('delete', $project);
        $project->delete();
        return response()->json(['message' => 'Project deleted']);
    }

    public function cloneProject(Request $request, Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $clone = $project->replicate();
        $clone->name = $project->name . ' (Copy)';
        $clone->owner_id = $request->user()->id;
        $clone->last_modified_by = null;
        $clone->save();

        return response()->json(['data' => new ProjectResource($clone->load('owner'))], 201);
    }
}
