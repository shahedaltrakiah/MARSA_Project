<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Allows super_admin for any site editor API; allows admin only when they have the matching section in admin_site_permissions.
 * Pass middleware arg "content" for PUT /content-blocks/{key} — section is derived from the key.
 */
class EnsureAdminSiteSection
{
    public function handle(Request $request, Closure $next, string $section): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(401);
        }

        if (($user->role ?? '') === 'super_admin') {
            return $next($request);
        }

        if (($user->role ?? '') !== 'admin') {
            abort(403, 'Insufficient permissions.');
        }

        $required = $this->resolveSection($request, $section);

        $perms = $user->admin_site_permissions ?? [];

        if (! in_array($required, $perms, true)) {
            abort(403, 'No permission for this site section.');
        }

        return $next($request);
    }

    private function resolveSection(Request $request, string $section): string
    {
        if ($section !== 'content') {
            return $section;
        }

        $key = $request->route('key');
        if (! is_string($key)) {
            abort(404);
        }

        $resolved = match ($key) {
            'hero' => 'hero',
            'features' => 'features',
            'pricing_free', 'pricing_pro', 'pricing_team' => 'pricing',
            default => null,
        };

        if ($resolved === null) {
            abort(404, 'Unknown content block key.');
        }

        return $resolved;
    }
}
