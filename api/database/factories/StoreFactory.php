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

    /**
     * Attaches a full 7-day schedule after creation, for tests that assert on `data.schedule`.
     */
    public function withSchedule(): static
    {
        return $this->afterCreating(function (Store $store) {
            foreach (['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'] as $day) {
                $store->schedules()->create([
                    'day' => $day,
                    'open_time' => '08:00 AM',
                    'close_time' => '10:00 PM',
                    'is_off' => false,
                ]);
            }
        });
    }
}
