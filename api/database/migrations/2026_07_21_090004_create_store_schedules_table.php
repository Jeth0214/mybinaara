<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('store_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained()->cascadeOnDelete();
            $table->string('day', 3);
            $table->string('open_time', 8)->nullable();
            $table->string('close_time', 8)->nullable();
            $table->boolean('is_off')->default(false);
            $table->timestamps();

            $table->unique(['store_id', 'day']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('store_schedules');
    }
};
