<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSettings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SiteSettingsAdminController extends Controller
{
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'primary_color'   => ['sometimes', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'secondary_color' => ['sometimes', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'logo_url'        => ['sometimes', 'nullable', 'url'],
        ]);

        $settings = SiteSettings::current();
        $settings->update($validated);

        return response()->json(['data' => $settings->fresh()]);
    }

    public function uploadLogo(Request $request): JsonResponse
    {
        $request->validate([
            'logo' => ['required', 'image', 'max:2048'],
        ]);

        $path = $request->file('logo')->store('logos', 'public');
        $url  = Storage::disk('public')->url($path);

        $settings = SiteSettings::current();
        $settings->update(['logo_url' => $url]);

        return response()->json(['data' => $settings->fresh()]);
    }
}
