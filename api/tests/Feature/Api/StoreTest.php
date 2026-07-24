<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Enums\StoreUserRole;
use App\Enums\UserType;
use App\Mail\StoreActivationMail;
use App\Models\Store;
use App\Models\StoreActivationToken;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StoreTest extends TestCase
{
    use RefreshDatabase;

    private const DAYS = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class, PermissionSeeder::class, RolePermissionSeeder::class]);
        Storage::fake('public');
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
        $store = Store::factory()->withSchedule()->create();

        $response = $this->actingAs($admin, 'sanctum')->getJson("/api/stores/{$store->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $store->id)
            ->assertJsonCount(7, 'data.schedule');
    }

    public function test_viewing_a_missing_store_returns_404(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin, 'sanctum')->getJson('/api/stores/999999')->assertStatus(404);
    }

    public function test_store_owner_can_view_their_own_store(): void
    {
        $store = Store::factory()->active()->withSchedule()->create();
        $owner = User::factory()->create(['user_type' => UserType::StoreOwner]);
        $store->users()->attach($owner->id, ['role' => StoreUserRole::Owner->value]);

        $response = $this->actingAs($owner, 'sanctum')->getJson("/api/stores/{$store->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $store->id)
            ->assertJsonCount(7, 'data.schedule');
    }

    public function test_store_staff_can_view_their_own_store(): void
    {
        $store = Store::factory()->active()->create();
        $staff = User::factory()->create(['user_type' => UserType::StoreStaff]);
        $store->users()->attach($staff->id, ['role' => StoreUserRole::Staff->value]);

        $this->actingAs($staff, 'sanctum')
            ->getJson("/api/stores/{$store->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $store->id);
    }

    public function test_store_owner_cannot_view_another_stores_details(): void
    {
        $store = Store::factory()->create();
        $otherStore = Store::factory()->active()->create();
        $owner = User::factory()->create(['user_type' => UserType::StoreOwner]);
        $otherStore->users()->attach($owner->id, ['role' => StoreUserRole::Owner->value]);

        $this->actingAs($owner, 'sanctum')
            ->getJson("/api/stores/{$store->id}")
            ->assertStatus(403);
    }

    public function test_guest_cannot_view_stores_me(): void
    {
        $this->getJson('/api/stores/me')->assertStatus(401);
    }

    public function test_store_owner_can_view_own_store_via_me_endpoint(): void
    {
        $store = Store::factory()->active()->withSchedule()->create();
        $owner = User::factory()->create(['user_type' => UserType::StoreOwner]);
        $store->users()->attach($owner->id, ['role' => StoreUserRole::Owner->value]);

        $response = $this->actingAs($owner, 'sanctum')->getJson('/api/stores/me');

        $response->assertOk()
            ->assertJsonPath('data.id', $store->id)
            ->assertJsonCount(7, 'data.schedule');
    }

    public function test_user_with_no_store_gets_404_on_stores_me(): void
    {
        $customer = User::factory()->create(['user_type' => UserType::Customer]);

        $this->actingAs($customer, 'sanctum')->getJson('/api/stores/me')->assertStatus(404);
    }

    public function test_guest_cannot_create_store(): void
    {
        $this->post('/api/stores', $this->validStorePayload())->assertStatus(401);
    }

    public function test_non_admin_cannot_create_store(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->post('/api/stores', $this->validStorePayload())
            ->assertStatus(403);
    }

    public function test_admin_can_create_store(): void
    {
        Mail::fake();
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin, 'sanctum')
            ->post('/api/stores', $this->validStorePayload());

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.location.full_address', '123 King Fahd Road')
            ->assertJsonCount(7, 'data.schedule');

        $this->assertDatabaseHas('stores', ['cr_number' => '1010101010']);
        $this->assertDatabaseHas('users', ['email' => 'owner@example.com', 'user_type' => 'store_owner']);

        $store = Store::query()->where('cr_number', '1010101010')->firstOrFail();
        $this->assertSame(1, $store->owners()->count());
        $this->assertCount(1, StoreActivationToken::query()->where('store_id', $store->id)->get());
        $this->assertCount(7, $store->schedules);
        $this->assertNotNull($store->logo_url);

        $path = str_replace(Storage::disk('public')->url(''), '', $store->logo_url);
        Storage::disk('public')->assertExists($path);

        Mail::assertQueued(StoreActivationMail::class, fn ($mail) => $mail->hasTo('owner@example.com'));
    }

    public function test_creating_store_requires_required_fields(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin, 'sanctum')->post('/api/stores', []);

        $response->assertStatus(422)->assertJsonValidationErrors([
            'name', 'cr_number', 'vat_number', 'owner_name', 'owner_email', 'owner_phone', 'schedule',
        ]);
    }

    public function test_creating_store_rejects_duplicate_cr_number(): void
    {
        Mail::fake();
        $admin = User::factory()->admin()->create();
        Store::factory()->create(['cr_number' => '1010101010']);

        $response = $this->actingAs($admin, 'sanctum')
            ->post('/api/stores', $this->validStorePayload());

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['cr_number'])
            ->assertJsonFragment(['cr_number' => ['This CR number is already registered to another store.']]);
        $this->assertDatabaseCount('stores', 1);
        $this->assertDatabaseMissing('users', ['email' => 'owner@example.com']);
    }

    public function test_admin_can_create_store_without_logo_or_location(): void
    {
        Mail::fake();
        $admin = User::factory()->admin()->create();

        $payload = $this->validStorePayload();
        unset($payload['logo'], $payload['location']);

        $response = $this->actingAs($admin, 'sanctum')->post('/api/stores', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.logo_url', null)
            ->assertJsonPath('data.location.full_address', null)
            ->assertJsonCount(7, 'data.schedule');
    }

    public function test_creating_store_with_partial_location_still_requires_valid_fields(): void
    {
        $admin = User::factory()->admin()->create();

        $payload = $this->validStorePayload();
        $payload['location']['latitude'] = 91;

        $response = $this->actingAs($admin, 'sanctum')->post('/api/stores', $payload);

        $response->assertStatus(422)->assertJsonValidationErrors(['location.latitude']);
    }

    public function test_creating_store_requires_a_complete_schedule(): void
    {
        $admin = User::factory()->admin()->create();

        $payload = $this->validStorePayload();
        array_pop($payload['schedule']);

        $response = $this->actingAs($admin, 'sanctum')->post('/api/stores', $payload);

        $response->assertStatus(422)->assertJsonValidationErrors(['schedule']);
    }

    public function test_admin_can_update_store(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/stores/{$store->id}", ['name' => 'Updated Store Name']);

        $response->assertOk()->assertJsonPath('data.name', 'Updated Store Name');
    }

    public function test_updating_a_store_with_its_own_unchanged_cr_number_is_allowed(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create(['cr_number' => '1010101010']);

        $response = $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/stores/{$store->id}", ['cr_number' => '1010101010']);

        $response->assertOk();
    }

    public function test_updating_a_store_with_another_stores_cr_number_is_rejected(): void
    {
        $admin = User::factory()->admin()->create();
        Store::factory()->create(['cr_number' => '2020202020']);
        $store = Store::factory()->create(['cr_number' => '1010101010']);

        $response = $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/stores/{$store->id}", ['cr_number' => '2020202020']);

        $response->assertStatus(422)
            ->assertJsonFragment(['cr_number' => ['This CR number is already registered to another store.']]);
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
            ->post('/api/stores', $this->validStorePayload())
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
     * @return array<string, mixed>
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
            'logo' => UploadedFile::fake()->image('logo.png'),
            'location' => [
                'full_address' => '123 King Fahd Road',
                'city' => 'Riyadh',
                'district' => 'Al Olaya',
                'country' => 'Saudi Arabia',
                'latitude' => 24.7136,
                'longitude' => 46.6753,
            ],
            'schedule' => $this->fullWeekSchedule(),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function fullWeekSchedule(): array
    {
        return array_map(fn (string $day) => [
            'day' => $day,
            'open_time' => '08:00 AM',
            'close_time' => '10:00 PM',
            'is_off' => false,
        ], self::DAYS);
    }
}
