<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('profile_files', function (Blueprint $table) {
            $table->index('profile_id');
        });

        Schema::table('project_collaborators', function (Blueprint $table) {
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('profile_files', function (Blueprint $table) {
            $table->dropIndex(['profile_id']);
        });

        Schema::table('project_collaborators', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
        });
    }
};
