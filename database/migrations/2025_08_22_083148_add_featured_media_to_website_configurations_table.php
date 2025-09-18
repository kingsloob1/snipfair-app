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
        Schema::table('website_configurations', function (Blueprint $table) {
            $table->json('featured_media')->nullable();
            $table->integer('professional_stylists')->default(0);
            $table->integer('happy_customers')->default(0);
            $table->integer('services_completed')->default(0);
            $table->decimal('customer_satisfaction', 5, 2)->default(0.00);
            //featured_media,professional_stylists,happy_customers,services_completed,customer_satisfaction
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('website_configurations', function (Blueprint $table) {
            //
        });
    }
};
