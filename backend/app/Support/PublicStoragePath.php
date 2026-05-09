<?php

namespace App\Support;

use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

final class PublicStoragePath
{
    /**
     * Web path for a file on the public disk (e.g. /storage/foo/bar.jpg).
     * When the disk URL is absolute (APP_URL + /storage), only the path component is kept so the value stays stable across APP_URL changes.
     */
    public static function fromStoredPath(string $stored): string
    {
        $disk = Storage::disk('public');
        if (! $disk instanceof FilesystemAdapter) {
            throw new RuntimeException('The public disk must use FilesystemAdapter.');
        }

        $url = $disk->url($stored);
        $parsed = parse_url($url);

        return is_array($parsed) && isset($parsed['path']) ? $parsed['path'] : $url;
    }
}
