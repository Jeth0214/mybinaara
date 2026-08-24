<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('key', 100)->unique();
            $table->string('category', 50);
            $table->string('label', 100);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('permissions');
    }
};
