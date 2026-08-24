<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Enums\StoreUserRole;
use App\Enums\UserType;
use App\Mail\StoreActivationMail;
use App\Models\CatalogProduct;
use App\Models\Category;
use App\Models\Permission;
use App\Models\Product;
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
        $staff = User::factory()->create(['user_type' => UserType::VendorStaff]);
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

    public function test_guest_cannot_view_dashboard_stats(): void
    {
        $this->getJson('/api/stores/me/dashboard')->assertStatus(401);
    }

    public function test_store_owner_can_view_own_dashboard_stats(): void
    {
        $store = Store::factory()->active()->create();
        $otherStore = Store::factory()->active()->create();
        $owner = User::factory()->create(['user_type' => UserType::StoreOwner]);
        $store->users()->attach($owner->id, ['role' => StoreUserRole::Owner->value]);

        Product::factory()->for($store)->create(['stock_quantity' => 0]);
        Product::factory()->for($store)->create(['stock_quantity' => 5]);
        Product::factory()->for($store)->create(['stock_quantity' => 50]);
        Product::factory()->for($store)->suspended()->create(['stock_quantity' => 20]);
        // Belongs to a different store — must not be counted.
        Product::factory()->for($otherStore)->create(['stock_quantity' => 20]);

        $response = $this->actingAs($owner, 'sanctum')->getJson('/api/stores/me/dashboard');

        $response->assertOk()
            ->assertJsonPath('data.total', 4)
            ->assertJsonPath('data.limit', 100)
            ->assertJsonPath('data.remaining', 96)
            ->assertJsonPath('data.out_of_stock', 1)
            ->assertJsonPath('data.low_stock', 1)
            ->assertJsonPath('data.in_stock', 2)
            ->assertJsonPath('data.active', 3)
            ->assertJsonPath('data.suspended', 1);
    }

    public function test_user_with_no_store_gets_404_on_dashboard_stats(): void
    {
        $customer = User::factory()->create(['user_type' => UserType::Customer]);

        $this->actingAs($customer, 'sanctum')->getJson('/api/stores/me/dashboard')->assertStatus(404);
    }

    public function test_dashboard_stats_breaks_down_products_by_category_and_day(): void
    {
        $store = Store::factory()->active()->create();
        $owner = $this->withOwner($store);

        $tools = Category::factory()->create(['name' => 'Tools']);
        $paint = Category::factory()->create(['name' => 'Paint']);

        Product::factory()->for($store)->create(['catalog_product_id' => CatalogProduct::factory()->create(['category_id' => $tools->id]), 'created_at' => now()]);
        Product::factory()->for($store)->create(['catalog_product_id' => CatalogProduct::factory()->create(['category_id' => $tools->id]), 'created_at' => now()]);
        Product::factory()->for($store)->create(['catalog_product_id' => CatalogProduct::factory()->create(['category_id' => $paint->id]), 'created_at' => now()->subDays(2)]);
        // No category — must not appear in by_category, but still counts toward total/added_over_time.
        Product::factory()->for($store)->create(['catalog_product_id' => CatalogProduct::factory()->create(['category_id' => null]), 'created_at' => now()]);

        $response = $this->actingAs($owner, 'sanctum')->getJson('/api/stores/me/dashboard');

        $response->assertOk()
            ->assertJsonPath('data.total', 4)
            ->assertJsonPath('data.by_category', [
                ['name' => 'Tools', 'count' => 2],
                ['name' => 'Paint', 'count' => 1],
            ]);

        $addedOverTime = collect($response->json('data.added_over_time'))->keyBy('date');
        $this->assertSame(3, $addedOverTime->get(now()->toDateString())['count'] ?? null);
        $this->assertSame(1, $addedOverTime->get(now()->subDays(2)->toDateString())['count'] ?? null);
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
            ->assertJsonPath('data.location.formatted_address', '123 King Fahd Road, Al Olaya, Riyadh 12214, Saudi Arabia')
            ->assertJsonPath('data.location.city', 'Riyadh')
            ->assertJsonPath('data.location.latitude', 24.7136)
            ->assertJsonPath('data.location.longitude', 46.6753)
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
            ->assertJsonPath('data.location.latitude', null)
            ->assertJsonPath('data.location.longitude', null)
            ->assertJsonPath('data.location.city', null)
            ->assertJsonPath('data.location.formatted_address', null)
            ->assertJsonCount(7, 'data.schedule');
    }

    public function test_creating_store_rejects_partial_location(): void
    {
        $admin = User::factory()->admin()->create();

        $payload = $this->validStorePayload();
        unset($payload['location']['formatted_address']);

        $response = $this->actingAs($admin, 'sanctum')->post('/api/stores', $payload);

        $response->assertStatus(422)->assertJsonValidationErrors(['location.formatted_address']);
    }

    public function test_creating_store_rejects_out_of_range_coordinates(): void
    {
        $admin = User::factory()->admin()->create();

        $payload = $this->validStorePayload();
        $payload['location']['latitude'] = 91;

        $response = $this->actingAs($admin, 'sanctum')->post('/api/stores', $payload);

        $response->assertStatus(422)->assertJsonValidationErrors(['location.latitude']);
    }

    public function test_admin_can_filter_stores_by_city(): void
    {
        $admin = User::factory()->admin()->create();
        Store::factory()->count(2)->create(['city' => 'Riyadh']);
        Store::factory()->create(['city' => 'Jeddah']);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/stores?city=Riyadh');

        $response->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_admin_can_search_stores_by_name(): void
    {
        $admin = User::factory()->admin()->create();
        Store::factory()->create(['name' => 'Al-Amal Building Materials']);
        Store::factory()->create(['name' => 'Riyadh Hardware Co']);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/stores?search=Amal');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Al-Amal Building Materials');
    }

    public function test_admin_can_search_stores_by_owner_name(): void
    {
        $admin = User::factory()->admin()->create();
        $matchingStore = Store::factory()->create(['name' => 'Riyadh Hardware Co']);
        $owner = $this->withOwner($matchingStore);
        $owner->update(['name' => 'Khalid Al-Otaibi']);
        Store::factory()->create(['name' => 'Jeddah Tools Co']);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/stores?search=Otaibi');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $matchingStore->id);
    }

    public function test_store_search_matches_neither_name_nor_owner_returns_empty(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create(['name' => 'Riyadh Hardware Co']);
        $this->withOwner($store)->update(['name' => 'Khalid Al-Otaibi']);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/stores?search=NoSuchThing');

        $response->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_creating_store_requires_owner_whatsapp(): void
    {
        $admin = User::factory()->admin()->create();

        $payload = $this->validStorePayload();
        unset($payload['owner_whatsapp']);

        $response = $this->actingAs($admin, 'sanctum')->post('/api/stores', $payload);

        $response->assertStatus(422)->assertJsonValidationErrors(['owner_whatsapp']);
    }

    public function test_creating_store_rejects_invalid_whatsapp_format(): void
    {
        $admin = User::factory()->admin()->create();

        $payload = $this->validStorePayload();
        $payload['owner_whatsapp'] = '12345';

        $response = $this->actingAs($admin, 'sanctum')->post('/api/stores', $payload);

        $response->assertStatus(422)->assertJsonValidationErrors(['owner_whatsapp']);
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

    private function withOwner(Store $store): User
    {
        $owner = User::factory()->create(['user_type' => UserType::StoreOwner]);
        $store->owners()->attach($owner->id, ['role' => StoreUserRole::Owner->value]);

        return $owner;
    }

    public function test_guest_cannot_update_store_owner(): void
    {
        $store = Store::factory()->create();
        $this->withOwner($store);

        $this->patchJson("/api/stores/{$store->id}/owner", ['name' => 'New Owner Name'])
            ->assertStatus(401);
    }

    public function test_store_owner_cannot_update_their_own_contact_info(): void
    {
        $store = Store::factory()->create();
        $owner = $this->withOwner($store);

        $this->actingAs($owner, 'sanctum')
            ->patchJson("/api/stores/{$store->id}/owner", ['name' => 'New Owner Name'])
            ->assertStatus(403);
    }

    public function test_admin_without_vendors_edit_permission_cannot_update_store_owner(): void
    {
        $admin = User::factory()->admin()->withRole('staff')->create();
        $admin->permissions()->sync(Permission::query()->where('key', 'stores.edit')->pluck('id'));
        $store = Store::factory()->create();
        $this->withOwner($store);

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/stores/{$store->id}/owner", ['name' => 'New Owner Name'])
            ->assertStatus(403);
    }

    public function test_admin_with_vendors_edit_permission_can_update_store_owner(): void
    {
        $admin = User::factory()->admin()->withRole('staff')->create();
        $admin->permissions()->sync(Permission::query()->where('key', 'vendors.edit')->pluck('id'));
        $store = Store::factory()->create();
        $owner = $this->withOwner($store);

        $response = $this->actingAs($admin, 'sanctum')->patchJson("/api/stores/{$store->id}/owner", [
            'name' => 'Updated Owner Name',
            'email' => 'updated-owner@example.com',
            'phone' => '0512345678',
            'whatsapp' => '0512345678',
        ]);

        $response->assertOk()->assertJsonPath('data.owner.name', 'Updated Owner Name');
        $this->assertDatabaseHas('users', ['id' => $owner->id, 'name' => 'Updated Owner Name', 'email' => 'updated-owner@example.com']);
    }

    public function test_updating_store_owner_rejects_duplicate_email(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->create(['email' => 'taken@example.com']);
        $store = Store::factory()->create();
        $this->withOwner($store);

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/stores/{$store->id}/owner", ['email' => 'taken@example.com'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_updating_store_owner_with_its_own_unchanged_email_is_allowed(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create();
        $owner = $this->withOwner($store);

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/stores/{$store->id}/owner", ['email' => $owner->email])
            ->assertOk();
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
            ->patchJson("/api/stores/{$store->id}/status", [
                'status' => 'suspended',
                'suspension_reason' => 'Fraudulent activity reported.',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'suspended')
            ->assertJsonPath('data.suspension_reason', 'Fraudulent activity reported.');
    }

    public function test_rejecting_a_store_requires_a_rejection_reason(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/stores/{$store->id}/status", ['status' => 'rejected']);

        $response->assertStatus(422)->assertJsonValidationErrors(['rejection_reason']);
    }

    public function test_suspending_a_store_requires_a_suspension_reason(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->active()->create();

        $response = $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/stores/{$store->id}/status", ['status' => 'suspended']);

        $response->assertStatus(422)->assertJsonValidationErrors(['suspension_reason']);

        $this->assertDatabaseHas('stores', ['id' => $store->id, 'status' => 'active']);
    }

    /**
     * Proves store writes are gated on the specific stores.* permissions, not
     * just user_type === admin: this staff account is only granted stores.view,
     * so every write action here must still be rejected.
     */
    public function test_admin_with_limited_role_cannot_write_stores(): void
    {
        $limitedAdmin = User::factory()->admin()->withRole('staff')->create();
        $limitedAdmin->permissions()->sync(Permission::query()->where('key', 'stores.view')->pluck('id'));
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
     * Proves the four store status transitions are gated on their own
     * distinct permissions rather than all collapsing onto stores.verify.
     */
    public function test_stores_verify_permission_alone_cannot_approve_reject_or_suspend(): void
    {
        $verifyOnly = User::factory()->admin()->withRole('staff')->create();
        $verifyOnly->permissions()->sync(Permission::query()->where('key', 'stores.verify')->pluck('id'));

        $pendingStore = Store::factory()->create();
        $activeStore = Store::factory()->active()->create();

        $this->actingAs($verifyOnly, 'sanctum')
            ->patchJson("/api/stores/{$pendingStore->id}/status", ['status' => 'active'])
            ->assertStatus(403);

        $this->actingAs($verifyOnly, 'sanctum')
            ->patchJson("/api/stores/{$pendingStore->id}/status", [
                'status' => 'rejected',
                'rejection_reason' => 'Incomplete documents',
            ])
            ->assertStatus(403);

        $this->actingAs($verifyOnly, 'sanctum')
            ->patchJson("/api/stores/{$activeStore->id}/status", ['status' => 'suspended'])
            ->assertStatus(403);

        // stores.verify still governs reverting a store back to pending review.
        $this->actingAs($verifyOnly, 'sanctum')
            ->patchJson("/api/stores/{$activeStore->id}/status", ['status' => 'pending'])
            ->assertOk();
    }

    public function test_stores_approve_permission_allows_only_approving(): void
    {
        $approver = User::factory()->admin()->withRole('staff')->create();
        $approver->permissions()->sync(Permission::query()->where('key', 'stores.approve')->pluck('id'));

        $pendingStore = Store::factory()->create();

        $this->actingAs($approver, 'sanctum')
            ->patchJson("/api/stores/{$pendingStore->id}/status", ['status' => 'active'])
            ->assertOk()
            ->assertJsonPath('data.status', 'active');

        $this->actingAs($approver, 'sanctum')
            ->patchJson("/api/stores/{$pendingStore->id}/status", ['status' => 'suspended'])
            ->assertStatus(403);
    }

    public function test_stores_reject_permission_allows_only_rejecting(): void
    {
        $rejecter = User::factory()->admin()->withRole('staff')->create();
        $rejecter->permissions()->sync(Permission::query()->where('key', 'stores.reject')->pluck('id'));

        $pendingStore = Store::factory()->create();

        $this->actingAs($rejecter, 'sanctum')
            ->patchJson("/api/stores/{$pendingStore->id}/status", ['status' => 'active'])
            ->assertStatus(403);

        $this->actingAs($rejecter, 'sanctum')
            ->patchJson("/api/stores/{$pendingStore->id}/status", [
                'status' => 'rejected',
                'rejection_reason' => 'Invalid CR number',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'rejected');
    }

    public function test_stores_suspend_permission_allows_suspending_and_unsuspending(): void
    {
        $suspender = User::factory()->admin()->withRole('staff')->create();
        $suspender->permissions()->sync(Permission::query()->where('key', 'stores.suspend')->pluck('id'));

        $activeStore = Store::factory()->active()->create();

        $this->actingAs($suspender, 'sanctum')
            ->patchJson("/api/stores/{$activeStore->id}/status", [
                'status' => 'suspended',
                'suspension_reason' => 'Repeated customer complaints.',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'suspended')
            ->assertJsonPath('data.suspension_reason', 'Repeated customer complaints.');

        $this->actingAs($suspender, 'sanctum')
            ->patchJson("/api/stores/{$activeStore->id}/status", ['status' => 'active'])
            ->assertOk()
            ->assertJsonPath('data.status', 'active')
            ->assertJsonPath('data.suspension_reason', null);
    }

    /**
     * Proves deleting a store requires the distinct stores.delete permission,
     * not just stores.edit (the previous bug).
     */
    public function test_stores_edit_permission_alone_cannot_delete_store(): void
    {
        $editorOnly = User::factory()->admin()->withRole('staff')->create();
        $editorOnly->permissions()->sync(Permission::query()->where('key', 'stores.edit')->pluck('id'));
        $store = Store::factory()->create();

        $this->actingAs($editorOnly, 'sanctum')
            ->deleteJson("/api/stores/{$store->id}")
            ->assertStatus(403);
        $this->assertDatabaseHas('stores', ['id' => $store->id]);
    }

    public function test_stores_delete_permission_allows_deleting_store(): void
    {
        $deleter = User::factory()->admin()->withRole('staff')->create();
        $deleter->permissions()->sync(Permission::query()->where('key', 'stores.delete')->pluck('id'));
        $store = Store::factory()->create();

        $this->actingAs($deleter, 'sanctum')
            ->deleteJson("/api/stores/{$store->id}")
            ->assertStatus(204);
        $this->assertDatabaseMissing('stores', ['id' => $store->id]);
    }

    /**
     * Proves a Vendor (StoreOwner) cannot reach the admin-only general update
     * endpoint at all, even to change fields they don't own such as name.
     */
    public function test_vendor_cannot_update_store_via_general_endpoint(): void
    {
        $store = Store::factory()->active()->create();
        $owner = $this->withOwner($store);

        $this->actingAs($owner, 'sanctum')
            ->patchJson("/api/stores/{$store->id}", ['name' => 'Hacked Name'])
            ->assertStatus(403);

        $this->assertDatabaseMissing('stores', ['id' => $store->id, 'name' => 'Hacked Name']);
    }

    public function test_vendor_cannot_update_store_status(): void
    {
        $store = Store::factory()->active()->create();
        $owner = $this->withOwner($store);

        $this->actingAs($owner, 'sanctum')
            ->patchJson("/api/stores/{$store->id}/status", ['status' => 'suspended'])
            ->assertStatus(403);

        $this->assertDatabaseHas('stores', ['id' => $store->id, 'status' => 'active']);
    }

    public function test_vendor_cannot_update_store_owner_contact_info(): void
    {
        $store = Store::factory()->active()->create();
        $owner = $this->withOwner($store);

        $this->actingAs($owner, 'sanctum')
            ->patchJson("/api/stores/{$store->id}/owner", ['name' => 'New Name'])
            ->assertStatus(403);
    }

    public function test_vendor_can_update_own_store_location(): void
    {
        $store = Store::factory()->active()->create();
        $owner = $this->withOwner($store);

        $response = $this->actingAs($owner, 'sanctum')->patchJson("/api/stores/{$store->id}/location", [
            'latitude' => 24.7136,
            'longitude' => 46.6753,
            'city' => 'Riyadh',
            'formatted_address' => '123 King Fahd Road, Al Olaya, Riyadh 12214, Saudi Arabia',
        ]);

        $response->assertOk()->assertJsonPath('data.location.city', 'Riyadh');
    }

    public function test_vendor_can_update_own_store_schedule(): void
    {
        $store = Store::factory()->active()->create();
        $owner = $this->withOwner($store);

        $response = $this->actingAs($owner, 'sanctum')
            ->putJson("/api/stores/{$store->id}/schedule", ['schedule' => $this->fullWeekSchedule()]);

        $response->assertOk()->assertJsonCount(7, 'data.schedule');
    }

    public function test_vendor_can_update_own_store_logo(): void
    {
        $store = Store::factory()->active()->create();
        $owner = $this->withOwner($store);

        $response = $this->actingAs($owner, 'sanctum')
            ->post("/api/stores/{$store->id}/logo", ['logo' => UploadedFile::fake()->image('logo.png')]);

        $response->assertOk();
        $this->assertNotNull($store->fresh()->logo_url);
    }

    public function test_guest_cannot_remove_store_logo(): void
    {
        $store = Store::factory()->active()->create(['logo_url' => Storage::disk('public')->url('stores/logos/existing.png')]);

        $this->deleteJson("/api/stores/{$store->id}/logo")->assertStatus(401);
    }

    public function test_vendor_can_remove_own_store_logo(): void
    {
        $store = Store::factory()->active()->create();
        $owner = $this->withOwner($store);

        $this->actingAs($owner, 'sanctum')
            ->post("/api/stores/{$store->id}/logo", ['logo' => UploadedFile::fake()->image('logo.png')])
            ->assertOk();

        $path = str_replace(Storage::disk('public')->url(''), '', $store->fresh()->logo_url);
        Storage::disk('public')->assertExists($path);

        $response = $this->actingAs($owner, 'sanctum')->deleteJson("/api/stores/{$store->id}/logo");

        $response->assertOk()->assertJsonPath('data.logo_url', null);
        $this->assertNull($store->fresh()->logo_url);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_vendor_cannot_remove_logo_of_another_stores(): void
    {
        $ownStore = Store::factory()->active()->create();
        $otherStore = Store::factory()->active()->create(['logo_url' => Storage::disk('public')->url('stores/logos/existing.png')]);
        $owner = $this->withOwner($ownStore);

        $this->actingAs($owner, 'sanctum')
            ->deleteJson("/api/stores/{$otherStore->id}/logo")
            ->assertStatus(403);

        $this->assertNotNull($otherStore->fresh()->logo_url);
    }

    public function test_admin_can_remove_any_store_logo(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create();

        $this->actingAs($admin, 'sanctum')
            ->post("/api/stores/{$store->id}/logo", ['logo' => UploadedFile::fake()->image('logo.png')])
            ->assertOk();

        $response = $this->actingAs($admin, 'sanctum')->deleteJson("/api/stores/{$store->id}/logo");

        $response->assertOk()->assertJsonPath('data.logo_url', null);
        $this->assertNull($store->fresh()->logo_url);
    }

    public function test_vendor_cannot_update_location_of_another_stores(): void
    {
        $ownStore = Store::factory()->active()->create();
        $otherStore = Store::factory()->active()->create();
        $owner = $this->withOwner($ownStore);

        $this->actingAs($owner, 'sanctum')->patchJson("/api/stores/{$otherStore->id}/location", [
            'latitude' => 24.7136,
            'longitude' => 46.6753,
            'city' => 'Riyadh',
            'formatted_address' => '123 King Fahd Road, Al Olaya, Riyadh 12214, Saudi Arabia',
        ])->assertStatus(403);
    }

    public function test_store_staff_can_update_own_store_location_but_not_the_store_itself(): void
    {
        $store = Store::factory()->active()->create();
        $staff = User::factory()->create(['user_type' => UserType::VendorStaff]);
        $store->users()->attach($staff->id, ['role' => StoreUserRole::Staff->value]);

        $this->actingAs($staff, 'sanctum')->patchJson("/api/stores/{$store->id}/location", [
            'latitude' => 24.7136,
            'longitude' => 46.6753,
            'city' => 'Riyadh',
            'formatted_address' => '123 King Fahd Road, Al Olaya, Riyadh 12214, Saudi Arabia',
        ])->assertOk();

        $this->actingAs($staff, 'sanctum')
            ->patchJson("/api/stores/{$store->id}", ['name' => 'Hacked Name'])
            ->assertStatus(403);
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
                'latitude' => 24.7136,
                'longitude' => 46.6753,
                'city' => 'Riyadh',
                'formatted_address' => '123 King Fahd Road, Al Olaya, Riyadh 12214, Saudi Arabia',
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
