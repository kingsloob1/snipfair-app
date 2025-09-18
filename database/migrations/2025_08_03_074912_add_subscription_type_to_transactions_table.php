<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Modify the enum to include 'subscription'
        DB::statement("ALTER TABLE transactions MODIFY COLUMN type ENUM('payment', 'earning', 'refund', 'withdraw', 'topup', 'subscription', 'other') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to original enum values
        DB::statement("ALTER TABLE transactions MODIFY COLUMN type ENUM('payment', 'earning', 'refund', 'withdraw', 'topup', 'other') NOT NULL");
    }
};
