<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->string('full_address', 500)->nullable()->after('rejection_reason');
            $table->string('building_number', 20)->nullable();
            $table->string('street_name', 255)->nullable();
            $table->string('district', 150)->nullable();
            $table->unsignedBigInteger('district_id')->nullable();
            $table->string('city', 150)->nullable();
            $table->unsignedInteger('city_id')->nullable();
            $table->string('postal_code', 10)->nullable();
            $table->string('additional_number', 10)->nullable();
            $table->string('country', 100)->nullable()->default('Saudi Arabia');
            $table->decimal('latitude', 9, 6)->nullable();
            $table->decimal('longitude', 9, 6)->nullable();
            $table->string('plus_code', 20)->nullable();

            $table->foreign('city_id')->references('id')->on('cities')->nullOnDelete();
            $table->foreign('district_id')->references('id')->on('districts')->nullOnDelete();
            $table->index(['city_id', 'district_id']);
        });
    }

    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropForeign(['district_id']);
            $table->dropForeign(['city_id']);
            $table->dropColumn([
                'full_address',
                'building_number',
                'street_name',
                'district',
                'district_id',
                'city',
                'city_id',
                'postal_code',
                'additional_number',
                'country',
                'latitude',
                'longitude',
                'plus_code',
            ]);
        });
    }
};
