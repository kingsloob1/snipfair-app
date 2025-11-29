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
            $table->string('disable_booking_message')->default('')->after('customer_satisfaction');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('website_configurations', function (Blueprint $table) {
            $table->dropColumn('disable_booking_message');
        });
    }
};
