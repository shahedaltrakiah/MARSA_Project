<?php

namespace App\Services\Export;

use App\Models\Project;
use App\Support\Export\ExportWatermark;
use App\Support\Export\ProjectExportViewData;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use ZipArchive;

class ProjectExportService
{
    public function exportBusinessPlan(Project $project): Response
    {
        $brandUri = ExportWatermark::brandDataUriForExport();
        $data = ProjectExportViewData::businessPlan($project, $brandUri, $brandUri);

        $pdf = Pdf::loadView('exports.business-plan', $data);
        $pdf->setPaper('a4', 'portrait');
        $pdf->setOption('isHtml5ParserEnabled', true);
        $pdf->setOption('isRemoteEnabled', true);

        return $pdf->download($this->pdfFilename('business-plan', $project->name));
    }

    public function exportCanvas(Project $project): Response
    {
        $brandUri = ExportWatermark::brandDataUriForExport();
        $data = ProjectExportViewData::canvas($project, $brandUri, $brandUri);

        $pdf = Pdf::loadView('exports.canvas', $data);
        $pdf->setPaper('a4', 'landscape');
        $pdf->setOption('isHtml5ParserEnabled', true);
        $pdf->setOption('isRemoteEnabled', true);

        return $pdf->download($this->pdfFilename('canvas', $project->name));
    }

    /**
     * ZIP containing both PDFs (bonus export).
     */
    public function exportAll(Project $project): BinaryFileResponse|Response
    {
        $slug = $this->slug($project->name);
        $planName = $this->pdfFilename('business-plan', $project->name);
        $canvasName = $this->pdfFilename('canvas', $project->name);

        $planBinary = $this->renderBusinessPlanBinary($project);
        $canvasBinary = $this->renderCanvasBinary($project);

        $tmp = tempnam(sys_get_temp_dir(), 'mar_exp_');
        if ($tmp === false) {
            abort(500, 'Could not create export archive.');
        }

        $zip = new ZipArchive;
        if ($zip->open($tmp, ZipArchive::OVERWRITE) !== true) {
            @unlink($tmp);
            abort(500, 'Could not create export archive.');
        }

        $zip->addFromString($planName, $planBinary);
        $zip->addFromString($canvasName, $canvasBinary);
        $zip->close();

        return response()->download($tmp, "project-export-{$slug}.zip")->deleteFileAfterSend(true);
    }

    private function renderBusinessPlanBinary(Project $project): string
    {
        $brandUri = ExportWatermark::brandDataUriForExport();
        $data = ProjectExportViewData::businessPlan($project, $brandUri, $brandUri);
        $pdf = Pdf::loadView('exports.business-plan', $data);
        $pdf->setPaper('a4', 'portrait');
        $pdf->setOption('isHtml5ParserEnabled', true);
        $pdf->setOption('isRemoteEnabled', true);

        return $pdf->output();
    }

    private function renderCanvasBinary(Project $project): string
    {
        $brandUri = ExportWatermark::brandDataUriForExport();
        $data = ProjectExportViewData::canvas($project, $brandUri, $brandUri);
        $pdf = Pdf::loadView('exports.canvas', $data);
        $pdf->setPaper('a4', 'landscape');
        $pdf->setOption('isHtml5ParserEnabled', true);
        $pdf->setOption('isRemoteEnabled', true);

        return $pdf->output();
    }

    private function pdfFilename(string $prefix, string $projectName): string
    {
        return $prefix.'-'.$this->slug($projectName).'.pdf';
    }

    private function slug(string $projectName): string
    {
        $slug = Str::slug($projectName);

        return $slug !== '' ? $slug : 'project';
    }
}
