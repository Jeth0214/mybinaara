<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\ProductStatus;
use App\Models\CatalogProduct;
use App\Models\Product;
use App\Models\Store;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'store_id' => Store::factory(),
            'catalog_product_id' => CatalogProduct::factory(),
            'sku' => fake()->unique()->bothify('SKU-#####'),
            'price' => fake()->randomFloat(2, 5, 500),
            'compare_at_price' => null,
            'stock_quantity' => fake()->numberBetween(0, 100),
            'status' => ProductStatus::Active,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => ['status' => ProductStatus::Inactive]);
    }

    public function suspended(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ProductStatus::Suspended,
            'suspension_reason' => 'Policy violation reported by customers.',
        ]);
    }
}
