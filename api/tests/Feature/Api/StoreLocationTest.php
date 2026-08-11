<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Enums\StoreUserRole;
use App\Enums\UserType;
use App\Models\Permission;
use App\Models\Store;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StoreLocationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class, PermissionSeeder::class, RolePermissionSeeder::class]);
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return array_merge([
            'latitude' => 24.7136,
            'longitude' => 46.6753,
            'city' => 'Riyadh',
            'formatted_address' => '123 King Fahd Road, Al Olaya, Riyadh 12214, Saudi Arabia',
        ], $overrides);
    }

    public function test_guest_cannot_update_location(): void
    {
        $store = Store::factory()->create();

        $this->patchJson("/api/stores/{$store->id}/location", $this->payload())->assertStatus(401);
    }

    public function test_store_owner_can_update_location(): void
    {
        $store = Store::factory()->active()->create();
        $owner = User::factory()->create(['user_type' => UserType::StoreOwner]);
        $store->users()->attach($owner->id, ['role' => StoreUserRole::Owner->value]);

        $this->actingAs($owner, 'sanctum')
            ->patchJson("/api/stores/{$store->id}/location", $this->payload())
            ->assertOk();
    }

    public function test_store_staff_can_update_location(): void
    {
        $store = Store::factory()->active()->create();
        $staff = User::factory()->create(['user_type' => UserType::VendorStaff]);
        $store->users()->attach($staff->id, ['role' => StoreUserRole::Staff->value]);

        $this->actingAs($staff, 'sanctum')
            ->patchJson("/api/stores/{$store->id}/location", $this->payload())
            ->assertOk();
    }

    public function test_unrelated_user_cannot_update_location(): void
    {
        $store = Store::factory()->create();
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->patchJson("/api/stores/{$store->id}/location", $this->payload())
            ->assertStatus(403);
    }

    public function test_owner_of_another_store_cannot_update_this_stores_location(): void
    {
        $store = Store::factory()->create();
        $otherStore = Store::factory()->active()->create();
        $otherOwner = User::factory()->create(['user_type' => UserType::StoreOwner]);
        $otherStore->users()->attach($otherOwner->id, ['role' => StoreUserRole::Owner->value]);

        $this->actingAs($otherOwner, 'sanctum')
            ->patchJson("/api/stores/{$store->id}/location", $this->payload())
            ->assertStatus(403);
    }

    public function test_admin_with_stores_edit_can_update_location(): void
    {
        $admin = User::factory()->admin()->withRole('staff')->create();
        $admin->permissions()->sync(Permission::query()->where('key', 'stores.edit')->pluck('id'));
        $store = Store::factory()->create();

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/stores/{$store->id}/location", $this->payload())
            ->assertOk();
    }

    public function test_admin_without_stores_edit_cannot_update_location(): void
    {
        $admin = User::factory()->admin()->withRole('staff')->create();
        $admin->permissions()->sync(Permission::query()->where('key', 'stores.view')->pluck('id'));
        $store = Store::factory()->create();

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/stores/{$store->id}/location", $this->payload())
            ->assertStatus(403);
    }

    public function test_location_is_persisted_and_returned(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->patchJson(
            "/api/stores/{$store->id}/location",
            $this->payload(),
        );

        $response->assertOk()
            ->assertJsonPath('data.location.latitude', 24.7136)
            ->assertJsonPath('data.location.longitude', 46.6753)
            ->assertJsonPath('data.location.city', 'Riyadh')
            ->assertJsonPath('data.location.formatted_address', '123 King Fahd Road, Al Olaya, Riyadh 12214, Saudi Arabia');

        $this->assertDatabaseHas('stores', [
            'id' => $store->id,
            'city' => 'Riyadh',
            'formatted_address' => '123 King Fahd Road, Al Olaya, Riyadh 12214, Saudi Arabia',
        ]);
    }

    public function test_existing_location_can_be_edited(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create([
            'latitude' => 21.4225,
            'longitude' => 39.8262,
            'city' => 'Mecca',
            'formatted_address' => 'Old address',
        ]);

        $response = $this->actingAs($admin, 'sanctum')->patchJson(
            "/api/stores/{$store->id}/location",
            $this->payload(),
        );

        $response->assertOk()
            ->assertJsonPath('data.location.city', 'Riyadh')
            ->assertJsonPath('data.location.formatted_address', '123 King Fahd Road, Al Olaya, Riyadh 12214, Saudi Arabia');
    }

    public function test_location_can_be_cleared_with_nulls(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create([
            'latitude' => 21.4225,
            'longitude' => 39.8262,
            'city' => 'Mecca',
            'formatted_address' => 'Old address',
        ]);

        $response = $this->actingAs($admin, 'sanctum')->patchJson(
            "/api/stores/{$store->id}/location",
            ['latitude' => null, 'longitude' => null, 'city' => null, 'formatted_address' => null],
        );

        $response->assertOk()
            ->assertJsonPath('data.location.latitude', null)
            ->assertJsonPath('data.location.longitude', null)
            ->assertJsonPath('data.location.city', null)
            ->assertJsonPath('data.location.formatted_address', null);

        $this->assertDatabaseHas('stores', [
            'id' => $store->id,
            'latitude' => null,
            'longitude' => null,
            'city' => null,
            'formatted_address' => null,
        ]);
    }

    public function test_empty_payload_is_rejected(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->patchJson("/api/stores/{$store->id}/location", []);

        $response->assertStatus(422)->assertJsonValidationErrors(['latitude', 'longitude', 'city', 'formatted_address']);
    }

    public function test_partial_location_is_rejected(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->patchJson(
            "/api/stores/{$store->id}/location",
            ['latitude' => 24.7136, 'longitude' => 46.6753, 'city' => null, 'formatted_address' => null],
        );

        $response->assertStatus(422)->assertJsonValidationErrors(['city', 'formatted_address']);
    }

    public function test_latitude_out_of_range_is_rejected(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->patchJson(
            "/api/stores/{$store->id}/location",
            $this->payload(['latitude' => 91]),
        );

        $response->assertStatus(422)->assertJsonValidationErrors('latitude');
    }

    public function test_longitude_out_of_range_is_rejected(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->patchJson(
            "/api/stores/{$store->id}/location",
            $this->payload(['longitude' => 181]),
        );

        $response->assertStatus(422)->assertJsonValidationErrors('longitude');
    }

    public function test_non_numeric_coordinates_are_rejected(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->patchJson(
            "/api/stores/{$store->id}/location",
            $this->payload(['latitude' => 'abc']),
        );

        $response->assertStatus(422)->assertJsonValidationErrors('latitude');
    }

    public function test_formatted_address_length_is_capped(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->patchJson(
            "/api/stores/{$store->id}/location",
            $this->payload(['formatted_address' => str_repeat('a', 501)]),
        );

        $response->assertStatus(422)->assertJsonValidationErrors('formatted_address');
    }
}
