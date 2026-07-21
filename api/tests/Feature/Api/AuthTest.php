<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Enums\StoreStatus;
use App\Enums\StoreUserRole;
use App\Enums\UserType;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create(['password' => Hash::make('correct-password')]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'correct-password',
            'device_name' => 'phpunit',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['token', 'user' => ['id', 'email']])
            ->assertJsonPath('user.id', $user->id);
    }

    public function test_login_fails_with_invalid_password(): void
    {
        $user = User::factory()->create(['password' => Hash::make('correct-password')]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
            'device_name' => 'phpunit',
        ]);

        $response->assertStatus(401);
    }

    public function test_login_fails_for_unknown_email(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'nobody@example.com',
            'password' => 'whatever',
            'device_name' => 'phpunit',
        ]);

        $response->assertStatus(401);
    }

    public function test_suspended_user_cannot_login(): void
    {
        $user = User::factory()->suspended()->create(['password' => Hash::make('correct-password')]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'correct-password',
            'device_name' => 'phpunit',
        ]);

        $response->assertStatus(403);
    }

    public function test_login_requires_email_password_and_device_name(): void
    {
        $response = $this->postJson('/api/login', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password', 'device_name']);
    }

    public function test_authenticated_user_can_logout(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('phpunit')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/logout');

        $response->assertStatus(204);
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_guest_cannot_logout(): void
    {
        $response = $this->postJson('/api/logout');

        $response->assertStatus(401);
    }

    public function test_vendor_with_pending_store_cannot_login(): void
    {
        $owner = $this->createVendorFor(StoreStatus::Pending);

        $response = $this->postJson('/api/login', [
            'email' => $owner->email,
            'password' => 'correct-password',
            'device_name' => 'phpunit',
        ]);

        $response->assertStatus(403)
            ->assertJsonFragment(['message' => 'Your store account is pending activation. Please check your email for the activation link we sent you.']);
    }

    public function test_vendor_with_suspended_store_cannot_login(): void
    {
        $owner = $this->createVendorFor(StoreStatus::Suspended);

        $response = $this->postJson('/api/login', [
            'email' => $owner->email,
            'password' => 'correct-password',
            'device_name' => 'phpunit',
        ]);

        $response->assertStatus(403)
            ->assertJsonFragment(['message' => 'Your store account has been suspended. Please contact support for assistance.']);
    }

    public function test_vendor_with_rejected_store_cannot_login(): void
    {
        $owner = $this->createVendorFor(StoreStatus::Rejected);

        $response = $this->postJson('/api/login', [
            'email' => $owner->email,
            'password' => 'correct-password',
            'device_name' => 'phpunit',
        ]);

        $response->assertStatus(403)
            ->assertJsonFragment(['message' => 'Your store account application was rejected. Please contact support for more information.']);
    }

    public function test_vendor_with_active_store_can_login(): void
    {
        $owner = $this->createVendorFor(StoreStatus::Active);

        $response = $this->postJson('/api/login', [
            'email' => $owner->email,
            'password' => 'correct-password',
            'device_name' => 'phpunit',
        ]);

        $response->assertOk()->assertJsonPath('user.id', $owner->id);
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
