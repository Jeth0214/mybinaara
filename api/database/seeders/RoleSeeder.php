<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['admin', 'user'] as $name) {
            Role::query()->firstOrCreate(['name' => $name]);
        }
    }
}
