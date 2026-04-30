<?php
namespace App\Http\Controllers;

use App\Http\Resources\ProfileFileResource;
use App\Models\ProfileFile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\File;

class ProfileFileController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => [
                'required',
                File::types(['pdf', 'docx', 'pptx'])->max(20 * 1024),
            ],
        ]);

        $profile = $request->user()->startupProfile()->firstOrCreate([]);
        $uploaded = $request->file('file');
        $path = $uploaded->store("profile-files/{$profile->id}", 'local');

        $file = $profile->files()->create([
            'original_name' => $uploaded->getClientOriginalName(),
            'path' => $path,
            'mime_type' => $uploaded->getMimeType(),
            'size' => $uploaded->getSize(),
        ]);

        return response()->json(['data' => new ProfileFileResource($file)], 201);
    }

    public function destroy(Request $request, ProfileFile $profileFile): JsonResponse
    {
        $profile = $request->user()->startupProfile;
        abort_if($profileFile->profile_id !== $profile?->id, 403);

        Storage::disk('local')->delete($profileFile->path);
        $profileFile->delete();

        return response()->json(['message' => 'File deleted']);
    }
}
