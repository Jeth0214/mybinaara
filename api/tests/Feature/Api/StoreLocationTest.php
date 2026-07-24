<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Enums\StoreUserRole;
use App\Enums\UserType;
use App\Models\City;
use App\Models\District;
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

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'full_address' => '123 King Fahd Road',
            'city' => 'Riyadh',
            'district' => 'Al Olaya',
            'latitude' => 24.7136,
            'longitude' => 46.6753,
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
        $staff = User::factory()->create(['user_type' => UserType::StoreStaff]);
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

    public function test_admin_can_update_location(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create();
        $city = City::factory()->create(['name_en' => 'Riyadh']);
        $district = District::factory()->create(['city_id' => $city->id, 'name_en' => 'Al Olaya']);

        $response = $this->actingAs($admin, 'sanctum')->patchJson(
            "/api/stores/{$store->id}/location",
            $this->payload(['city_id' => $city->id, 'district_id' => $district->id]),
        );

        $response->assertOk()
            ->assertJsonPath('data.location.full_address', '123 King Fahd Road')
            ->assertJsonPath('data.location.city', 'Riyadh')
            ->assertJsonPath('data.location.city_id', $city->id)
            ->assertJsonPath('data.location.district_id', $district->id)
            ->assertJsonPath('data.location.latitude', 24.7136)
            ->assertJsonPath('data.location.longitude', 46.6753);

        $this->assertDatabaseHas('stores', [
            'id' => $store->id,
            'city_id' => $city->id,
            'district_id' => $district->id,
        ]);
    }

    public function test_full_address_is_required(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->patchJson(
            "/api/stores/{$store->id}/location",
            $this->payload(['full_address' => '']),
        );

        $response->assertStatus(422)->assertJsonValidationErrors('full_address');
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

    public function test_city_id_must_exist(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->patchJson(
            "/api/stores/{$store->id}/location",
            $this->payload(['city_id' => 999999]),
        );

        $response->assertStatus(422)->assertJsonValidationErrors('city_id');
    }

    public function test_district_id_must_exist(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->patchJson(
            "/api/stores/{$store->id}/location",
            $this->payload(['district_id' => 999999]),
        );

        $response->assertStatus(422)->assertJsonValidationErrors('district_id');
    }
}
