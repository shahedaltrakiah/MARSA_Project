<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('startup_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete()->unique();
            $table->text('idea')->nullable();
            $table->text('problem')->nullable();
            $table->text('solution')->nullable();
            $table->text('customer')->nullable();
            $table->enum('stage', ['idea', 'validation', 'mvp', 'early_traction', 'scaling'])->nullable();
            $table->text('team')->nullable();
            $table->text('traction')->nullable();
            $table->text('challenges')->nullable();
            $table->text('goals')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('startup_profiles');
    }
};
