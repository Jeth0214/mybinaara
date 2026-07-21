<?php

declare(strict_types=1);

namespace Tests\Feature;

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

    public function test_admin_role_has_all_nine_permissions(): void
    {
        $admin = Role::query()->where('name', 'admin')->firstOrFail();

        $this->assertCount(9, $admin->permissions);
        $this->assertTrue($admin->permissions->contains('key', 'catalog.manage'));
    }

    public function test_user_role_has_only_the_three_read_only_permissions(): void
    {
        $user = Role::query()->where('name', 'user')->firstOrFail();

        $this->assertEqualsCanonicalizing(
            ['stores.view', 'users.view', 'catalog.view'],
            $user->permissions->pluck('key')->all(),
        );
        $this->assertFalse($user->permissions->contains('key', 'catalog.manage'));
    }

    public function test_user_has_permission_reflects_their_role(): void
    {
        $admin = User::factory()->admin()->create();
        $limited = User::factory()->admin()->withRole('user')->create();
        $roleless = User::factory()->create();

        $this->assertTrue($admin->hasPermission('catalog.manage'));
        $this->assertFalse($limited->hasPermission('catalog.manage'));
        $this->assertTrue($limited->hasPermission('catalog.view'));
        $this->assertFalse($roleless->hasPermission('catalog.view'));
    }
}
