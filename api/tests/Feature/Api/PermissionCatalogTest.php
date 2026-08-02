<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PermissionCatalogTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class, PermissionSeeder::class, RolePermissionSeeder::class]);
    }

    public function test_guest_cannot_view_permission_catalog(): void
    {
        $this->getJson('/api/permissions')->assertStatus(401);
    }

    public function test_staff_without_staff_view_permission_cannot_view_permission_catalog(): void
    {
        $staff = User::factory()->admin()->withRole('staff')->create();

        $this->actingAs($staff, 'sanctum')->getJson('/api/permissions')->assertStatus(403);
    }

    public function test_administrator_can_view_permission_catalog_grouped_by_category(): void
    {
        $administrator = User::factory()->admin()->create();

        $response = $this->actingAs($administrator, 'sanctum')->getJson('/api/permissions');

        $response->assertOk();

        $categories = collect($response->json('data'))->pluck('category');
        $this->assertTrue($categories->contains('Store Management'));
        $this->assertTrue($categories->contains('User Management'));

        $storeGroup = collect($response->json('data'))->firstWhere('category', 'Store Management');
        $this->assertTrue(collect($storeGroup['permissions'])->contains('key', 'stores.approve'));
    }
}
