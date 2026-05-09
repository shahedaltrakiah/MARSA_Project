<?php

namespace App\Support\Export;

use App\Models\Project;
use App\Support\FrameworkSectionSchema;
use Illuminate\Support\Str;

/**
 * Normalizes project + sections into Blade-ready arrays (plan + canvas).
 * Canvas BMC mapping is centralized here to avoid duplicating pillar logic.
 */
final class ProjectExportViewData
{
    /**
     * @return array<string, mixed>
     */
    public static function businessPlan(Project $project, ?string $watermarkDataUri, ?string $headerLogoDataUri = null): array
    {
        $snapshot = new ProjectSectionSnapshot($project);

        return [
            'watermarkDataUri' => $watermarkDataUri,
            'headerLogoDataUri' => $headerLogoDataUri ?? $watermarkDataUri,
            'projectName' => $project->name,
            'generatedAt' => now()->format('Y-m-d H:i'),
            'executiveSummaryHtml' => self::executiveSummary($project),
            'offeringHtml' => self::renderSectionGroup($snapshot, 'offering'),
            'marketCustomerHtml' => self::renderSectionGroup($snapshot, 'customer'),
            'reachHtml' => self::renderSectionGroup($snapshot, 'reach'),
            'moneyHtml' => self::renderSectionGroup($snapshot, 'money'),
            'growthPlanHtml' => self::growthPlan($snapshot),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function canvas(Project $project, ?string $watermarkDataUri, ?string $headerLogoDataUri = null): array
    {
        $snapshot = new ProjectSectionSnapshot($project);

        return [
            'watermarkDataUri' => $watermarkDataUri,
            'headerLogoDataUri' => $headerLogoDataUri ?? $watermarkDataUri,
            'projectName' => $project->name,
            'generatedAt' => now()->format('Y-m-d H:i'),
            'blocks' => self::canvasBlocks($snapshot),
        ];
    }

    private static function executiveSummary(Project $project): string
    {
        $idea = $project->idea_profile;
        if (! is_array($idea)) {
            return ExportHtmlFormatter::emptyPlaceholder();
        }

        $fields = [
            'Overview' => $project->description,
            'Business category' => $idea['business_category'] ?? null,
            'Audience' => isset($idea['business_audience']) ? strtoupper((string) $idea['business_audience']) : null,
            'Stage' => $idea['stage'] ?? null,
            'Core idea' => $idea['core_idea'] ?? null,
            'Problem' => $idea['problem'] ?? null,
            'Solution' => $idea['solution'] ?? null,
            'Customer & market' => $idea['customer_market'] ?? null,
            'Team' => $idea['team'] ?? null,
            'Traction' => $idea['traction'] ?? null,
            'Current challenge' => $idea['current_challenge'] ?? null,
            '3-month goal' => $idea['goal_3m'] ?? null,
        ];

        return ExportHtmlFormatter::labeledPlainSections($fields);
    }

    private static function renderSectionGroup(ProjectSectionSnapshot $snapshot, string $sectionKey): string
    {
        $pillars = FrameworkSectionSchema::FLAT_SECTIONS[$sectionKey] ?? [];
        $html = '';
        foreach ($pillars as $pillarKey) {
            $label = Str::title(str_replace('_', ' ', $pillarKey));
            $inner = ExportHtmlFormatter::pillarBlock($snapshot->pillar($sectionKey, $pillarKey));
            $html .= ExportHtmlFormatter::labeledBlock($label, $inner);
        }

        return $html !== '' ? $html : ExportHtmlFormatter::emptyPlaceholder();
    }

    private static function growthPlan(ProjectSectionSnapshot $snapshot): string
    {
        $parts = [
            '<h3 class="growth-subhead">Targets</h3>'.self::renderSectionGroup($snapshot, 'targets'),
            '<h3 class="growth-subhead">Action</h3>'.self::renderSectionGroup($snapshot, 'action'),
            '<h3 class="growth-subhead">Future growth</h3>'
                .ExportHtmlFormatter::pillarBlock($snapshot->pillar('offering', 'future_growth')),
            '<h3 class="growth-subhead">Resources &amp; assets</h3>'.self::renderSectionGroup($snapshot, 'assets'),
        ];

        return implode('<div style="height:10px;"></div>', $parts);
    }

    /**
     * Business Model Canvas — nine blocks mapped from framework pillars.
     *
     * @return list<array{key: string, title: string, html: string}>
     */
    private static function canvasBlocks(ProjectSectionSnapshot $snapshot): array
    {
        $defs = [
            [
                'key' => 'value_propositions',
                'title' => 'Value Propositions',
                'refs' => [
                    ['section' => 'offering', 'pillar' => 'value_proposition'],
                    ['section' => 'offering', 'pillar' => 'solution'],
                ],
            ],
            [
                'key' => 'customer_segments',
                'title' => 'Customer Segments',
                'refs' => [
                    ['section' => 'customer', 'pillar' => 'segments'],
                    ['section' => 'customer', 'pillar' => 'profile'],
                ],
            ],
            [
                'key' => 'channels',
                'title' => 'Channels',
                'refs' => [
                    ['section' => 'reach', 'pillar' => 'marketing'],
                    ['section' => 'reach', 'pillar' => 'sales'],
                    ['section' => 'reach', 'pillar' => 'branding'],
                ],
            ],
            [
                'key' => 'customer_relationships',
                'title' => 'Customer Relationships',
                'refs' => [
                    ['section' => 'customer', 'pillar' => 'journey'],
                    ['section' => 'reach', 'pillar' => 'sales'],
                ],
            ],
            [
                'key' => 'revenue_streams',
                'title' => 'Revenue Streams',
                'refs' => [
                    ['section' => 'money', 'pillar' => 'revenue'],
                    ['section' => 'reach', 'pillar' => 'business_model'],
                ],
            ],
            [
                'key' => 'key_resources',
                'title' => 'Key Resources',
                'refs' => [
                    ['section' => 'assets', 'pillar' => 'team'],
                    ['section' => 'assets', 'pillar' => 'technology'],
                    ['section' => 'assets', 'pillar' => 'setup'],
                ],
            ],
            [
                'key' => 'key_activities',
                'title' => 'Key Activities',
                'refs' => [
                    ['section' => 'action', 'pillar' => 'tasks'],
                    ['section' => 'action', 'pillar' => 'validation'],
                    ['section' => 'action', 'pillar' => 'research'],
                ],
            ],
            [
                'key' => 'key_partnerships',
                'title' => 'Key Partnerships',
                'refs' => [
                    ['section' => 'assets', 'pillar' => 'partners'],
                ],
            ],
            [
                'key' => 'cost_structure',
                'title' => 'Cost Structure',
                'refs' => [
                    ['section' => 'money', 'pillar' => 'investment'],
                    ['section' => 'money', 'pillar' => 'cashflow'],
                    ['section' => 'money', 'pillar' => 'cac_clv'],
                ],
            ],
        ];

        $out = [];
        foreach ($defs as $def) {
            $out[] = [
                'key' => $def['key'],
                'title' => $def['title'],
                'html' => ExportHtmlFormatter::combinePillars($snapshot, $def['refs']),
            ];
        }

        return $out;
    }
}
