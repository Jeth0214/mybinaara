<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\ProductStatus;
use App\Enums\StoreStatus;
use App\Models\CatalogProduct;
use App\Models\Product;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class CatalogProductService
{
    /**
     * By default only catalog products with at least one active store listing are
     * returned — an item added via "Add to catalog" but never actually listed
     * (no price/stock set) has nothing purchasable behind it and shouldn't be
     * surfaced to customers. Pass includeUnlisted=true for the store/admin
     * "search or create" picker, where finding an unlisted item to be the first
     * to list is the whole point.
     *
     * @param  array{search?: string, category_id?: int}  $filters
     */
    public function search(array $filters = [], int $perPage = 20, bool $includeUnlisted = false): LengthAwarePaginator
    {
        return $this->baseQuery()
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where('name', 'like', "%{$search}%"))
            ->when($filters['category_id'] ?? null, fn ($query, $categoryId) => $query->where('category_id', $categoryId))
            ->when(
                !$includeUnlisted,
                fn ($query) => $query->whereHas('products', fn ($q) => $q->where('status', ProductStatus::Active))
            )
            ->orderBy('name')
            ->paginate($perPage);
    }

    public function find(int $id): CatalogProduct
    {
        return $this->baseQuery()->findOrFail($id);
    }

    /**
     * The "Available at" list for a product-detail page: every active listing
     * of this catalog product at an active store, nearest-first. Same
     * Haversine approach as StoreService::nearby(), joined through the
     * listing/store relationship instead of applied directly to stores.
     *
     * @return Collection<int, Product>
     */
    public function listingsNearby(int $catalogProductId, float $lat, float $lng, int $limit = 20): Collection
    {
        $haversine = '(6371 * acos(cos(radians(?)) * cos(radians(stores.latitude)) * cos(radians(stores.longitude) - radians(?)) + sin(radians(?)) * sin(radians(stores.latitude))))';

        return Product::query()
            ->select('products.*')
            ->selectRaw("{$haversine} AS distance_km", [$lat, $lng, $lat])
            ->join('stores', 'stores.id', '=', 'products.store_id')
            ->with('store')
            ->where('products.catalog_product_id', $catalogProductId)
            ->where('products.status', ProductStatus::Active)
            ->where('stores.status', StoreStatus::Active)
            ->whereNotNull('stores.latitude')
            ->whereNotNull('stores.longitude')
            ->orderBy('distance_km')
            ->limit($limit)
            ->get();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, UploadedFile $image, User $actor): CatalogProduct
    {
        unset($data['image']);
        $data['image_url'] = Storage::disk('public')->url($image->store('catalog-products', 'public'));
        $data['created_by'] = $actor->id;

        return CatalogProduct::query()->create($data);
    }

    private function baseQuery(): Builder
    {
        return CatalogProduct::query()
            ->with(['category', 'unit'])
            ->withCount(['products as listings_count' => fn ($q) => $q->where('status', ProductStatus::Active)])
            ->withMin(['products as min_price' => fn ($q) => $q->where('status', ProductStatus::Active)], 'price')
            ->withMax(['products as max_price' => fn ($q) => $q->where('status', ProductStatus::Active)], 'price');
    }
}
