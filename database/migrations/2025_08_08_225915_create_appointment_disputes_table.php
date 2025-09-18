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
        Schema::create('appointment_disputes', function (Blueprint $table) {
            $table->id();
            $table->text('comment')->nullable();
            $table->json('image_urls')->nullable();
            $table->enum('status', ['open', 'in_progress', 'closed', 'resolved'])->default('open');
            $table->enum('priority', ['low', 'medium', 'high', 'risky'])->default('medium');
            $table->enum('from', ['stylist', 'customer'])->default('customer');
            $table->foreignId('appointment_id')->constrained()->onDelete('cascade');
            $table->foreignId('ref_id')->unique();
            $table->foreignId('customer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('stylist_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointment_disputes');
    }
};
