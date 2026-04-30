<?php
namespace App\Http\Controllers;

use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\ProfileResource;
use App\Jobs\AIReEvaluationJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $profile = $request->user()->startupProfile()->firstOrCreate([]);
        $profile->load('files');
        return response()->json(['data' => new ProfileResource($profile)]);
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $profile = $request->user()->startupProfile()->firstOrCreate([]);
        $profile->update($request->validated());
        $profile->refresh();
        $profile->load('files');

        AIReEvaluationJob::dispatch($profile);

        return response()->json(['data' => new ProfileResource($profile)]);
    }
}
