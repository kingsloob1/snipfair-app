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
        Schema::create('location_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->integer('location_accuracy')->nullable(); // in meters
            $table->timestamp('location_updated_at')->nullable();
            $table->boolean('location_permission_granted')->default(false);
            $table->boolean('location_consent_given')->default(false);
            $table->timestamp('location_consent_date')->nullable();

            // Add spatial index for better performance on location queries
            // $table->spatialIndex(['latitude', 'longitude']);
             $table->index(['latitude', 'longitude']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('location_services');
    }
};
