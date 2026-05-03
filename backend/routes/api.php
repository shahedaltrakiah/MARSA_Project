<?php
use App\Http\Controllers\AiSuggestController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProfileFileController;
use App\Http\Controllers\ProjectCollaboratorController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProjectSectionController;
use App\Http\Controllers\SiteController;
use Illuminate\Support\Facades\Route;

Route::get('/site', [SiteController::class, 'index']);

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
    Route::patch('/me', [AuthController::class, 'updateMe'])->middleware('auth:sanctum');
    Route::post('/change-password', [AuthController::class, 'changePassword'])->middleware('auth:sanctum');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/files', [ProfileFileController::class, 'store']);
    Route::delete('/profile/files/{profileFile}', [ProfileFileController::class, 'destroy']);

    Route::get('/projects', [ProjectController::class, 'index']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::get('/projects/{project}', [ProjectController::class, 'show']);
    Route::put('/projects/{project}', [ProjectController::class, 'update']);
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);
    Route::post('/projects/{project}/clone', [ProjectController::class, 'cloneProject']);

    Route::get('/projects/{project}/collaborators', [ProjectCollaboratorController::class, 'index']);
    Route::post('/projects/{project}/collaborators', [ProjectCollaboratorController::class, 'store']);
    Route::delete('/projects/{project}/collaborators/{user}', [ProjectCollaboratorController::class, 'destroy']);

    Route::get('/projects/{project}/sections/{section}', [ProjectSectionController::class, 'show']);
    Route::put('/projects/{project}/sections/{section}', [ProjectSectionController::class, 'update']);

    Route::post('/projects/{project}/ai-suggest', [AiSuggestController::class, 'suggest'])
        ->middleware('throttle:ai-suggest');
});
