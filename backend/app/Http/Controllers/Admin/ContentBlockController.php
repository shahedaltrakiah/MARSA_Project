<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContentBlock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContentBlockController extends Controller
{
    private const VALID_KEYS = ['hero', 'features', 'pricing_free', 'pricing_pro', 'pricing_team'];

    public function update(Request $request, string $key): JsonResponse
    {
        if (! in_array($key, self::VALID_KEYS, true)) {
            abort(404, 'Unknown content block key.');
        }

        $validated = $request->validate([
            'content' => ['required', 'array'],
        ]);

        $block = ContentBlock::updateOrCreate(
            ['key' => $key],
            ['content' => $validated['content']]
        );

        return response()->json(['data' => $block->fresh()]);
    }
}
