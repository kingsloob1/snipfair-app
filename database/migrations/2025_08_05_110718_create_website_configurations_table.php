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
        Schema::create('website_configurations', function (Blueprint $table) {
            $table->id();
            $table->longText('terms')->nullable();
            $table->longText('privacy_policy')->nullable();
            $table->longText('cookies')->nullable();
            $table->boolean('email_verification')->default(true);
            $table->boolean('two_factor_auth')->default(false);
            $table->decimal('min_booking_amount', 8, 2)->default(5.00);
            $table->decimal('max_booking_amount', 8, 2)->default(100.00);
            $table->boolean('allow_registration_stylists')->default(true);
            $table->boolean('allow_registration_customers')->default(true);
            $table->boolean('maintenance_mode')->default(false);
            $table->text('maintenance_message')->nullable();
            $table->boolean('email_notifications')->default(true);
            $table->boolean('push_notifications')->default(true);
            $table->boolean('system_alerts')->default(true);
            $table->boolean('payment_alerts')->default(true);
            $table->boolean('content_moderation')->default(true);
            $table->integer('appointment_reschedule_threshold')->default(3);
            $table->decimal('appointment_reschedule_percentage', 5, 2)->default(10.00);
            $table->integer('appointment_canceling_threshold')->default(24);
            $table->decimal('appointment_canceling_percentage', 5, 2)->default(50.00);
            $table->foreignId('updated_by')->nullable()->constrained('admins')->onDelete('set null');
            $table->timestamps();
        });
    }
    // Plans::fully only_editable, amount, duration ::payment_methods
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('website_configurations');
    }
};
