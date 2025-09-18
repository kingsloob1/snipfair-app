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
        Schema::create('portfolios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->string('category_id')->constrained()->onDelete('cascade');
            $table->decimal('price', 10, 2);
            $table->string('duration');
            $table->text('description');
            $table->string('tags')->nullable();
            $table->json('media_urls')->nullable();
            $table->integer('visits_count')->default(0);
            $table->boolean('status')->default(true);
            $table->boolean('is_available')->default(true);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('portfolios');
    }
};
