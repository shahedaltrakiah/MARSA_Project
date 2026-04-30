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
        $profile = $request->user()->startupProfile()->with('files')->firstOrCreate();
        return response()->json(['data' => new ProfileResource($profile)]);
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $profile = $request->user()->startupProfile()->with('files')->firstOrCreate();
        $profile->update($request->validated());

        AIReEvaluationJob::dispatch($profile);

        return response()->json(['data' => new ProfileResource($profile)]);
    }
}
