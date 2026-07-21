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
        // Matches admin-web's ROLE_PERMISSIONS map exactly.
        $map = [
            'admin' => [
                'stores.view',
                'stores.create',
                'stores.edit',
                'stores.verify',
                'users.view',
                'users.manage',
                'catalog.view',
                'catalog.manage',
                'admin.users.manage',
            ],
            'user' => [
                'stores.view',
                'users.view',
                'catalog.view',
            ],
        ];

        foreach ($map as $roleName => $permissionKeys) {
            $role = Role::query()->where('name', $roleName)->firstOrFail();
            $permissionIds = Permission::query()->whereIn('key', $permissionKeys)->pluck('id');

            $role->permissions()->sync($permissionIds);
        }
    }
}
