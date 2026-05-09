<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->json('idea_profile')->nullable()->after('description');
            $table->timestamp('idea_profile_completed_at')->nullable()->after('idea_profile');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['idea_profile', 'idea_profile_completed_at']);
        });
    }
};
