<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cities', function (Blueprint $table) {
            $table->unsignedInteger('id')->primary();
            $table->unsignedInteger('region_id');
            $table->string('name_ar', 150);
            $table->string('name_en', 150);

            $table->foreign('region_id')->references('id')->on('regions')->cascadeOnDelete();
            $table->index('region_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cities');
    }
};
