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
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_id')->unique(); // TIC-001 format
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Customer who created the ticket
            $table->string('subject');
            $table->text('description');
            $table->enum('status', ['open', 'in_progress', 'closed', 'pending'])->default('open');
            $table->enum('priority', ['low', 'medium', 'high', 'risky'])->default('medium');
            $table->foreignId('assigned_to')->nullable()->constrained('admins')->onDelete('set null'); // Admin assigned to ticket
            $table->timestamp('resolved_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
