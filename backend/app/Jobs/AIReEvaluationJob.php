<?php
namespace App\Jobs;

use App\Models\StartupProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class AIReEvaluationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly StartupProfile $profile) {}

    public function handle(): void
    {
        // Stub — AI integration implemented in Plan 4
    }
}
