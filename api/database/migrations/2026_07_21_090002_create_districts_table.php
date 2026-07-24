<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('districts', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary();
            $table->unsignedInteger('city_id');
            $table->unsignedInteger('region_id');
            $table->string('name_ar', 150);
            $table->string('name_en', 150);

            $table->foreign('city_id')->references('id')->on('cities')->cascadeOnDelete();
            $table->foreign('region_id')->references('id')->on('regions')->cascadeOnDelete();
            $table->index('city_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('districts');
    }
};
