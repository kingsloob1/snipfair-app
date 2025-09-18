<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('appointment_dispute_messages', function (Blueprint $table) {
            $table->enum('conversation_type', ['admin_customer', 'admin_stylist', 'all'])->default('all')->after('id');
        });

        DB::transaction(function () {
            // Strategy 1: Split existing messages based on sender type
            DB::table('appointment_dispute_messages')
            ->where('sender_type', 'LIKE', '%User%')
            ->join('appointment_disputes', 'appointment_dispute_messages.appointment_dispute_id', '=', 'appointment_disputes.id')
            ->whereColumn('appointment_dispute_messages.sender_id', 'appointment_disputes.customer_id')
            ->update(['conversation_type' => 'admin_customer']);
            
            DB::table('appointment_dispute_messages')
            ->where('sender_type', 'LIKE', '%User%')
            ->join('appointment_disputes', 'appointment_dispute_messages.appointment_dispute_id', '=', 'appointment_disputes.id')
            ->whereColumn('appointment_dispute_messages.sender_id', 'appointment_disputes.stylist_id')
            ->update(['conversation_type' => 'admin_stylist']);
            
            // Admin messages: Default to admin_customer (or apply business logic)
            DB::table('appointment_dispute_messages')
            ->where('sender_type', 'LIKE', '%Admin%')
            ->update(['conversation_type' => 'admin_customer']);

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointment_dispute_messages', function (Blueprint $table) {
            $table->dropColumn('conversation_type');
        });
    }
};
