<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropUnique(['store_id', 'slug']);
            $table->dropForeign(['category_id']);
            $table->dropForeign(['unit_id']);
            $table->dropIndex(['category_id']);
            $table->dropIndex(['unit_id']);
            $table->dropColumn(['name', 'slug', 'description', 'image_url', 'category_id', 'unit_id']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('catalog_product_id')->after('store_id')->constrained()->restrictOnDelete();
            $table->unique(['store_id', 'catalog_product_id']);
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropUnique(['store_id', 'catalog_product_id']);
            $table->dropConstrainedForeignId('catalog_product_id');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->string('name', 150)->after('store_id');
            $table->string('slug', 180)->after('name');
            $table->string('description', 2000)->nullable()->after('slug');
            $table->string('image_url', 2048)->nullable()->after('stock_quantity');
            $table->foreignId('category_id')->nullable()->after('store_id')->constrained()->nullOnDelete();
            $table->foreignId('unit_id')->nullable()->after('category_id')->constrained('product_units')->nullOnDelete();
            $table->unique(['store_id', 'slug']);
        });
    }
};
