<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Enums\ProductStatus;
use App\Enums\StoreUserRole;
use App\Enums\UserType;
use App\Models\CatalogProduct;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogProductTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class, PermissionSeeder::class, RolePermissionSeeder::class]);
    }

    private function ownerFor(Store $store): User
    {
        $owner = User::factory()->create(['user_type' => UserType::StoreOwner]);
        $store->users()->attach($owner->id, ['role' => StoreUserRole::Owner->value]);

        return $owner;
    }

    public function test_guest_search_excludes_unlisted_catalog_products(): void
    {
        $listed = CatalogProduct::factory()->create(['name' => 'Listed Widget']);
        Product::factory()->create(['catalog_product_id' => $listed->id, 'status' => ProductStatus::Active]);

        CatalogProduct::factory()->create(['name' => 'Unlisted Widget']);

        $response = $this->getJson('/api/catalog-products');

        $response->assertOk();
        $names = collect($response->json('data'))->pluck('name');
        $this->assertTrue($names->contains('Listed Widget'));
        $this->assertFalse($names->contains('Unlisted Widget'));
    }

    public function test_guest_cannot_force_unlisted_catalog_products_via_query_param(): void
    {
        CatalogProduct::factory()->create(['name' => 'Unlisted Widget']);

        $response = $this->getJson('/api/catalog-products?include_unlisted=1');

        $response->assertOk();
        $names = collect($response->json('data'))->pluck('name');
        $this->assertFalse($names->contains('Unlisted Widget'));
    }

    public function test_store_owner_can_see_unlisted_catalog_products_via_query_param(): void
    {
        $store = Store::factory()->active()->create();
        $owner = $this->ownerFor($store);

        CatalogProduct::factory()->create(['name' => 'Unlisted Widget']);

        $response = $this->actingAs($owner, 'sanctum')
            ->getJson('/api/catalog-products?include_unlisted=1');

        $response->assertOk();
        $names = collect($response->json('data'))->pluck('name');
        $this->assertTrue($names->contains('Unlisted Widget'));
    }
}
