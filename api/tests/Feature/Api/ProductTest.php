<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Enums\ProductStatus;
use App\Enums\StoreUserRole;
use App\Enums\UserType;
use App\Models\Category;
use App\Models\Permission;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class, PermissionSeeder::class, RolePermissionSeeder::class]);
        Storage::fake('public');
    }

    private function ownerFor(Store $store): User
    {
        $owner = User::factory()->create(['user_type' => UserType::StoreOwner]);
        $store->users()->attach($owner->id, ['role' => StoreUserRole::Owner->value]);

        return $owner;
    }

    private function adminWithPermissions(array $keys): User
    {
        $admin = User::factory()->admin()->withRole('staff')->create();
        $admin->permissions()->sync(Permission::query()->whereIn('key', $keys)->pluck('id'));

        return $admin;
    }

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Cordless Drill',
            'slug' => 'cordless-drill',
            'price' => 199.99,
            'image' => UploadedFile::fake()->image('product.jpg', 400, 400),
        ], $overrides);
    }

    public function test_guest_cannot_list_products(): void
    {
        $this->getJson('/api/products')->assertStatus(401);
    }

    public function test_guest_cannot_view_product(): void
    {
        $product = Product::factory()->create();

        $this->getJson("/api/products/{$product->id}")->assertStatus(401);
    }

    public function test_store_owner_only_sees_their_own_store_products(): void
    {
        $storeA = Store::factory()->active()->create();
        $storeB = Store::factory()->active()->create();
        Product::factory()->count(2)->create(['store_id' => $storeA->id]);
        Product::factory()->count(3)->create(['store_id' => $storeB->id]);

        $owner = $this->ownerFor($storeA);

        $response = $this->actingAs($owner, 'sanctum')->getJson('/api/products');

        $response->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_store_owner_cannot_view_another_stores_product(): void
    {
        $storeA = Store::factory()->active()->create();
        $storeB = Store::factory()->active()->create();
        $product = Product::factory()->create(['store_id' => $storeB->id]);

        $owner = $this->ownerFor($storeA);

        $this->actingAs($owner, 'sanctum')
            ->getJson("/api/products/{$product->id}")
            ->assertStatus(403);
    }

    public function test_admin_with_products_view_can_list_all_products(): void
    {
        Product::factory()->count(3)->create();
        $admin = $this->adminWithPermissions(['products.view']);

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/products')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_admin_without_products_view_cannot_list_products(): void
    {
        $admin = $this->adminWithPermissions([]);

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/products')
            ->assertStatus(403);
    }

    public function test_store_owner_can_create_product_for_their_store(): void
    {
        $store = Store::factory()->active()->create();
        $otherStore = Store::factory()->active()->create();
        $owner = $this->ownerFor($store);

        $response = $this->actingAs($owner, 'sanctum')
            ->post('/api/products', $this->validPayload(['store_id' => $otherStore->id]));

        $response->assertStatus(201);
        $this->assertDatabaseHas('products', ['slug' => 'cordless-drill', 'store_id' => $store->id]);
    }

    public function test_creating_product_requires_image(): void
    {
        $store = Store::factory()->active()->create();
        $owner = $this->ownerFor($store);

        $payload = $this->validPayload();
        unset($payload['image']);

        $this->actingAs($owner, 'sanctum')
            ->post('/api/products', $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['image']);
    }

    public function test_creating_product_validates_category_existence(): void
    {
        $store = Store::factory()->active()->create();
        $owner = $this->ownerFor($store);

        $this->actingAs($owner, 'sanctum')
            ->post('/api/products', $this->validPayload(['category_id' => 999999]))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['category_id']);
    }

    public function test_admin_with_products_create_can_create_product_for_any_store(): void
    {
        $store = Store::factory()->active()->create();
        $admin = $this->adminWithPermissions(['products.create']);

        $this->actingAs($admin, 'sanctum')
            ->post('/api/products', $this->validPayload(['store_id' => $store->id]))
            ->assertStatus(201);
    }

    public function test_admin_without_products_create_cannot_create_product(): void
    {
        $store = Store::factory()->active()->create();
        $admin = $this->adminWithPermissions([]);

        $this->actingAs($admin, 'sanctum')
            ->post('/api/products', $this->validPayload(['store_id' => $store->id]))
            ->assertStatus(403);
    }

    public function test_store_staff_can_update_their_stores_product(): void
    {
        $store = Store::factory()->active()->create();
        $product = Product::factory()->create(['store_id' => $store->id]);
        $staff = User::factory()->create(['user_type' => UserType::VendorStaff]);
        $store->users()->attach($staff->id, ['role' => StoreUserRole::Staff->value]);

        $this->actingAs($staff, 'sanctum')
            ->patchJson("/api/products/{$product->id}", ['name' => 'Updated Drill'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Updated Drill');
    }

    public function test_store_owner_cannot_update_another_stores_product(): void
    {
        $storeA = Store::factory()->active()->create();
        $storeB = Store::factory()->active()->create();
        $product = Product::factory()->create(['store_id' => $storeB->id]);
        $owner = $this->ownerFor($storeA);

        $this->actingAs($owner, 'sanctum')
            ->patchJson("/api/products/{$product->id}", ['name' => 'Hijacked'])
            ->assertStatus(403);
    }

    public function test_admin_can_delete_product(): void
    {
        $product = Product::factory()->create();
        $admin = $this->adminWithPermissions(['products.delete']);

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/products/{$product->id}")
            ->assertStatus(204);

        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    public function test_admin_without_delete_permission_cannot_delete_product(): void
    {
        $product = Product::factory()->create();
        $admin = $this->adminWithPermissions([]);

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/products/{$product->id}")
            ->assertStatus(403);

        $this->assertDatabaseHas('products', ['id' => $product->id]);
    }

    public function test_store_owner_can_set_active_product_to_inactive_and_reactivate(): void
    {
        $store = Store::factory()->active()->create();
        $product = Product::factory()->create(['store_id' => $store->id, 'status' => ProductStatus::Active]);
        $owner = $this->ownerFor($store);

        $this->actingAs($owner, 'sanctum')
            ->patchJson("/api/products/{$product->id}/status", ['status' => 'inactive'])
            ->assertOk()
            ->assertJsonPath('data.status', 'inactive');

        $this->actingAs($owner, 'sanctum')
            ->patchJson("/api/products/{$product->id}/status", ['status' => 'active'])
            ->assertOk()
            ->assertJsonPath('data.status', 'active');
    }

    public function test_store_owner_cannot_suspend_product(): void
    {
        $store = Store::factory()->active()->create();
        $product = Product::factory()->create(['store_id' => $store->id, 'status' => ProductStatus::Active]);
        $owner = $this->ownerFor($store);

        $this->actingAs($owner, 'sanctum')
            ->patchJson("/api/products/{$product->id}/status", ['status' => 'suspended'])
            ->assertStatus(403);
    }

    public function test_store_owner_cannot_reactivate_suspended_product(): void
    {
        $store = Store::factory()->active()->create();
        $product = Product::factory()->suspended()->create(['store_id' => $store->id]);
        $owner = $this->ownerFor($store);

        $this->actingAs($owner, 'sanctum')
            ->patchJson("/api/products/{$product->id}/status", ['status' => 'active'])
            ->assertStatus(403);

        $this->assertDatabaseHas('products', ['id' => $product->id, 'status' => ProductStatus::Suspended->value]);
    }

    public function test_admin_with_hide_permission_can_toggle_inactive_and_reactivate(): void
    {
        $product = Product::factory()->create(['status' => ProductStatus::Active]);
        $admin = $this->adminWithPermissions(['products.hide']);

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/products/{$product->id}/status", ['status' => 'inactive'])
            ->assertOk()
            ->assertJsonPath('data.status', 'inactive');

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/products/{$product->id}/status", ['status' => 'active'])
            ->assertOk()
            ->assertJsonPath('data.status', 'active');
    }

    public function test_admin_with_hide_permission_cannot_suspend(): void
    {
        $product = Product::factory()->create(['status' => ProductStatus::Active]);
        $admin = $this->adminWithPermissions(['products.hide']);

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/products/{$product->id}/status", ['status' => 'suspended'])
            ->assertStatus(403);
    }

    public function test_admin_with_hide_permission_cannot_unsuspend(): void
    {
        $product = Product::factory()->suspended()->create();
        $admin = $this->adminWithPermissions(['products.hide']);

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/products/{$product->id}/status", ['status' => 'active'])
            ->assertStatus(403);
    }

    public function test_admin_with_suspend_permission_can_suspend_and_unsuspend(): void
    {
        $product = Product::factory()->create(['status' => ProductStatus::Active]);
        $admin = $this->adminWithPermissions(['products.suspend']);

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/products/{$product->id}/status", ['status' => 'suspended'])
            ->assertOk()
            ->assertJsonPath('data.status', 'suspended');

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/products/{$product->id}/status", ['status' => 'active'])
            ->assertOk()
            ->assertJsonPath('data.status', 'active');
    }

    public function test_invalid_status_value_returns_422(): void
    {
        $product = Product::factory()->create();
        $admin = $this->adminWithPermissions(['products.suspend']);

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/products/{$product->id}/status", ['status' => 'archived'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['status']);
    }

    public function test_admin_can_replace_product_image_on_update(): void
    {
        $product = Product::factory()->create(['image_url' => Storage::disk('public')->url('products/old.jpg')]);
        Storage::disk('public')->put('products/old.jpg', 'fake-old-content');
        $admin = $this->adminWithPermissions(['products.edit']);

        $response = $this->actingAs($admin, 'sanctum')->patch("/api/products/{$product->id}", [
            'image' => UploadedFile::fake()->image('new.jpg', 400, 400),
        ]);

        $response->assertOk();
        Storage::disk('public')->assertMissing('products/old.jpg');
        $this->assertNotNull($response->json('data.image_url'));
    }

    public function test_updating_product_without_image_leaves_existing_image_untouched(): void
    {
        $existingUrl = Storage::disk('public')->url('products/keep.jpg');
        Storage::disk('public')->put('products/keep.jpg', 'fake-content');
        $product = Product::factory()->create(['image_url' => $existingUrl]);
        $admin = $this->adminWithPermissions(['products.edit']);

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/products/{$product->id}", ['name' => 'Renamed'])
            ->assertOk()
            ->assertJsonPath('data.image_url', $existingUrl);

        Storage::disk('public')->assertExists('products/keep.jpg');
    }

    public function test_products_can_be_filtered_by_category_and_status(): void
    {
        $category = Category::factory()->create();
        Product::factory()->create(['category_id' => $category->id, 'status' => ProductStatus::Active]);
        Product::factory()->create(['category_id' => $category->id, 'status' => ProductStatus::Inactive]);
        Product::factory()->create(['status' => ProductStatus::Active]);
        $admin = $this->adminWithPermissions(['products.view']);

        $this->actingAs($admin, 'sanctum')
            ->getJson("/api/products?category_id={$category->id}&status=active")
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_products_can_be_sorted_by_price(): void
    {
        Product::factory()->create(['price' => 50]);
        Product::factory()->create(['price' => 10]);
        Product::factory()->create(['price' => 90]);
        $admin = $this->adminWithPermissions(['products.view']);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/products?sort=price_asc');

        $response->assertOk();
        $prices = collect($response->json('data'))->pluck('price')->all();
        $this->assertEquals([10.0, 50.0, 90.0], $prices);
    }

    public function test_created_by_and_updated_by_are_recorded_and_returned(): void
    {
        $store = Store::factory()->active()->create();
        $owner = $this->ownerFor($store);

        $createResponse = $this->actingAs($owner, 'sanctum')->post('/api/products', $this->validPayload());
        $createResponse->assertStatus(201);
        $productId = $createResponse->json('data.id');

        $createResponse->assertJsonPath('data.created_by.id', $owner->id)
            ->assertJsonPath('data.updated_by.id', $owner->id);

        $admin = $this->adminWithPermissions(['products.edit']);

        $updateResponse = $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/products/{$productId}", ['name' => 'Edited by admin']);

        $updateResponse->assertOk()
            ->assertJsonPath('data.created_by.id', $owner->id)
            ->assertJsonPath('data.updated_by.id', $admin->id);
    }

    public function test_store_cannot_exceed_100_products(): void
    {
        $store = Store::factory()->active()->create();
        Product::factory()->count(100)->create(['store_id' => $store->id]);
        $owner = $this->ownerFor($store);

        $this->actingAs($owner, 'sanctum')
            ->post('/api/products', $this->validPayload(['slug' => 'one-more-product']))
            ->assertStatus(422);

        $this->assertSame(100, Product::query()->where('store_id', $store->id)->count());
    }
}
