<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\ProductStatus;
use App\Exceptions\ProductLimitExceededException;
use App\Models\Product;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductService
{
    private const MAX_PRODUCTS_PER_STORE = 100;

    private const LOW_STOCK_THRESHOLD = 10;

    /**
     * @param  array{store_id?: int, store_name?: string, category_id?: int, unit_id?: int, status?: string, search?: string, sort?: string}  $filters
     */
    public function list(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $sort = $filters['sort'] ?? 'latest';

        return Product::query()
            ->with(['store', 'category', 'unit', 'creator', 'editor'])
            ->when($filters['store_id'] ?? null, fn ($query, $storeId) => $query->where('store_id', $storeId))
            ->when(
                $filters['store_name'] ?? null,
                fn ($query, $storeName) => $query->whereHas('store', fn ($q) => $q->where('name', 'like', "%{$storeName}%"))
            )
            ->when($filters['category_id'] ?? null, fn ($query, $categoryId) => $query->where('category_id', $categoryId))
            ->when($filters['unit_id'] ?? null, fn ($query, $unitId) => $query->where('unit_id', $unitId))
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where('name', 'like', "%{$search}%"))
            ->when($sort === 'name', fn ($query) => $query->orderBy('name'))
            ->when($sort === 'price_asc', fn ($query) => $query->orderBy('price'))
            ->when($sort === 'price_desc', fn ($query) => $query->orderByDesc('price'))
            ->when($sort === 'latest', fn ($query) => $query->latest())
            ->paginate($perPage);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, UploadedFile $image, User $actor, ?int $forcedStoreId = null): Product
    {
        if ($forcedStoreId !== null) {
            $data['store_id'] = $forcedStoreId;
        }

        if (Product::query()->where('store_id', $data['store_id'])->count() >= self::MAX_PRODUCTS_PER_STORE) {
            throw new ProductLimitExceededException();
        }

        unset($data['image']);
        $data['image_url'] = $this->storeImage($image);
        $data['created_by'] = $actor->id;
        $data['updated_by'] = $actor->id;

        return Product::query()->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Product $product, array $data, User $actor, ?UploadedFile $image = null): Product
    {
        unset($data['image']);

        if ($image) {
            $this->deleteImage($product->image_url);
            $data['image_url'] = $this->storeImage($image);
        }

        $data['updated_by'] = $actor->id;

        $product->update($data);

        return $product;
    }

    public function updateStatus(Product $product, ProductStatus $status, User $actor, ?string $reason = null): Product
    {
        $product->update([
            'status' => $status,
            // Cleared whenever the product isn't Suspended, so a reactivated
            // product doesn't keep showing a stale suspension reason.
            'suspension_reason' => $status === ProductStatus::Suspended ? $reason : null,
            'updated_by' => $actor->id,
        ]);

        return $product;
    }

    public function delete(Product $product): void
    {
        $product->delete();
    }

    /**
     * Stat-tile and chart data for a single store's dashboard. Aggregated in
     * SQL rather than loaded row-by-row, so it stays accurate (and cheap)
     * regardless of how many products the store has.
     *
     * @return array{
     *     total: int, limit: int, remaining: int,
     *     in_stock: int, low_stock: int, out_of_stock: int,
     *     active: int, suspended: int,
     *     by_category: array<int, array{name: string, count: int}>,
     *     added_over_time: array<int, array{date: string, count: int}>,
     * }
     */
    public function getStoreStats(int $storeId): array
    {
        $counts = Product::query()
            ->where('store_id', $storeId)
            ->selectRaw(
                'count(*) as total, '.
                'sum(case when stock_quantity = 0 then 1 else 0 end) as out_of_stock, '.
                'sum(case when stock_quantity > 0 and stock_quantity <= ? then 1 else 0 end) as low_stock, '.
                'sum(case when stock_quantity > ? then 1 else 0 end) as in_stock, '.
                'sum(case when status = ? then 1 else 0 end) as active, '.
                'sum(case when status = ? then 1 else 0 end) as suspended',
                [
                    self::LOW_STOCK_THRESHOLD,
                    self::LOW_STOCK_THRESHOLD,
                    ProductStatus::Active->value,
                    ProductStatus::Suspended->value,
                ]
            )
            ->first();

        $total = (int) $counts->total;

        $byCategory = Product::query()
            ->where('store_id', $storeId)
            ->join('categories', 'categories.id', '=', 'products.category_id')
            ->select('categories.name')
            ->selectRaw('count(*) as count')
            ->groupBy('categories.name')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($row) => ['name' => $row->name, 'count' => (int) $row->count])
            ->all();

        $addedOverTime = Product::query()
            ->where('store_id', $storeId)
            ->where('created_at', '>=', now()->subDays(30)->startOfDay())
            ->selectRaw('DATE(created_at) as date')
            ->selectRaw('count(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($row) => ['date' => $row->date, 'count' => (int) $row->count])
            ->all();

        return [
            'total' => $total,
            'limit' => self::MAX_PRODUCTS_PER_STORE,
            'remaining' => max(self::MAX_PRODUCTS_PER_STORE - $total, 0),
            'in_stock' => (int) $counts->in_stock,
            'low_stock' => (int) $counts->low_stock,
            'out_of_stock' => (int) $counts->out_of_stock,
            'active' => (int) $counts->active,
            'suspended' => (int) $counts->suspended,
            'by_category' => $byCategory,
            'added_over_time' => $addedOverTime,
        ];
    }

    private function storeImage(UploadedFile $image): string
    {
        return Storage::disk('public')->url($image->store('products', 'public'));
    }

    private function deleteImage(?string $url): void
    {
        if (! $url) {
            return;
        }

        $path = Str::after($url, Storage::disk('public')->url(''));

        if (Str::startsWith($path, 'products/')) {
            Storage::disk('public')->delete($path);
        }
    }
}
