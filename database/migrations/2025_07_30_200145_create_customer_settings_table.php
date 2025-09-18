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
        Schema::create('customer_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('preferred_time', ['morning', 'afternoon', 'evening', 'special'])->default('morning');
            $table->enum('preferred_stylist', ['male', 'female', 'none'])->default('none');
            $table->boolean('auto_rebooking')->default(false);
            $table->boolean('enable_mobile_appointment')->default(true);
            $table->boolean('email_reminders')->default(true);
            $table->boolean('sms_reminders')->default(false);
            $table->boolean('phone_reminders')->default(false);
            $table->string('language')->default('en');
            $table->string('currency')->default('USD');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_settings');
    }
};
