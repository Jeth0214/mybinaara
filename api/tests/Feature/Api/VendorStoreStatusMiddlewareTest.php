<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Enums\StoreStatus;
use App\Enums\StoreUserRole;
use App\Enums\UserType;
use App\Models\Store;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class VendorStoreStatusMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class, PermissionSeeder::class, RolePermissionSeeder::class]);
    }

    public function test_vendor_with_active_store_can_access_protected_routes(): void
    {
        $owner = $this->createVendorFor(StoreStatus::Active);

        $this->actingAs($owner, 'sanctum')->getJson('/api/stores/me')->assertOk();
    }

    public function test_vendor_with_suspended_store_is_blocked_and_logged_out(): void
    {
        $owner = $this->createVendorFor(StoreStatus::Suspended);
        $token = $owner->createToken('phpunit')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")->getJson('/api/stores/me');

        $response->assertStatus(403)
            ->assertJsonFragment([
                'message' => 'Your store account has been suspended. Please contact support for assistance.',
                'code' => 'store_inactive',
            ]);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_vendor_with_rejected_store_is_blocked_and_logged_out(): void
    {
        $owner = $this->createVendorFor(StoreStatus::Rejected);
        $token = $owner->createToken('phpunit')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")->getJson('/api/stores/me');

        $response->assertStatus(403)
            ->assertJsonFragment([
                'message' => 'Your store account application was rejected. Please contact support for more information.',
                'code' => 'store_inactive',
            ]);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_vendor_with_pending_store_is_blocked_and_logged_out(): void
    {
        $owner = $this->createVendorFor(StoreStatus::Pending);
        $token = $owner->createToken('phpunit')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")->getJson('/api/stores/me');

        $response->assertStatus(403)
            ->assertJsonFragment([
                'message' => 'Your store account is pending activation. Please check your email for the activation link we sent you.',
                'code' => 'store_inactive',
            ]);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_revoked_token_cannot_be_reused(): void
    {
        $owner = $this->createVendorFor(StoreStatus::Suspended);
        $token = $owner->createToken('phpunit')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")->getJson('/api/stores/me')->assertStatus(403);

        // Laravel's test client reuses the same container across calls in one test, so the
        // sanctum guard's resolved-user cache must be cleared to force a fresh DB lookup —
        // otherwise it'd keep returning the already-resolved (now token-less) user instance.
        $this->app['auth']->forgetGuards();

        $this->withHeader('Authorization', "Bearer {$token}")->getJson('/api/stores/me')->assertStatus(401);
    }

    public function test_admin_is_unaffected_by_the_middleware(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin, 'sanctum')->getJson('/api/stores')->assertOk();
    }

    public function test_customer_is_unaffected_by_the_middleware(): void
    {
        $customer = User::factory()->create(['user_type' => UserType::Customer]);

        $this->actingAs($customer, 'sanctum')->getJson('/api/user')->assertOk();
    }

    private function createVendorFor(StoreStatus $storeStatus): User
    {
        $owner = User::factory()->create([
            'user_type' => UserType::StoreOwner,
            'password' => Hash::make('correct-password'),
        ]);

        $store = Store::factory()->create(['status' => $storeStatus]);
        $store->owners()->attach($owner->id, ['role' => StoreUserRole::Owner->value]);

        return $owner;
    }
}
