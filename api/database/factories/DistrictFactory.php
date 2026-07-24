<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\City;
use App\Models\District;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<District>
 */
class DistrictFactory extends Factory
{
    protected $model = District::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $city = City::factory()->create();

        return [
            'id' => fake()->unique()->numberBetween(1, 999999),
            'city_id' => $city->id,
            'region_id' => $city->region_id,
            'name_ar' => fake()->streetName(),
            'name_en' => fake()->streetName(),
        ];
    }
}
