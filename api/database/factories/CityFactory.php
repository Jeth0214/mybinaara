<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\City;
use App\Models\Region;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<City>
 */
class CityFactory extends Factory
{
    protected $model = City::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => fake()->unique()->numberBetween(1, 999999),
            'region_id' => Region::factory(),
            'name_ar' => fake()->city(),
            'name_en' => fake()->city(),
        ];
    }
}
