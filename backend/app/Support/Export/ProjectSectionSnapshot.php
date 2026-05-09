<?php

namespace App\Support\Export;

use App\Models\Project;

/**
 * Read-only view of flat framework sections for export mapping.
 */
final class ProjectSectionSnapshot
{
    public function __construct(
        private readonly Project $project
    ) {
        $project->loadMissing('sections');
    }

    /**
     * @return array<string, mixed>|null Pillar block or null
     */
    public function pillar(string $section, string $pillar): ?array
    {
        $row = $this->project->sections->firstWhere('section', $section);
        if ($row === null || ! is_array($row->content)) {
            return null;
        }

        $block = $row->content[$pillar] ?? null;

        return is_array($block) ? $block : null;
    }

    /**
     * @return array<string, mixed>
     */
    public function sectionContent(string $section): array
    {
        $row = $this->project->sections->firstWhere('section', $section);
        if ($row === null || ! is_array($row->content)) {
            return [];
        }

        return $row->content;
    }
}
