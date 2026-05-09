<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Services\Export\ProjectExportService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ProjectExportController extends Controller
{
    public function __construct(
        private readonly ProjectExportService $exportService
    ) {}

    public function businessPlan(Request $request, Project $project): Response
    {
        $project->loadMissing('collaborators');
        $this->authorize('view', $project);

        return $this->exportService->exportBusinessPlan($project);
    }

    public function canvas(Request $request, Project $project): Response
    {
        $project->loadMissing('collaborators');
        $this->authorize('view', $project);

        return $this->exportService->exportCanvas($project);
    }

    public function all(Request $request, Project $project): BinaryFileResponse|Response
    {
        $project->loadMissing('collaborators');
        $this->authorize('view', $project);

        return $this->exportService->exportAll($project);
    }
}
