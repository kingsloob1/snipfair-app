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
        Schema::create('stylist_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->boolean('automatic_payout')->default(false);
            $table->boolean('instant_payout')->default(false);
            $table->enum('payout_frequency', ['daily', 'bi-weekly', 'weekly', 'monthly'])->default('weekly');
            $table->enum('payout_day', ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'])->default('sunday');
            $table->boolean('enable_mobile_appointments')->default(true);
            $table->boolean('enable_shop_appointments')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stylist_settings');
    }
};
