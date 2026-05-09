<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AiSuggestController extends Controller
{
    private const SECTION_LABELS = [
        'offering' => 'Value proposition, SWOT, solution, and future growth — structured as points and notes per area',
        'reach' => 'Business model, branding, marketing, and sales strategy',
        'customer' => 'Segments, profile, market & team, partners, setup, technology, and journey — points and notes per area',
        'money' => 'Investment, revenue, CAC & CLV, and cashflow — points and notes per area',
        'assets' => 'Team, partners, setup, and technology — points and notes per area',
        'action' => 'Tasks, research, validation, and KPIs — points and notes per area',
        'targets' => 'Cash, position, awareness, and value goals — points and notes per area',
    ];

    public function suggest(Request $request, Project $project): JsonResponse
    {
        $project->loadMissing('collaborators');
        $this->authorize('view', $project);

        $validated = $request->validate([
            'section' => ['required', 'string', 'in:'.implode(',', array_keys(self::SECTION_LABELS))],
            'pillar' => ['nullable', 'string'],
        ]);

        $section = $validated['section'];
        $pillar = $validated['pillar'] ?? null;

        $sectionModel = $project->sections()->where('section', $section)->first();
        $content = $sectionModel?->content ?? [];

        $focusContent = ($pillar && isset($content[$pillar])) ? $content[$pillar] : $content;

        $apiKey = config('services.anthropic.key');
        if (! $apiKey) {
            return response()->json(['suggestion' => 'AI suggestions are not configured.'], 503);
        }

        $prompt = $this->buildPrompt($project->name, $section, $pillar, $focusContent);

        $response = Http::withHeaders([
            'x-api-key' => $apiKey,
            'anthropic-version' => '2023-06-01',
        ])->post('https://api.anthropic.com/v1/messages', [
            'model' => config('services.anthropic.model'),
            'max_tokens' => 1024,
            'messages' => [
                ['role' => 'user', 'content' => $prompt],
            ],
        ]);

        if ($response->failed()) {
            return response()->json(['error' => 'AI service unavailable. Please try again.'], 502);
        }

        $suggestion = $response->json('content.0.text', '');

        return response()->json(['suggestion' => $suggestion]);
    }

    private function buildPrompt(string $projectName, string $section, ?string $pillar, array $content): string
    {
        $label = self::SECTION_LABELS[$section];
        $pillarNote = $pillar ? " (pillar: {$pillar})" : '';
        $contentJson = empty($content)
            ? '(no content saved yet)'
            : json_encode($content, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

        return <<<PROMPT
You are an expert startup advisor helping founders strengthen their business strategy.

Project: {$projectName}
Section: {$section}{$pillarNote} — {$label}

Current content:
{$contentJson}

Provide 3-5 concise, specific, actionable suggestions to improve this section. Focus on what is missing, what could be stronger, or what the founder should think about. Be direct and practical. Format as a numbered list. Do not repeat what is already written — only suggest improvements or additions.
PROMPT;
    }
}
