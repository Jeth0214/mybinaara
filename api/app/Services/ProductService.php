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

    /**
     * @param  array{store_id?: int, category_id?: int, unit_id?: int, status?: string, search?: string, sort?: string}  $filters
     */
    public function list(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $sort = $filters['sort'] ?? 'latest';

        return Product::query()
            ->with(['store', 'category', 'unit', 'creator', 'editor'])
            ->when($filters['store_id'] ?? null, fn ($query, $storeId) => $query->where('store_id', $storeId))
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

    public function updateStatus(Product $product, ProductStatus $status, User $actor): Product
    {
        $product->update([
            'status' => $status,
            'updated_by' => $actor->id,
        ]);

        return $product;
    }

    public function delete(Product $product): void
    {
        $product->delete();
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
