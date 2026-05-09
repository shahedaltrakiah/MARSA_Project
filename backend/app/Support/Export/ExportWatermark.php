<?php

namespace App\Support\Export;

/**
 * Embeds the export watermark as a data URI so DomPDF does not depend on remote URLs.
 */
final class ExportWatermark
{
    /** Full MARSA wordmark + tagline (used in PDF header + optional watermark). */
    public static function brandLockupPath(): string
    {
        return public_path('assets/marsa-brand-lockup.png');
    }

    public static function defaultPath(): string
    {
        return self::brandLockupPath();
    }

    public static function dataUri(?string $absolutePath = null): ?string
    {
        // DomPDF embeds PNG/JPEG via GD; without it, image rendering throws and the whole PDF fails.
        if (! extension_loaded('gd')) {
            return null;
        }

        $path = $absolutePath ?? self::defaultPath();
        if (! is_readable($path)) {
            return null;
        }

        $binary = @file_get_contents($path);
        if ($binary === false || $binary === '') {
            return null;
        }

        $mime = self::guessMime($path) ?? 'image/png';

        return 'data:'.$mime.';base64,'.base64_encode($binary);
    }

    /** Prefer full lockup; fall back to legacy mark if missing on disk. */
    public static function brandDataUriForExport(): ?string
    {
        $uri = self::dataUri(self::brandLockupPath());
        if ($uri !== null) {
            return $uri;
        }

        return self::dataUri(public_path('assets/logo.png'));
    }

    private static function guessMime(string $path): ?string
    {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        if ($finfo === false) {
            return null;
        }
        try {
            $mime = finfo_file($finfo, $path);

            return is_string($mime) ? $mime : null;
        } finally {
            finfo_close($finfo);
        }
    }
}
