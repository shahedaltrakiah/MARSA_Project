<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('project_sections')
            ->where('section', 'business-model')
            ->lazyById()
            ->each(function ($row) {
                $old = json_decode($row->content, true) ?? [];
                DB::table('project_sections')
                    ->where('id', $row->id)
                    ->update([
                        'section' => 'reach',
                        'content' => json_encode(['business_model' => $old]),
                    ]);
            });
    }

    public function down(): void
    {
        DB::table('project_sections')
            ->where('section', 'reach')
            ->lazyById()
            ->each(function ($row) {
                $reach = json_decode($row->content, true) ?? [];
                $old = $reach['business_model'] ?? [];
                DB::table('project_sections')
                    ->where('id', $row->id)
                    ->update([
                        'section' => 'business-model',
                        'content' => json_encode($old),
                    ]);
            });
    }
};
