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
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stylist_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('customer_id')->constrained('users')->onDelete('cascade');
            $table->string('booking_id')->nullable();
            $table->foreignId('portfolio_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 8, 2);
            $table->string('duration')->nullable();
            $table->text('extra')->nullable();
            $table->string('appointment_code')->unique()->nullable();
            $table->string('completion_code')->unique()->nullable();
            $table->enum('status', [
                'processing', 'pending', 'approved', 'rescheduled', 'confirmed', 'completed', 'canceled', 'escalated'
            ])->default('processing');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
