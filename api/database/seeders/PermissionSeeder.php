<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $keys = [
            'stores.view',
            'stores.create',
            'stores.edit',
            'stores.verify',
            'users.view',
            'users.manage',
            'catalog.view',
            'catalog.manage',
            'admin.users.manage',
        ];

        foreach ($keys as $key) {
            Permission::query()->firstOrCreate(['key' => $key]);
        }
    }
}
