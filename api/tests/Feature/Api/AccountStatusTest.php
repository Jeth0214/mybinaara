<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Enums\StoreStatus;
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

class AccountStatusTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class, PermissionSeeder::class, RolePermissionSeeder::class]);
    }

    public function test_inactive_user_cannot_log_in(): void
    {
        $user = User::factory()->inactive()->create();

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
            'device_name' => 'test',
        ]);

        $response->assertStatus(403)->assertJsonPath('message', 'This account is inactive.');
    }

    public function test_deactivating_a_staff_member_immediately_revokes_their_existing_token(): void
    {
        $administrator = User::factory()->admin()->create();
        $staff = User::factory()->admin()->withRole('staff')->create();
        $staff->permissions()->sync(Permission::query()->where('key', 'staff.view')->pluck('id'));

        $staffToken = $staff->createToken('device')->plainTextToken;
        $adminToken = $administrator->createToken('device')->plainTextToken;

        $this->withToken($staffToken)->getJson('/api/staff')->assertOk();

        // Sanctum's guard caches the resolved user for the lifetime of the test's
        // Auth manager; forgetGuards() forces the next request to re-authenticate
        // from scratch instead of reusing the previous request's cached user.
        $this->app['auth']->forgetGuards();

        $this->withToken($adminToken)
            ->patchJson("/api/staff/{$staff->id}/status", ['status' => 'inactive'])
            ->assertOk();

        $this->app['auth']->forgetGuards();

        // The token itself is gone (not just the account flagged inactive), so
        // reusing it fails authentication entirely rather than a 403.
        $this->withToken($staffToken)->getJson('/api/staff')->assertStatus(401);
    }

    public function test_deactivating_a_vendor_immediately_revokes_their_existing_token(): void
    {
        $vendor = User::factory()->create(['user_type' => UserType::StoreOwner]);
        $store = Store::factory()->create(['status' => StoreStatus::Active]);
        $store->owners()->attach($vendor->id, ['role' => StoreUserRole::Owner->value]);

        $vendorToken = $vendor->createToken('device')->plainTextToken;

        $this->withToken($vendorToken)->getJson('/api/user')->assertOk();

        $vendor->update(['status' => 'inactive']);

        // Force re-authentication from scratch (see note above) so this request
        // doesn't reuse the first request's cached, now-stale user instance.
        $this->app['auth']->forgetGuards();

        // The token itself is gone (not just the account flagged inactive), so
        // reusing it fails authentication entirely rather than a 403.
        $this->withToken($vendorToken)->getJson('/api/user')->assertStatus(401);
    }
}
