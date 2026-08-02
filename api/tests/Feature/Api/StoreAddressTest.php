<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Enums\StoreUserRole;
use App\Enums\UserType;
use App\Models\City;
use App\Models\District;
use App\Models\Permission;
use App\Models\Store;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StoreAddressTest extends TestCase
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
            'full_address' => '123 King Fahd Road',
        ], $overrides);
    }

    public function test_guest_cannot_update_address(): void
    {
        $store = Store::factory()->create();

        $this->patchJson("/api/stores/{$store->id}/address", $this->payload())->assertStatus(401);
    }

    public function test_store_owner_can_update_their_own_store_address(): void
    {
        $store = Store::factory()->active()->create();
        $owner = User::factory()->create(['user_type' => UserType::StoreOwner]);
        $store->users()->attach($owner->id, ['role' => StoreUserRole::Owner->value]);

        $this->actingAs($owner, 'sanctum')
            ->patchJson("/api/stores/{$store->id}/address", $this->payload())
            ->assertOk()
            ->assertJsonPath('data.location.full_address', '123 King Fahd Road');
    }

    public function test_store_staff_can_update_their_stores_address(): void
    {
        $store = Store::factory()->active()->create();
        $staff = User::factory()->create(['user_type' => UserType::VendorStaff]);
        $store->users()->attach($staff->id, ['role' => StoreUserRole::Staff->value]);

        $this->actingAs($staff, 'sanctum')
            ->patchJson("/api/stores/{$store->id}/address", $this->payload())
            ->assertOk();
    }

    public function test_store_owner_cannot_update_another_stores_address(): void
    {
        $store = Store::factory()->create();
        $otherStore = Store::factory()->active()->create();
        $otherOwner = User::factory()->create(['user_type' => UserType::StoreOwner]);
        $otherStore->users()->attach($otherOwner->id, ['role' => StoreUserRole::Owner->value]);

        $this->actingAs($otherOwner, 'sanctum')
            ->patchJson("/api/stores/{$store->id}/address", $this->payload())
            ->assertStatus(403);
    }

    public function test_unrelated_user_cannot_update_address(): void
    {
        $store = Store::factory()->create();
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->patchJson("/api/stores/{$store->id}/address", $this->payload())
            ->assertStatus(403);
    }

    public function test_admin_with_stores_edit_can_update_address(): void
    {
        $admin = User::factory()->admin()->withRole('staff')->create();
        $admin->permissions()->sync(Permission::query()->where('key', 'stores.edit')->pluck('id'));
        $store = Store::factory()->create();

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/stores/{$store->id}/address", $this->payload())
            ->assertOk();
    }

    public function test_admin_without_stores_edit_cannot_update_address(): void
    {
        $admin = User::factory()->admin()->withRole('staff')->create();
        $admin->permissions()->sync(Permission::query()->where('key', 'stores.view')->pluck('id'));
        $store = Store::factory()->create();

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/stores/{$store->id}/address", $this->payload())
            ->assertStatus(403);
    }

    public function test_full_address_is_optional_on_address_update(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create();

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/stores/{$store->id}/address", [])
            ->assertOk();
    }

    public function test_city_and_district_are_stored_from_ids(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create();
        $city = City::factory()->create(['name_en' => 'Riyadh']);
        $district = District::factory()->create(['city_id' => $city->id, 'name_en' => 'Al Olaya']);

        $response = $this->actingAs($admin, 'sanctum')->patchJson(
            "/api/stores/{$store->id}/address",
            $this->payload(['city_id' => $city->id, 'district_id' => $district->id]),
        );

        $response->assertOk()
            ->assertJsonPath('data.location.city', 'Riyadh')
            ->assertJsonPath('data.location.city_id', $city->id)
            ->assertJsonPath('data.location.district', 'Al Olaya')
            ->assertJsonPath('data.location.district_id', $district->id);
    }

    public function test_mismatched_city_and_district_are_rejected(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create();
        $city = City::factory()->create();
        $otherCity = City::factory()->create();
        $district = District::factory()->create(['city_id' => $otherCity->id]);

        $response = $this->actingAs($admin, 'sanctum')->patchJson(
            "/api/stores/{$store->id}/address",
            $this->payload(['city_id' => $city->id, 'district_id' => $district->id]),
        );

        $response->assertStatus(422)->assertJsonValidationErrors(['district_id']);
    }

    /**
     * Pin location (latitude/longitude/plus_code) is not accepted on this
     * endpoint — that stays vendor-only via the dedicated /location endpoint.
     */
    public function test_address_endpoint_ignores_pin_location_fields(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->patchJson(
            "/api/stores/{$store->id}/address",
            $this->payload(['latitude' => 24.7136, 'longitude' => 46.6753, 'plus_code' => '7G35+XJ']),
        );

        $response->assertOk()
            ->assertJsonPath('data.location.latitude', null)
            ->assertJsonPath('data.location.longitude', null)
            ->assertJsonPath('data.location.plus_code', null);
    }
}
