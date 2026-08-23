<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Enums\UserType;
use App\Models\CatalogProduct;
use App\Models\Category;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use App\Services\DashboardService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_get_stats_counts_active_stores_admins_products_and_categories(): void
    {
        Store::factory()->active()->create();
        Store::factory()->active()->create();
        Store::factory()->create(['status' => 'pending']);

        User::factory()->create(['user_type' => UserType::Admin]);

        $category = Category::factory()->create();
        Product::factory()->create(['catalog_product_id' => CatalogProduct::factory()->create(['category_id' => $category->id])]);

        $stats = app(DashboardService::class)->getStats();

        $this->assertSame(2, $stats['activeStores']);
        $this->assertSame(1, $stats['adminUsers']);
        $this->assertSame(1, $stats['catalogProducts']);
        $this->assertSame(1, $stats['categories']);
    }

    public function test_get_stores_by_city_groups_and_sorts_descending(): void
    {
        Store::factory()->create(['city' => 'Riyadh']);
        Store::factory()->create(['city' => 'Riyadh']);
        Store::factory()->create(['city' => 'Jeddah']);

        $result = app(DashboardService::class)->getStoresByCity();

        $this->assertSame(['city' => 'Riyadh', 'count' => 2], $result[0]);
        $this->assertSame(['city' => 'Jeddah', 'count' => 1], $result[1]);
    }

    public function test_get_category_share_counts_products_per_category(): void
    {
        $withProducts = Category::factory()->create(['name' => 'Tools']);
        $withoutProducts = Category::factory()->create(['name' => 'Empty']);

        CatalogProduct::factory()->count(3)->create(['category_id' => $withProducts->id]);

        $result = app(DashboardService::class)->getCategoryShare();

        $this->assertSame(['name' => 'Tools', 'productCount' => 3], $result[0]);
        $this->assertSame(['name' => 'Empty', 'productCount' => 0], $result[1]);
    }

    public function test_get_store_status_distribution_groups_by_status(): void
    {
        Store::factory()->active()->create();
        Store::factory()->suspended()->create();

        $result = app(DashboardService::class)->getStoreStatusDistribution();

        $statuses = collect($result)->pluck('count', 'status');

        $this->assertSame(1, $statuses['active']);
        $this->assertSame(1, $statuses['suspended']);
    }
}
