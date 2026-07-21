<?php

namespace Database\Factories;

use App\Enums\UserStatus;
use App\Enums\UserType;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_type' => UserType::Customer,
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => '+966'.fake()->numerify('5########'),
            'whatsapp' => '+966'.fake()->numerify('5########'),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Admin-type user, opportunistically attached to the seeded "admin" role
     * (full permissions) if roles/permissions have been seeded in the current test.
     * role_id isn't mass-assignable, so this is set via forceFill() after creation.
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'user_type' => UserType::Admin,
        ])->withRole('admin');
    }

    public function suspended(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => UserStatus::Suspended,
        ]);
    }

    /**
     * Attach a specific seeded role by name (e.g. the limited "user" admin role).
     */
    public function withRole(string $name): static
    {
        return $this->afterCreating(function (User $user) use ($name) {
            $roleId = Role::query()->where('name', $name)->value('id');

            if ($roleId !== null) {
                $user->forceFill(['role_id' => $roleId])->save();
            }
        });
    }
}
