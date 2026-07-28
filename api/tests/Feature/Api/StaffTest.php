<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Models\Permission;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StaffTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class, PermissionSeeder::class, RolePermissionSeeder::class]);
    }

    private function staffWithPermissions(array $keys): User
    {
        $staff = User::factory()->admin()->withRole('staff')->create();
        $staff->permissions()->sync(Permission::query()->whereIn('key', $keys)->pluck('id'));

        return $staff;
    }

    public function test_guest_cannot_list_staff(): void
    {
        $this->getJson('/api/staff')->assertStatus(401);
    }

    public function test_staff_without_staff_view_cannot_list_staff(): void
    {
        $staff = $this->staffWithPermissions([]);

        $this->actingAs($staff, 'sanctum')->getJson('/api/staff')->assertStatus(403);
    }

    public function test_administrator_can_list_staff_and_excludes_vendors(): void
    {
        $administrator = User::factory()->admin()->create();
        $otherStaff = $this->staffWithPermissions(['staff.view']);
        $vendor = User::factory()->admin()->withRole('vendor')->create();

        $response = $this->actingAs($administrator, 'sanctum')->getJson('/api/staff');

        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id')->all();

        $this->assertContains($administrator->id, $ids);
        $this->assertContains($otherStaff->id, $ids);
        $this->assertNotContains($vendor->id, $ids);
    }

    public function test_administrator_can_create_staff_with_specific_permissions(): void
    {
        $administrator = User::factory()->admin()->create();

        $response = $this->actingAs($administrator, 'sanctum')->postJson('/api/staff', [
            'name' => 'John Doe',
            'email' => 'john@mybinaara.com',
            'phone' => '0530000000',
            'permissions' => ['stores.view', 'stores.create'],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.role', 'staff')
            ->assertJsonPath('data.email', 'john@mybinaara.com');

        $this->assertEqualsCanonicalizing(['stores.view', 'stores.create'], $response->json('data.permissions'));
        $this->assertDatabaseHas('users', ['email' => 'john@mybinaara.com']);
    }

    public function test_staff_with_staff_create_can_create_another_staff_member(): void
    {
        $staff = $this->staffWithPermissions(['staff.create']);

        $response = $this->actingAs($staff, 'sanctum')->postJson('/api/staff', [
            'name' => 'Jane Doe',
            'email' => 'jane@mybinaara.com',
            'phone' => '0530000001',
            'permissions' => ['catalog.view'],
        ]);

        $response->assertStatus(201);
    }

    public function test_staff_without_staff_create_cannot_create_staff(): void
    {
        $staff = $this->staffWithPermissions(['staff.view']);

        $response = $this->actingAs($staff, 'sanctum')->postJson('/api/staff', [
            'name' => 'Jane Doe',
            'email' => 'jane@mybinaara.com',
            'phone' => '0530000001',
        ]);

        $response->assertStatus(403);
    }

    public function test_updating_staff_permissions_replaces_the_previous_set(): void
    {
        $administrator = User::factory()->admin()->create();
        $staff = $this->staffWithPermissions(['stores.view']);

        $response = $this->actingAs($administrator, 'sanctum')
            ->patchJson("/api/staff/{$staff->id}", ['permissions' => ['catalog.view']]);

        $response->assertOk();
        $this->assertEqualsCanonicalizing(['catalog.view'], $response->json('data.permissions'));
    }

    public function test_administrator_resource_always_reflects_full_permission_list(): void
    {
        $administrator = User::factory()->admin()->create();

        $response = $this->actingAs($administrator, 'sanctum')->getJson("/api/staff/{$administrator->id}");

        $response->assertOk();
        $this->assertEqualsCanonicalizing(
            Permission::query()->pluck('key')->all(),
            $response->json('data.permissions'),
        );
    }

    public function test_administrator_can_deactivate_and_activate_staff(): void
    {
        $administrator = User::factory()->admin()->create();
        $staff = $this->staffWithPermissions([]);

        $response = $this->actingAs($administrator, 'sanctum')
            ->patchJson("/api/staff/{$staff->id}/status", ['status' => 'inactive']);

        $response->assertOk()->assertJsonPath('data.status', 'inactive');
    }

    public function test_administrator_can_delete_staff(): void
    {
        $administrator = User::factory()->admin()->create();
        $staff = $this->staffWithPermissions([]);

        $response = $this->actingAs($administrator, 'sanctum')->deleteJson("/api/staff/{$staff->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('users', ['id' => $staff->id]);
    }

    public function test_staff_without_staff_delete_cannot_delete_staff(): void
    {
        $staff = $this->staffWithPermissions(['staff.view']);
        $other = $this->staffWithPermissions([]);

        $response = $this->actingAs($staff, 'sanctum')->deleteJson("/api/staff/{$other->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('users', ['id' => $other->id]);
    }

    public function test_administrator_can_create_another_administrator_with_permissions_ignored(): void
    {
        $administrator = User::factory()->admin()->create();

        $response = $this->actingAs($administrator, 'sanctum')->postJson('/api/staff', [
            'name' => 'Second Admin',
            'email' => 'second-admin@mybinaara.com',
            'phone' => '0530000003',
            'role' => 'administrator',
            'permissions' => ['catalog.view'],
        ]);

        $response->assertStatus(201)->assertJsonPath('data.role', 'administrator');

        $this->assertEqualsCanonicalizing(
            Permission::query()->pluck('key')->all(),
            $response->json('data.permissions'),
        );

        $newAdmin = User::query()->where('email', 'second-admin@mybinaara.com')->firstOrFail();
        $this->assertCount(0, $newAdmin->permissions);
    }

    public function test_staff_with_staff_create_cannot_create_an_administrator(): void
    {
        $staff = $this->staffWithPermissions(['staff.create']);

        $response = $this->actingAs($staff, 'sanctum')->postJson('/api/staff', [
            'name' => 'Second Admin',
            'email' => 'second-admin@mybinaara.com',
            'phone' => '0530000003',
            'role' => 'administrator',
        ]);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('users', ['email' => 'second-admin@mybinaara.com']);
    }

    public function test_administrator_can_promote_staff_to_administrator_and_demote_back(): void
    {
        $administrator = User::factory()->admin()->create();
        $staff = $this->staffWithPermissions(['stores.view']);

        $promote = $this->actingAs($administrator, 'sanctum')
            ->patchJson("/api/staff/{$staff->id}", ['role' => 'administrator']);

        $promote->assertOk()->assertJsonPath('data.role', 'administrator');
        $this->assertCount(0, $staff->fresh()->permissions);

        $demote = $this->actingAs($administrator, 'sanctum')
            ->patchJson("/api/staff/{$staff->id}", ['role' => 'staff', 'permissions' => ['catalog.view']]);

        $demote->assertOk()->assertJsonPath('data.role', 'staff');
        $this->assertEqualsCanonicalizing(['catalog.view'], $demote->json('data.permissions'));
    }

    public function test_staff_cannot_promote_anyone_to_administrator_via_update(): void
    {
        $staff = $this->staffWithPermissions(['staff.edit']);
        $other = $this->staffWithPermissions([]);

        $response = $this->actingAs($staff, 'sanctum')
            ->patchJson("/api/staff/{$other->id}", ['role' => 'administrator']);

        $response->assertStatus(403);
        $this->assertNotEquals('administrator', $other->fresh()->role?->name);
    }
}
