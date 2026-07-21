<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Enums\StoreStatus;
use App\Enums\StoreUserRole;
use App\Enums\UserStatus;
use App\Enums\UserType;
use App\Models\Store;
use App\Models\StoreActivationToken;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class StoreActivationTest extends TestCase
{
    use RefreshDatabase;

    private const RAW_TOKEN = 'a-known-raw-activation-token';

    private const TEMP_PASSWORD = 'TempPass123!';

    public function test_owner_can_activate_with_valid_token_and_temp_password(): void
    {
        $store = $this->createPendingStore();

        $response = $this->postJson('/api/stores/activate', [
            'token' => self::RAW_TOKEN,
            'current_password' => self::TEMP_PASSWORD,
            'new_password' => 'BrandNewPass456!',
            'new_password_confirmation' => 'BrandNewPass456!',
        ]);

        $response->assertOk()
            ->assertJsonPath('store.status', 'active')
            ->assertJsonPath('store.is_activated', true)
            ->assertJsonStructure(['token']);

        $this->assertDatabaseHas('stores', ['id' => $store->id, 'is_activated' => 1]);
        $owner = $store->owners()->firstOrFail();
        $this->assertTrue(Hash::check('BrandNewPass456!', $owner->fresh()->password));
    }

    public function test_activation_fails_with_wrong_temporary_password(): void
    {
        $this->createPendingStore();

        $response = $this->postJson('/api/stores/activate', [
            'token' => self::RAW_TOKEN,
            'current_password' => 'wrong-password',
            'new_password' => 'BrandNewPass456!',
            'new_password_confirmation' => 'BrandNewPass456!',
        ]);

        $response->assertStatus(401);
    }

    public function test_activation_fails_with_invalid_token(): void
    {
        $this->createPendingStore();

        $response = $this->postJson('/api/stores/activate', [
            'token' => 'not-a-real-token',
            'current_password' => self::TEMP_PASSWORD,
            'new_password' => 'BrandNewPass456!',
            'new_password_confirmation' => 'BrandNewPass456!',
        ]);

        $response->assertStatus(404);
    }

    public function test_activation_fails_with_expired_token(): void
    {
        $this->createPendingStore(expiresAt: now()->subDay());

        $response = $this->postJson('/api/stores/activate', [
            'token' => self::RAW_TOKEN,
            'current_password' => self::TEMP_PASSWORD,
            'new_password' => 'BrandNewPass456!',
            'new_password_confirmation' => 'BrandNewPass456!',
        ]);

        $response->assertStatus(410);
    }

    /**
     * Rule #1: an already-activated store visiting the activation page again
     * must be blocked with a clear message, no new credentials issued.
     */
    public function test_activation_fails_for_an_already_activated_store(): void
    {
        $store = $this->createPendingStore(status: StoreStatus::Active, isActivated: true, tokenVerified: true);

        $response = $this->postJson('/api/stores/activate', [
            'token' => self::RAW_TOKEN,
            'current_password' => self::TEMP_PASSWORD,
            'new_password' => 'BrandNewPass456!',
            'new_password_confirmation' => 'BrandNewPass456!',
        ]);

        $response->assertStatus(409);
        $this->assertSame(1, StoreActivationToken::query()->where('store_id', $store->id)->count());
    }

    /**
     * Rule #2: suspended/rejected stores can't be activated even with valid
     * activation credentials still in hand.
     */
    public function test_activation_fails_for_a_suspended_store(): void
    {
        $this->createPendingStore(status: StoreStatus::Suspended);

        $response = $this->postJson('/api/stores/activate', [
            'token' => self::RAW_TOKEN,
            'current_password' => self::TEMP_PASSWORD,
            'new_password' => 'BrandNewPass456!',
            'new_password_confirmation' => 'BrandNewPass456!',
        ]);

        $response->assertStatus(403);
    }

    public function test_activation_fails_for_a_rejected_store(): void
    {
        $this->createPendingStore(status: StoreStatus::Rejected);

        $response = $this->postJson('/api/stores/activate', [
            'token' => self::RAW_TOKEN,
            'current_password' => self::TEMP_PASSWORD,
            'new_password' => 'BrandNewPass456!',
            'new_password_confirmation' => 'BrandNewPass456!',
        ]);

        $response->assertStatus(403);
    }

    private function createPendingStore(
        StoreStatus $status = StoreStatus::Pending,
        bool $isActivated = false,
        bool $tokenVerified = false,
        $expiresAt = null,
    ): Store {
        $owner = User::factory()->create([
            'user_type' => UserType::StoreOwner,
            'status' => UserStatus::Active,
            'password' => self::TEMP_PASSWORD,
        ]);

        $store = Store::factory()->create([
            'status' => $status,
            'is_activated' => $isActivated,
        ]);

        $store->owners()->attach($owner->id, ['role' => StoreUserRole::Owner->value]);

        StoreActivationToken::query()->create([
            'store_id' => $store->id,
            'token_hash' => hash('sha256', self::RAW_TOKEN),
            'expires_at' => $expiresAt ?? now()->addDays(7),
            'verified_at' => $tokenVerified ? now() : null,
        ]);

        return $store;
    }
}
