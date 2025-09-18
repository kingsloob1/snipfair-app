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
        Schema::create('appointment_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained()->onDelete('cascade');
            $table->foreignId('recipient_id')->constrained('users')->onDelete('cascade');
            $table->enum('recipient_type', ['customer', 'stylist']);
            $table->enum('reminder_type', ['day', 'hour']);
            $table->timestamp('sent_at');
            $table->timestamps();

            // Ensure we don't send duplicate reminders
            $table->unique(['appointment_id', 'recipient_id', 'recipient_type', 'reminder_type'], 'unique_appointment_reminder');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointment_reminders');
    }
};
