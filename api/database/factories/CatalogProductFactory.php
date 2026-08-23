<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\CatalogProduct;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<CatalogProduct>
 */
class CatalogProductFactory extends Factory
{
    protected $model = CatalogProduct::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);

        return [
            'category_id' => null,
            'unit_id' => null,
            'name' => ucfirst($name),
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1, 999999),
            'description' => fake()->sentence(),
            'image_url' => null,
        ];
    }
}
