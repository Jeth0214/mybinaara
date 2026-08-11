<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stores', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('cr_number', 10)->unique();
            $table->string('vat_number', 15)->unique();
            $table->string('status')->default('pending');
            $table->boolean('is_activated')->default(false);
            $table->timestamp('activated_at')->nullable();
            $table->string('logo_url', 2048)->nullable();
            $table->string('rejection_reason', 500)->nullable();
            $table->string('city', 150)->nullable();
            $table->string('formatted_address', 500)->nullable();
            $table->decimal('latitude', 9, 6)->nullable();
            $table->decimal('longitude', 9, 6)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stores');
    }
};
