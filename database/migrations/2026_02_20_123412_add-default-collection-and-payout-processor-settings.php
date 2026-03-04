<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('website_configurations', function (Blueprint $table) {
            $table->string('default_collection_processor')->default('payfast')->after('disable_booking_message');
            $table->string('default_payout_processor')->default('peachpayment')->after('default_collection_processor');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('website_configurations', function (Blueprint $table) {
            $table->dropColumn('default_collection_processor');
            $table->dropColumn('default_payout_processor');
        });
    }
};
