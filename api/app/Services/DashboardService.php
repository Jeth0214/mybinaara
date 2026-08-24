<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\UserType;
use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    private const STATS_CACHE_TTL_MINUTES = 2;

    /**
     * @return array<string, mixed>
     */
    public function getDashboard(): array
    {
        return [
            'stats' => $this->getStats(),
            'charts' => [
                'storesByCity' => $this->getStoresByCity(),
                'categoryShare' => $this->getCategoryShare(),
                'registrationsOverTime' => $this->getRegistrationsOverTime(),
                'storeStatusDistribution' => $this->getStoreStatusDistribution(),
                'productStatusDistribution' => $this->getProductStatusDistribution(),
            ],
            'recentStores' => $this->getRecentStores(),
            'storeActivity' => $this->getStoreActivity(),
        ];
    }

    /**
     * @return array{activeStores: int, adminUsers: int, catalogProducts: int, categories: int}
     */
    public function getStats(): array
    {
        return Cache::remember('dashboard:stats', now()->addMinutes(self::STATS_CACHE_TTL_MINUTES), fn () => [
            'activeStores' => Store::query()->where('status', 'active')->count(),
            'adminUsers' => User::query()->where('user_type', UserType::Admin)->count(),
            'catalogProducts' => Product::query()->count(),
            'categories' => Category::query()->count(),
        ]);
    }

    /**
     * @return array<int, array{city: string, count: int}>
     */
    public function getStoresByCity(): array
    {
        return Cache::remember('dashboard:stores-by-city', now()->addMinutes(self::STATS_CACHE_TTL_MINUTES), fn () => Store::query()
            ->select('city', DB::raw('count(*) as count'))
            ->whereNotNull('city')
            ->groupBy('city')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($row) => ['city' => $row->city, 'count' => (int) $row->count])
            ->all());
    }

    /**
     * @return array<int, array{name: string, productCount: int}>
     */
    public function getCategoryShare(): array
    {
        return Cache::remember('dashboard:category-share', now()->addMinutes(self::STATS_CACHE_TTL_MINUTES), fn () => Category::query()
            ->withCount('catalogProducts')
            ->orderByDesc('catalog_products_count')
            ->get(['id', 'name'])
            ->map(fn ($category) => ['name' => $category->name, 'productCount' => (int) $category->catalog_products_count])
            ->all());
    }

    /**
     * @return array{stores: array<int, array{date: string, count: int}>, vendors: array<int, array{date: string, count: int}>}
     */
    public function getRegistrationsOverTime(int $days = 30): array
    {
        return Cache::remember("dashboard:registrations:{$days}", now()->addMinutes(self::STATS_CACHE_TTL_MINUTES), function () use ($days) {
            $since = now()->subDays($days)->startOfDay();

            $stores = Store::query()
                ->selectRaw('DATE(created_at) as date, count(*) as count')
                ->where('created_at', '>=', $since)
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->map(fn ($row) => ['date' => $row->date, 'count' => (int) $row->count])
                ->all();

            $vendors = User::query()
                ->selectRaw('DATE(created_at) as date, count(*) as count')
                ->where('user_type', UserType::StoreOwner)
                ->where('created_at', '>=', $since)
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->map(fn ($row) => ['date' => $row->date, 'count' => (int) $row->count])
                ->all();

            return ['stores' => $stores, 'vendors' => $vendors];
        });
    }

    /**
     * @return array<int, array{status: string, count: int}>
     */
    public function getStoreStatusDistribution(): array
    {
        return Cache::remember('dashboard:store-status', now()->addMinutes(self::STATS_CACHE_TTL_MINUTES), fn () => Store::query()
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(fn ($row) => ['status' => $row->status instanceof \BackedEnum ? $row->status->value : $row->status, 'count' => (int) $row->count])
            ->all());
    }

    /**
     * @return array<int, array{status: string, count: int}>
     */
    public function getProductStatusDistribution(): array
    {
        return Cache::remember('dashboard:product-status', now()->addMinutes(self::STATS_CACHE_TTL_MINUTES), fn () => Product::query()
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(fn ($row) => ['status' => $row->status instanceof \BackedEnum ? $row->status->value : $row->status, 'count' => (int) $row->count])
            ->all());
    }

    /**
     * @return Collection<int, Store>
     */
    public function getRecentStores(int $limit = 8): Collection
    {
        return Store::query()
            ->with(['owners:id,name'])
            ->select(['id', 'name', 'city', 'status', 'created_at'])
            ->latest()
            ->limit($limit)
            ->get();
    }

    /**
     * @return Collection<int, ActivityLog>
     */
    public function getStoreActivity(int $limit = 10): Collection
    {
        return ActivityLog::query()
            ->with(['loggable:id,name'])
            ->latest('created_at')
            ->limit($limit)
            ->get();
    }
}
