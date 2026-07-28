<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $map = [
            'administrator' => Permission::query()->pluck('key')->all(),
            'staff' => [],
            'vendor' => [],
        ];

        foreach ($map as $roleName => $permissionKeys) {
            $role = Role::query()->where('name', $roleName)->firstOrFail();
            $permissionIds = Permission::query()->whereIn('key', $permissionKeys)->pluck('id');

            $role->permissions()->sync($permissionIds);
        }
    }
}
