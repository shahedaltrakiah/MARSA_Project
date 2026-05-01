<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectSection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectSectionController extends Controller
{
    private const ALLOWED_FIELDS = [
        'offering'       => ['value_proposition', 'product_description', 'key_features', 'differentiation'],
        'business-model' => ['revenue_streams', 'pricing_model', 'cost_structure', 'key_activities'],
        'customer'       => ['target_segments', 'customer_problem', 'acquisition_channels', 'retention_strategy'],
        'money'          => ['monthly_revenue', 'burn_rate', 'runway', 'funding_target', 'financial_notes'],
        'assets'         => ['key_resources', 'technology', 'team_strengths', 'strategic_advantages'],
        'action'         => ['current_focus', 'next_milestone', 'key_metrics', 'blockers'],
    ];

    public function show(Request $request, Project $project, string $section): JsonResponse
    {
        $project->loadMissing('collaborators');
        $this->authorize('view', $project);
        $this->abortIfInvalidSection($section);

        $sectionModel = $project->sections()->where('section', $section)->first();

        return response()->json(['data' => $sectionModel?->content ?? []]);
    }

    public function update(Request $request, Project $project, string $section): JsonResponse
    {
        $project->loadMissing('collaborators');
        $this->authorize('update', $project);
        $this->abortIfInvalidSection($section);

        $allowed = self::ALLOWED_FIELDS[$section];
        $rules = array_fill_keys($allowed, ['nullable', 'string', 'max:5000']);
        $validated = $request->validate($rules);

        $content = array_filter($validated, fn($v) => $v !== null);

        $sectionModel = $project->sections()->firstOrCreate(
            ['section' => $section],
            ['content' => [], 'updated_by' => $request->user()->id]
        );

        $sectionModel->update([
            'content'    => array_merge($sectionModel->content ?? [], $content),
            'updated_by' => $request->user()->id,
        ]);

        return response()->json(['data' => $sectionModel->fresh()->content]);
    }

    private function abortIfInvalidSection(string $section): void
    {
        if (! array_key_exists($section, self::ALLOWED_FIELDS)) {
            abort(404, 'Section not found.');
        }
    }
}
