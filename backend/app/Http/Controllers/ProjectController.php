<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Models\ProjectSection;
use App\Support\PublicStoragePath;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    /** Same set as the workspace framework progress UI (order preserved). */
    private const FRAMEWORK_OVERVIEW_SECTIONS = [
        'offering',
        'reach',
        'customer',
        'money',
        'assets',
        'action',
        'targets',
    ];

    public function index(Request $request): JsonResponse
    {
        $projects = Project::where('owner_id', $request->user()->id)
            ->orWhereHas('collaborators', fn ($q) => $q->where('user_id', $request->user()->id))
            ->with(['owner', 'lastModifiedBy'])
            ->get();

        return response()->json(['data' => ProjectResource::collection($projects)]);
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $name = $validated['name'];
        $description = $validated['description'] ?? null;
        $stringLogo = isset($validated['logo']) && is_string($validated['logo']) ? $validated['logo'] : null;

        $project = Project::create([
            'name' => $name,
            'description' => $description,
            'logo' => $stringLogo,
            'owner_id' => $request->user()->id,
        ]);

        if ($request->hasFile('logo')) {
            $stored = $request->file('logo')->store("project-logos/{$project->id}", 'public');
            $project->update(['logo' => PublicStoragePath::fromStoredPath($stored)]);
        }

        return response()->json(['data' => new ProjectResource($project->refresh()->load('owner'))], 201);
    }

    public function show(Request $request, Project $project): JsonResponse
    {
        $project->loadMissing('collaborators');
        $this->authorize('view', $project);

        return response()->json(['data' => new ProjectResource($project->load(['owner', 'lastModifiedBy', 'collaborators']))]);
    }

    /**
     * One round-trip for the framework progress page: project + all section payloads.
     * Avoids N+1 HTTP calls from the client (previously ~15 requests per page load).
     */
    public function frameworkOverview(Request $request, Project $project): JsonResponse
    {
        $project->loadMissing('collaborators');
        $this->authorize('view', $project);
        $project->load(['owner', 'lastModifiedBy']);

        $rows = ProjectSection::query()
            ->where('project_id', $project->id)
            ->whereIn('section', self::FRAMEWORK_OVERVIEW_SECTIONS)
            ->get(['section', 'content']);

        $sections = array_fill_keys(self::FRAMEWORK_OVERVIEW_SECTIONS, []);
        foreach ($rows as $row) {
            if (array_key_exists($row->section, $sections)) {
                $sections[$row->section] = $row->content ?? [];
            }
        }

        return response()->json([
            'data' => [
                'project' => new ProjectResource($project),
                'sections' => $sections,
            ],
        ]);
    }

    public function update(UpdateProjectRequest $request, Project $project): JsonResponse
    {
        $project->loadMissing('collaborators');
        $this->authorize('update', $project);

        $validated = $request->validated();

        if ($request->hasFile('logo')) {
            $stored = $request->file('logo')->store("project-logos/{$project->id}", 'public');
            $validated['logo'] = PublicStoragePath::fromStoredPath($stored);
        }

        $project->update([...$validated, 'last_modified_by' => $request->user()->id]);

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
        $clone->name = $project->name.' (Copy)';
        $clone->owner_id = $request->user()->id;
        $clone->last_modified_by = null;
        $clone->idea_profile = null;
        $clone->idea_profile_completed_at = null;
        $clone->save();

        return response()->json(['data' => new ProjectResource($clone->load('owner'))], 201);
    }
}
