<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            ['key' => 'dashboard.view', 'category' => 'Dashboard', 'label' => 'View Dashboard'],

            ['key' => 'stores.view', 'category' => 'Store Management', 'label' => 'View Stores'],
            ['key' => 'stores.create', 'category' => 'Store Management', 'label' => 'Create Store'],
            ['key' => 'stores.edit', 'category' => 'Store Management', 'label' => 'Edit Store'],
            ['key' => 'stores.verify', 'category' => 'Store Management', 'label' => 'Verify Store'],
            ['key' => 'stores.approve', 'category' => 'Store Management', 'label' => 'Approve Store'],
            ['key' => 'stores.reject', 'category' => 'Store Management', 'label' => 'Reject Store'],
            ['key' => 'stores.suspend', 'category' => 'Store Management', 'label' => 'Suspend Store'],
            ['key' => 'stores.delete', 'category' => 'Store Management', 'label' => 'Delete Store'],

            ['key' => 'vendors.view', 'category' => 'Vendor Management', 'label' => 'View Vendors'],
            ['key' => 'vendors.edit', 'category' => 'Vendor Management', 'label' => 'Edit Vendors'],

            ['key' => 'products.view', 'category' => 'Product Management', 'label' => 'View Products'],
            ['key' => 'products.create', 'category' => 'Product Management', 'label' => 'Create Products'],
            ['key' => 'products.edit', 'category' => 'Product Management', 'label' => 'Edit Products'],
            ['key' => 'products.hide', 'category' => 'Product Management', 'label' => 'Hide Products'],
            ['key' => 'products.suspend', 'category' => 'Product Management', 'label' => 'Suspend Products'],
            ['key' => 'products.delete', 'category' => 'Product Management', 'label' => 'Delete Products'],

            ['key' => 'catalog.view', 'category' => 'Category Management', 'label' => 'View Categories'],
            ['key' => 'catalog.manage', 'category' => 'Category Management', 'label' => 'Manage Categories'],
            ['key' => 'categories.create', 'category' => 'Category Management', 'label' => 'Create Category'],
            ['key' => 'categories.edit', 'category' => 'Category Management', 'label' => 'Edit Category'],
            ['key' => 'categories.delete', 'category' => 'Category Management', 'label' => 'Delete Category'],

            ['key' => 'product_units.view', 'category' => 'Product Unit Management', 'label' => 'View Product Units'],
            ['key' => 'product_units.create', 'category' => 'Product Unit Management', 'label' => 'Create Product Unit'],
            ['key' => 'product_units.edit', 'category' => 'Product Unit Management', 'label' => 'Edit Product Unit'],
            ['key' => 'product_units.delete', 'category' => 'Product Unit Management', 'label' => 'Delete Product Unit'],

            ['key' => 'reports.view', 'category' => 'Reports', 'label' => 'View Reports'],
            ['key' => 'reports.export', 'category' => 'Reports', 'label' => 'Export Reports'],

            ['key' => 'users.view', 'category' => 'User Management', 'label' => 'View Users'],
            ['key' => 'users.manage', 'category' => 'User Management', 'label' => 'Manage Users'],
            ['key' => 'staff.view', 'category' => 'User Management', 'label' => 'View Staff'],
            ['key' => 'staff.create', 'category' => 'User Management', 'label' => 'Create Staff'],
            ['key' => 'staff.edit', 'category' => 'User Management', 'label' => 'Edit Staff'],
            ['key' => 'staff.delete', 'category' => 'User Management', 'label' => 'Delete Staff'],

            ['key' => 'settings.manage', 'category' => 'Settings', 'label' => 'Manage Settings'],

            ['key' => 'audit_logs.view', 'category' => 'Audit Logs', 'label' => 'View Activity Logs'],
        ];

        foreach ($permissions as $permission) {
            Permission::query()->updateOrCreate(['key' => $permission['key']], [
                'category' => $permission['category'],
                'label' => $permission['label'],
            ]);
        }
    }
}
