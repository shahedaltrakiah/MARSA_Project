<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::statement("ALTER TABLE project_collaborators MODIFY COLUMN role ENUM('editor', 'viewer') NOT NULL DEFAULT 'viewer'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE project_collaborators MODIFY COLUMN role ENUM('owner', 'editor', 'viewer') NOT NULL DEFAULT 'viewer'");
    }
};
