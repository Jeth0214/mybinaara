<?php

namespace Database\Seeders;

use App\Enums\UserType;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            PermissionSeeder::class,
            RegionSeeder::class,
            CategorySeeder::class,
        ]);

        // User::factory(10)->create();

        User::factory()->create([
            'user_type' => UserType::Admin,
            'name' => 'Roland Jethro Suyom',
            'email' => 'rjSuyom@myBinaara.com',
            'phone' => '0530095815',
            'password' => bcrypt('myBinaara@2026'),
        ]);
    }
}
