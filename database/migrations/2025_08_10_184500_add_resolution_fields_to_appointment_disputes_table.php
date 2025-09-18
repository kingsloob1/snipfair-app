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
        Schema::table('appointment_disputes', function (Blueprint $table) {
            $table->enum('resolution_type', ['refund_customer', 'split_refund', 'complete_for_stylist', 'no_action'])->nullable()->after('priority');
            $table->decimal('resolution_amount', 10, 2)->nullable()->after('resolution_type');
            $table->text('resolution_comment')->nullable()->after('resolution_amount');
            $table->timestamp('resolved_at')->nullable()->after('resolution_comment');
            $table->foreignId('resolved_by')->nullable()->constrained('admins')->after('resolved_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointment_disputes', function (Blueprint $table) {
            $table->dropColumn(['resolution_type', 'resolution_amount', 'resolved_at', 'resolved_by']);
        });
    }
};
