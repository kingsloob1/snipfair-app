<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('admin_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('admins', 'id')->onDelete('cascade');
            $table->string('type')->nullable();
            $table->enum('priority', ['normal', 'low', 'moderate', 'critical'])->default('normal');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('action')->nullable();
            $table->boolean('is_seen')->default(false);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_notifications');
    }
};
