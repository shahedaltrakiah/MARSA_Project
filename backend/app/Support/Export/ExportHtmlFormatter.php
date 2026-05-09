<?php

namespace App\Support\Export;

/**
 * Shared HTML normalization for PDF exports (DomPDF-safe subset).
 */
final class ExportHtmlFormatter
{
    private const ALLOWED_TAGS = '<p><br><br/><strong><b><em><i><u><ul><ol><li><span>';

    public static function safeRichText(?string $html): string
    {
        if ($html === null || trim($html) === '') {
            return '';
        }

        return strip_tags($html, self::ALLOWED_TAGS);
    }

    /**
     * @param  array<string, mixed>|null  $block  Workspace pillar { notes, points[] }
     */
    public static function pillarBlock(?array $block): string
    {
        if ($block === null) {
            return self::emptyPlaceholder();
        }

        $parts = [];
        $notes = self::safeRichText(isset($block['notes']) ? (string) $block['notes'] : '');
        if ($notes !== '') {
            $parts[] = $notes;
        }

        foreach ($block['points'] ?? [] as $point) {
            if (! is_array($point)) {
                continue;
            }
            $text = trim((string) ($point['text'] ?? ''));
            if ($text === '') {
                continue;
            }
            $parts[] = '<p class="bullet-line">'.e($text).'</p>';
        }

        if ($parts === []) {
            return self::emptyPlaceholder();
        }

        return implode('', $parts);
    }

    /**
     * @param  list<array{section: string, pillar: string}>  $refs
     */
    public static function combinePillars(ProjectSectionSnapshot $snapshot, array $refs): string
    {
        $chunks = [];
        foreach ($refs as $ref) {
            $html = self::pillarBlock($snapshot->pillar($ref['section'], $ref['pillar']));
            if ($html !== self::emptyPlaceholder()) {
                $chunks[] = $html;
            }
        }

        if ($chunks === []) {
            return self::emptyPlaceholder();
        }

        return implode('<div style="margin:0.5em 0;"></div>', $chunks);
    }

    public static function plainParagraph(?string $text): string
    {
        if ($text === null || trim($text) === '') {
            return self::emptyPlaceholder();
        }

        return '<p>'.nl2br(e(trim($text))).'</p>';
    }

    public static function labeledBlock(string $label, string $innerHtml): string
    {
        return '<div class="labeled-block"><h4 class="pillar-label">'.e($label).'</h4>'.$innerHtml.'</div>';
    }

    public static function emptyPlaceholder(): string
    {
        return '<p class="muted-line">—</p>';
    }

    /**
     * @param  array<string, string>  $fields  label => plain text or null
     */
    public static function labeledPlainSections(array $fields): string
    {
        $out = '';
        foreach ($fields as $label => $value) {
            if ($value === null || trim((string) $value) === '') {
                continue;
            }
            $out .= self::labeledBlock($label, self::plainParagraph((string) $value));
        }

        return $out !== '' ? $out : self::emptyPlaceholder();
    }
}
