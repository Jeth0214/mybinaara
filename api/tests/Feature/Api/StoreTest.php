<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Mail\StoreActivationMail;
use App\Models\Store;
use App\Models\StoreActivationToken;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class StoreTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class, PermissionSeeder::class, RolePermissionSeeder::class]);
    }

    public function test_guest_cannot_list_stores(): void
    {
        $this->getJson('/api/stores')->assertStatus(401);
    }

    public function test_non_admin_cannot_list_stores(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')->getJson('/api/stores')->assertStatus(403);
    }

    public function test_admin_can_list_stores(): void
    {
        $admin = User::factory()->admin()->create();
        Store::factory()->count(3)->create();

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/stores');

        $response->assertOk()->assertJsonCount(3, 'data');
    }

    public function test_admin_can_view_a_single_store(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->getJson("/api/stores/{$store->id}");

        $response->assertOk()->assertJsonPath('data.id', $store->id);
    }

    public function test_viewing_a_missing_store_returns_404(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin, 'sanctum')->getJson('/api/stores/999999')->assertStatus(404);
    }

    public function test_guest_cannot_create_store(): void
    {
        $this->postJson('/api/stores', $this->validStorePayload())->assertStatus(401);
    }

    public function test_non_admin_cannot_create_store(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/stores', $this->validStorePayload())
            ->assertStatus(403);
    }

    public function test_admin_can_create_store(): void
    {
        Mail::fake();
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/stores', $this->validStorePayload());

        $response->assertStatus(201)->assertJsonPath('data.status', 'pending');
        $this->assertDatabaseHas('stores', ['cr_number' => '1010101010']);
        $this->assertDatabaseHas('users', ['email' => 'owner@example.com', 'user_type' => 'store_owner']);
        $store = Store::query()->where('cr_number', '1010101010')->firstOrFail();
        $this->assertSame(1, $store->owners()->count());
        $this->assertCount(1, StoreActivationToken::query()->where('store_id', $store->id)->get());
        Mail::assertQueued(StoreActivationMail::class, fn ($mail) => $mail->hasTo('owner@example.com'));
    }

    public function test_creating_store_requires_required_fields(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/stores', []);

        $response->assertStatus(422)->assertJsonValidationErrors([
            'name', 'cr_number', 'vat_number', 'owner_name', 'owner_email', 'owner_phone',
        ]);
    }

    public function test_creating_store_rejects_duplicate_cr_number(): void
    {
        Mail::fake();
        $admin = User::factory()->admin()->create();
        Store::factory()->create(['cr_number' => '1010101010']);

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/stores', $this->validStorePayload());

        $response->assertStatus(422)->assertJsonValidationErrors(['cr_number']);
    }

    public function test_admin_can_update_store(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/stores/{$store->id}", ['name' => 'Updated Store Name']);

        $response->assertOk()->assertJsonPath('data.name', 'Updated Store Name');
    }

    public function test_admin_can_delete_store(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->deleteJson("/api/stores/{$store->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('stores', ['id' => $store->id]);
    }

    public function test_admin_can_update_store_status(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/stores/{$store->id}/status", ['status' => 'suspended']);

        $response->assertOk()->assertJsonPath('data.status', 'suspended');
    }

    public function test_rejecting_a_store_requires_a_rejection_reason(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/stores/{$store->id}/status", ['status' => 'rejected']);

        $response->assertStatus(422)->assertJsonValidationErrors(['rejection_reason']);
    }

    /**
     * Proves store writes are gated on the specific stores.* permissions, not
     * just user_type === admin: the limited "user" admin role only has
     * stores.view, so every write action here must still be rejected.
     */
    public function test_admin_with_limited_role_cannot_write_stores(): void
    {
        $limitedAdmin = User::factory()->admin()->withRole('user')->create();
        $store = Store::factory()->create();

        $this->actingAs($limitedAdmin, 'sanctum')
            ->postJson('/api/stores', $this->validStorePayload())
            ->assertStatus(403);

        $this->actingAs($limitedAdmin, 'sanctum')
            ->patchJson("/api/stores/{$store->id}", ['name' => 'Updated'])
            ->assertStatus(403);

        $this->actingAs($limitedAdmin, 'sanctum')
            ->deleteJson("/api/stores/{$store->id}")
            ->assertStatus(403);

        $this->actingAs($limitedAdmin, 'sanctum')
            ->patchJson("/api/stores/{$store->id}/status", ['status' => 'active'])
            ->assertStatus(403);

        // stores.view is granted to the limited role, so reads still work.
        $this->actingAs($limitedAdmin, 'sanctum')->getJson('/api/stores')->assertOk();
    }

    /**
     * @return array<string, string>
     */
    private function validStorePayload(): array
    {
        return [
            'name' => 'Al-Amal Building Materials',
            'cr_number' => '1010101010',
            'vat_number' => '300000000000003',
            'owner_name' => 'Store Owner',
            'owner_email' => 'owner@example.com',
            'owner_phone' => '+966501234567',
            'owner_whatsapp' => '+966501234567',
        ];
    }
}
