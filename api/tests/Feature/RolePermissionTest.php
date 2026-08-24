<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RolePermissionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class, PermissionSeeder::class, RolePermissionSeeder::class]);
    }

    public function test_administrator_role_has_every_permission(): void
    {
        $administrator = Role::query()->where('name', 'administrator')->firstOrFail();

        $this->assertCount(Permission::query()->count(), $administrator->permissions);
        $this->assertTrue($administrator->permissions->contains('key', 'catalog.manage'));
    }

    public function test_staff_and_vendor_roles_have_no_default_permissions(): void
    {
        $staff = Role::query()->where('name', 'staff')->firstOrFail();
        $vendor = Role::query()->where('name', 'vendor')->firstOrFail();

        $this->assertCount(0, $staff->permissions);
        $this->assertCount(0, $vendor->permissions);
    }

    public function test_administrator_user_has_every_permission_regardless_of_assignment(): void
    {
        $administrator = User::factory()->admin()->create();

        $this->assertTrue($administrator->hasPermission('catalog.manage'));
        $this->assertTrue($administrator->hasPermission('staff.delete'));
    }

    public function test_staff_user_has_permission_reflects_their_direct_assignment(): void
    {
        $staff = User::factory()->admin()->withRole('staff')->create();
        $staff->permissions()->sync(Permission::query()->whereIn('key', ['catalog.view'])->pluck('id'));

        $roleless = User::factory()->create();

        $this->assertTrue($staff->hasPermission('catalog.view'));
        $this->assertFalse($staff->hasPermission('catalog.manage'));
        $this->assertFalse($roleless->hasPermission('catalog.view'));
    }
}
