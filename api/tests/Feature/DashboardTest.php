<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\CatalogProduct;
use App\Models\Category;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class, PermissionSeeder::class, RolePermissionSeeder::class]);
    }

    public function test_guest_cannot_access_dashboard(): void
    {
        $this->getJson('/api/dashboard')->assertStatus(401);
    }

    public function test_staff_without_permission_is_forbidden(): void
    {
        $staff = User::factory()->admin()->withRole('staff')->create();

        $this->actingAs($staff)->getJson('/api/dashboard')->assertStatus(403);
    }

    public function test_administrator_can_view_dashboard(): void
    {
        $administrator = User::factory()->admin()->create();

        Store::factory()->active()->create(['city' => 'Riyadh']);
        Store::factory()->active()->create(['city' => 'Riyadh']);
        Store::factory()->create(['status' => 'pending', 'city' => 'Jeddah']);

        $category = Category::factory()->create();
        Product::factory()->create(['catalog_product_id' => CatalogProduct::factory()->create(['category_id' => $category->id])]);
        Product::factory()->create(['catalog_product_id' => CatalogProduct::factory()->create(['category_id' => $category->id])]);

        $response = $this->actingAs($administrator)->getJson('/api/dashboard');

        $response->assertOk();
        $response->assertJsonStructure([
            'data' => [
                'stats' => ['activeStores', 'adminUsers', 'catalogProducts', 'categories'],
                'charts' => [
                    'storesByCity',
                    'categoryShare',
                    'registrationsOverTime' => ['stores', 'vendors'],
                    'storeStatusDistribution',
                    'productStatusDistribution',
                ],
                'recentStores',
                'storeActivity',
            ],
        ]);

        $response->assertJsonPath('data.stats.activeStores', 2);
        $response->assertJsonPath('data.stats.catalogProducts', 2);
        $response->assertJsonPath('data.stats.categories', 1);
    }

    public function test_recent_stores_are_ordered_latest_first_and_limited(): void
    {
        $administrator = User::factory()->admin()->create();

        Store::factory()->create(['name' => 'Older Store', 'created_at' => now()->subDays(2)]);
        Store::factory()->create(['name' => 'Newer Store', 'created_at' => now()->subDay()]);

        $response = $this->actingAs($administrator)->getJson('/api/dashboard');

        $response->assertJsonPath('data.recentStores.0.businessName', 'Newer Store');
        $response->assertJsonPath('data.recentStores.1.businessName', 'Older Store');
    }

    public function test_store_registration_and_activation_are_logged_as_activity(): void
    {
        $administrator = User::factory()->admin()->create();
        $creator = User::factory()->admin()->create();

        $store = app(\App\Services\StoreService::class)->create([
            'name' => 'Al Riyadh Hardware',
            'cr_number' => '1234567890',
            'vat_number' => '123456789012345',
            'owner_name' => 'Faisal Al-Otaibi',
            'owner_email' => 'faisal@example.com',
            'owner_phone' => '+966512345678',
            'schedule' => collect(['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'])->map(fn ($day) => [
                'day' => $day,
                'open_time' => '08:00 AM',
                'close_time' => '10:00 PM',
                'is_off' => false,
            ])->all(),
        ], $creator);

        $response = $this->actingAs($administrator)->getJson('/api/dashboard');

        $response->assertJsonPath('data.storeActivity.0.storeName', $store->name);
        $response->assertJsonPath('data.storeActivity.0.type', 'registration');
        $response->assertJsonPath('data.storeActivity.0.icon', 'bi-shop');
    }
}
