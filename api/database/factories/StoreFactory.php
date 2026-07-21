<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\StoreStatus;
use App\Models\Store;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Store>
 */
class StoreFactory extends Factory
{
    protected $model = Store::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'cr_number' => fake()->unique()->numerify('##########'),
            'vat_number' => fake()->unique()->numerify('###############'),
            'status' => StoreStatus::Pending,
            'is_activated' => false,
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => StoreStatus::Active,
            'is_activated' => true,
        ]);
    }

    public function suspended(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => StoreStatus::Suspended,
            'is_activated' => true,
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => StoreStatus::Rejected,
            'is_activated' => false,
        ]);
    }
}
