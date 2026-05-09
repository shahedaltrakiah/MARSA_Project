<?php

namespace App\Services;

use App\Models\Project;
use App\Models\ProjectSection;
use App\Support\FrameworkSectionSchema;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class FrameworkBootstrapFromIdeaService
{
    /**
     * Pre-fill flat framework sections from the Idea Profile via Anthropic.
     * Only merges into pillar blocks that are still empty (notes + point texts).
     *
     * @return array{status: string, reason?: string}
     */
    public function bootstrap(Project $project, int $userId): array
    {
        $apiKey = config('services.anthropic.key');
        if (! $apiKey) {
            return ['status' => 'skipped', 'reason' => 'no_api_key'];
        }

        $idea = $project->idea_profile ?? [];
        if (! is_array($idea) || $idea === []) {
            return ['status' => 'skipped', 'reason' => 'no_idea_profile'];
        }

        $prompt = $this->buildPrompt($project->name, $idea);

        try {
            $response = Http::timeout(120)->withHeaders([
                'x-api-key' => $apiKey,
                'anthropic-version' => '2023-06-01',
            ])->post('https://api.anthropic.com/v1/messages', [
                'model' => config('services.anthropic.model'),
                'max_tokens' => 16384,
                'messages' => [
                    ['role' => 'user', 'content' => $prompt],
                ],
            ]);
        } catch (\Throwable $e) {
            Log::warning('framework_bootstrap_http_failed', [
                'project_id' => $project->id,
                'error' => $e->getMessage(),
            ]);

            return ['status' => 'failed', 'reason' => 'http_exception'];
        }

        if ($response->failed()) {
            Log::warning('framework_bootstrap_anthropic_failed', [
                'project_id' => $project->id,
                'status' => $response->status(),
            ]);

            return ['status' => 'failed', 'reason' => 'anthropic_error'];
        }

        $text = $response->json('content.0.text', '');
        $decoded = $this->parseJsonFromModelResponse($text);
        if ($decoded === null) {
            Log::warning('framework_bootstrap_parse_failed', [
                'project_id' => $project->id,
            ]);

            return ['status' => 'failed', 'reason' => 'invalid_json'];
        }

        $this->applyToProjectSections($project, $decoded, $userId);

        return ['status' => 'applied'];
    }

    private function buildPrompt(string $projectName, array $idea): string
    {
        $ideaJson = json_encode($idea, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        $schemaHint = $this->schemaHint();

        return <<<PROMPT
You are an expert startup strategist. The founder completed their Idea / Startup Profile. Use it as the single source of truth to pre-fill structured workspace content across ALL framework sections.

Project name: {$projectName}

Idea profile (JSON):
{$ideaJson}

{$schemaHint}

Rules:
- Respond with ONLY valid JSON, no markdown fences, no commentary before or after.
- Top-level keys MUST be exactly these 7 section keys: offering, reach, customer, money, assets, action, targets.
- Each section object MUST contain every pillar key listed for that section above.
- Each pillar value is an object: { "notes": string, "points": array }.
- "notes": 1–3 short HTML paragraphs (<p>...</p>) summarizing recommendations for that pillar; you may use <strong> for emphasis.
- "points": 4–8 items. Each item is { "text": string } only (do not include id).
- Text must be specific and actionable, grounded in the idea profile.
- Prefer the same language as the idea profile fields when obvious; otherwise English.
- Do not invent an unrelated business; extrapolate only from the profile.

Output the JSON object now.
PROMPT;
    }

    private function schemaHint(): string
    {
        $lines = [];
        foreach (FrameworkSectionSchema::FLAT_SECTIONS as $section => $pillars) {
            $guide = FrameworkSectionSchema::SECTION_GUIDANCE[$section] ?? '';
            $pillarList = implode(', ', $pillars);
            $lines[] = "- Section \"{$section}\" ({$guide}): pillar keys exactly [{$pillarList}]";
        }

        return "Required structure:\n".implode("\n", $lines);
    }

    private function parseJsonFromModelResponse(string $text): ?array
    {
        $text = trim($text);
        if (preg_match('/```(?:json)?\s*\R?(.*?)```/s', $text, $m)) {
            $text = trim($m[1]);
        }

        $decoded = json_decode($text, true);
        if (is_array($decoded)) {
            return $decoded;
        }

        $start = strpos($text, '{');
        $end = strrpos($text, '}');
        if ($start !== false && $end !== false && $end > $start) {
            $slice = substr($text, $start, $end - $start + 1);
            $decoded = json_decode($slice, true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $aiPayload
     */
    private function applyToProjectSections(Project $project, array $aiPayload, int $userId): void
    {
        foreach (FrameworkSectionSchema::FLAT_SECTIONS as $section => $pillars) {
            if (! isset($aiPayload[$section]) || ! is_array($aiPayload[$section])) {
                continue;
            }

            $incoming = $aiPayload[$section];

            /** @var ProjectSection $sectionModel */
            $sectionModel = $project->sections()->firstOrCreate(
                ['section' => $section],
                ['content' => [], 'updated_by' => $userId]
            );

            $existing = $sectionModel->content ?? [];
            $changed = false;

            foreach ($pillars as $pillar) {
                if (! isset($incoming[$pillar]) || ! is_array($incoming[$pillar])) {
                    continue;
                }

                $block = $this->normalizeBlock($incoming[$pillar]);
                $current = $existing[$pillar] ?? ['notes' => '', 'points' => []];

                if ($this->isBlockEmpty($current)) {
                    $existing[$pillar] = $block;
                    $changed = true;
                }
            }

            if ($changed) {
                $sectionModel->update([
                    'content' => $existing,
                    'updated_by' => $userId,
                ]);
            }
        }
    }

    /**
     * @param  array<string, mixed>  $raw
     * @return array{notes: string, points: list<array{id: string, text: string}>}
     */
    private function normalizeBlock(array $raw): array
    {
        $notes = isset($raw['notes']) ? trim((string) $raw['notes']) : '';
        $points = [];
        foreach ($raw['points'] ?? [] as $p) {
            if (! is_array($p)) {
                continue;
            }
            $text = isset($p['text']) ? trim((string) $p['text']) : '';
            if ($text === '') {
                continue;
            }
            $points[] = [
                'id' => (string) Str::uuid(),
                'text' => $text,
            ];
        }

        return [
            'notes' => $notes,
            'points' => array_values($points),
        ];
    }

    /**
     * @param  array<string, mixed>  $block
     */
    private function isBlockEmpty(array $block): bool
    {
        $notes = trim((string) ($block['notes'] ?? ''));
        if ($notes !== '') {
            return false;
        }
        foreach ($block['points'] ?? [] as $p) {
            if (! is_array($p)) {
                continue;
            }
            if (trim((string) ($p['text'] ?? '')) !== '') {
                return false;
            }
        }

        return true;
    }
}
