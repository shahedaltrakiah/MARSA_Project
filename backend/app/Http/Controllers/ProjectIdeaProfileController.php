<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Services\FrameworkBootstrapFromIdeaService;
use App\Support\PublicStoragePath;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectIdeaProfileController extends Controller
{
    public function show(Request $request, Project $project): JsonResponse
    {
        $project->loadMissing('collaborators');
        $this->authorize('view', $project);

        return response()->json([
            'data' => [
                'idea_profile' => $project->idea_profile ?? (object) [],
                'idea_profile_completed_at' => $project->idea_profile_completed_at,
            ],
        ]);
    }

    /** Free-text fields: min 8 chars when marking complete (except stage). */
    private const TEXT_FIELDS_MIN8 = [
        'core_idea',
        'problem',
        'solution',
        'customer_market',
        'team',
        'traction',
        'current_challenge',
        'goal_3m',
    ];

    private const STAGE_FIELD = 'stage';

    private const CATEGORY_FIELD = 'business_category';

    private const AUDIENCE_FIELD = 'business_audience';

    public function update(Request $request, Project $project): JsonResponse
    {
        $project->loadMissing('collaborators');
        $this->authorize('update', $project);

        $rules = [
            'mark_complete' => ['sometimes', 'boolean'],
            'idea_profile' => ['required', 'array'],
        ];
        $rules['idea_profile.'.self::CATEGORY_FIELD] = ['nullable', 'string', 'max:20000'];
        $rules['idea_profile.'.self::AUDIENCE_FIELD] = ['nullable', 'string', 'max:32'];
        $rules['idea_profile.'.self::STAGE_FIELD] = ['nullable', 'string', 'max:20000'];
        foreach (self::TEXT_FIELDS_MIN8 as $field) {
            $rules['idea_profile.'.$field] = ['nullable', 'string', 'max:20000'];
        }
        $rules['idea_profile.business_type'] = ['nullable', 'string', 'max:20000'];
        $rules['idea_profile.files'] = ['nullable', 'array'];
        $rules['idea_profile.files.*.url'] = ['required_with:idea_profile.files', 'string', 'max:2000'];
        $rules['idea_profile.files.*.original_name'] = ['required_with:idea_profile.files.*.url', 'string', 'max:255'];

        $validated = $request->validate($rules);

        $incoming = $validated['idea_profile'];
        $existing = $project->idea_profile ?? [];
        $merged = array_merge($existing, $incoming);

        if (! array_key_exists('files', $incoming)) {
            $merged['files'] = $existing['files'] ?? [];
        }
        if (! is_array($merged['files'])) {
            $merged['files'] = [];
        }

        $markComplete = (bool) ($validated['mark_complete'] ?? false);
        $completedAt = $project->idea_profile_completed_at;

        if ($markComplete) {
            $cat = isset($merged[self::CATEGORY_FIELD]) ? trim((string) $merged[self::CATEGORY_FIELD]) : '';
            if (strlen($cat) < 2) {
                return response()->json([
                    'message' => 'Idea profile incomplete.',
                    'errors' => ['idea_profile.'.self::CATEGORY_FIELD => ['Category must be at least 2 characters.']],
                ], 422);
            }

            $stage = isset($merged[self::STAGE_FIELD]) ? trim((string) $merged[self::STAGE_FIELD]) : '';
            if (strlen($stage) < 2) {
                return response()->json([
                    'message' => 'Idea profile incomplete.',
                    'errors' => ['idea_profile.'.self::STAGE_FIELD => ['Stage is required.']],
                ], 422);
            }

            $aud = strtolower(trim((string) ($merged[self::AUDIENCE_FIELD] ?? '')));
            if (! in_array($aud, ['b2b', 'b2c', 'both'], true)) {
                return response()->json([
                    'message' => 'Idea profile incomplete.',
                    'errors' => ['idea_profile.'.self::AUDIENCE_FIELD => ['Select B2B, B2C, or Both.']],
                ], 422);
            }

            foreach (self::TEXT_FIELDS_MIN8 as $field) {
                $v = isset($merged[$field]) ? trim((string) $merged[$field]) : '';
                if (strlen($v) < 8) {
                    return response()->json([
                        'message' => 'Idea profile incomplete.',
                        'errors' => ['idea_profile.'.$field => ['Must be at least 8 characters.']],
                    ], 422);
                }
            }
            $completedAt = now();
        }

        $project->update([
            'idea_profile' => $merged,
            'idea_profile_completed_at' => $completedAt,
            'last_modified_by' => $request->user()->id,
        ]);

        $project->refresh()->load(['owner', 'lastModifiedBy', 'collaborators']);

        $meta = [];
        if ($markComplete) {
            $meta['framework_bootstrap'] = app(FrameworkBootstrapFromIdeaService::class)
                ->bootstrap($project, $request->user()->id);
        }

        $payload = ['data' => new ProjectResource($project)];
        if ($meta !== []) {
            $payload['meta'] = $meta;
        }

        return response()->json($payload);
    }

    public function uploadFile(Request $request, Project $project): JsonResponse
    {
        $project->loadMissing('collaborators');
        $this->authorize('update', $project);

        $request->validate([
            'file' => ['required', 'file', 'max:10240'],
        ]);

        $stored = $request->file('file')->store("project-idea-files/{$project->id}", 'public');
        $stableUrl = PublicStoragePath::fromStoredPath($stored);
        $original = $request->file('file')->getClientOriginalName();

        $profile = $project->idea_profile ?? [];
        $files = $profile['files'] ?? [];
        $files[] = [
            'url' => $stableUrl,
            'original_name' => $original,
        ];
        $profile['files'] = $files;

        $project->update([
            'idea_profile' => $profile,
            'last_modified_by' => $request->user()->id,
        ]);

        return response()->json([
            'data' => [
                'url' => $stableUrl,
                'original_name' => $original,
            ],
        ], 201);
    }
}
