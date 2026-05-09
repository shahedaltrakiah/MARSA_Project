<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Support\FrameworkSectionSchema;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectSectionController extends Controller
{
    /**
     * @see FrameworkSectionSchema
     */
    private const FLAT_SECTIONS = FrameworkSectionSchema::FLAT_SECTIONS;

    private const PILLAR_SECTIONS = [
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

        $sectionModel = $project->sections()->firstOrCreate(
            ['section' => $section],
            ['content' => [], 'updated_by' => $request->user()->id]
        );

        $existing = $sectionModel->content ?? [];

        if ($this->isPillarSection($section)) {
            $merged = $this->mergePillarContent($request, $section, $existing);
        } else {
            $merged = $this->mergeFlatContent($request, $section, $existing);
        }

        $sectionModel->update([
            'content' => $merged,
            'updated_by' => $request->user()->id,
        ]);

        return response()->json(['data' => $sectionModel->fresh()->content]);
    }

    private function isPillarSection(string $section): bool
    {
        return array_key_exists($section, self::PILLAR_SECTIONS);
    }

    private function mergeFlatContent(Request $request, string $section, array $existing): array
    {
        $fields = self::FLAT_SECTIONS[$section];
        $rules = [];
        foreach ($fields as $field) {
            $rules[$field] = ['nullable', 'array'];
            $rules[$field.'.notes'] = ['nullable', 'string', 'max:100000'];
            $rules[$field.'.points'] = ['nullable', 'array', 'max:2000'];
            $rules[$field.'.points.*.id'] = ['required', 'string', 'max:64'];
            $rules[$field.'.points.*.text'] = ['nullable', 'string', 'max:8000'];
            $rules[$field.'.points.*.starred'] = ['sometimes', 'boolean'];
            $rules[$field.'.points.*.target_date'] = ['nullable', 'string', 'max:32'];
        }

        $validated = $request->validate($rules);

        foreach ($fields as $field) {
            if (! array_key_exists($field, $validated)) {
                continue;
            }
            $block = $validated[$field];
            $block['notes'] = $block['notes'] ?? '';
            $block['points'] = array_values($block['points'] ?? []);
            $existing[$field] = $block;
        }

        return $existing;
    }

    private function mergePillarContent(Request $request, string $section, array $existing): array
    {
        $pillars = self::PILLAR_SECTIONS[$section];
        $pillarKeys = array_keys($pillars);

        $rules = ['pillar' => ['required', 'string', 'in:'.implode(',', $pillarKeys)]];
        foreach ($pillars as $pillarFields) {
            foreach ($pillarFields as $field) {
                $rules[$field] = ['nullable', 'string', 'max:5000'];
            }
        }

        $validated = $request->validate($rules);
        $pillar = $validated['pillar'];
        $fields = $pillars[$pillar];

        $incoming = [];
        foreach ($fields as $field) {
            if (isset($validated[$field])) {
                $incoming[$field] = $validated[$field];
            }
        }

        $existing[$pillar] = array_merge($existing[$pillar] ?? [], $incoming);

        return $existing;
    }

    private function abortIfInvalidSection(string $section): void
    {
        $valid = array_merge(
            array_keys(self::FLAT_SECTIONS),
            array_keys(self::PILLAR_SECTIONS)
        );

        if (! in_array($section, $valid, true)) {
            abort(404, 'Section not found.');
        }
    }
}
