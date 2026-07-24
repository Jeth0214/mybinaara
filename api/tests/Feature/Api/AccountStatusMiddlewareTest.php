<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Enums\UserType;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccountStatusMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class, PermissionSeeder::class, RolePermissionSeeder::class]);
    }

    public function test_active_admin_can_access_protected_routes(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin, 'sanctum')->getJson('/api/stores')->assertOk();
    }

    public function test_suspended_admin_is_blocked_and_logged_out(): void
    {
        $admin = User::factory()->admin()->suspended()->create();
        $token = $admin->createToken('phpunit')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")->getJson('/api/stores');

        $response->assertStatus(403)
            ->assertJsonFragment(['message' => 'This account has been suspended.']);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_suspended_customer_is_blocked_and_logged_out(): void
    {
        $customer = User::factory()->suspended()->create(['user_type' => UserType::Customer]);
        $token = $customer->createToken('phpunit')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")->getJson('/api/user');

        $response->assertStatus(403)
            ->assertJsonFragment(['message' => 'This account has been suspended.']);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_active_customer_can_access_protected_routes(): void
    {
        $customer = User::factory()->create(['user_type' => UserType::Customer]);

        $this->actingAs($customer, 'sanctum')->getJson('/api/user')->assertOk();
    }

    public function test_revoked_token_cannot_be_reused(): void
    {
        $admin = User::factory()->admin()->suspended()->create();
        $token = $admin->createToken('phpunit')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")->getJson('/api/stores')->assertStatus(403);

        // Same testing-only caveat as VendorStoreStatusMiddlewareTest: force a fresh
        // guard resolution so the second call re-queries the (now token-less) user.
        $this->app['auth']->forgetGuards();

        $this->withHeader('Authorization', "Bearer {$token}")->getJson('/api/stores')->assertStatus(401);
    }
}
