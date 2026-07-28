<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CategoryService
{
    /**
     * @param  array{is_active?: bool, search?: string}  $filters
     */
    public function list(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return Category::query()
            ->when(array_key_exists('is_active', $filters), fn ($query) => $query->where('is_active', $filters['is_active']))
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate($perPage);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, ?UploadedFile $image = null): Category
    {
        unset($data['image']);

        if ($image) {
            $data['image_url'] = $this->storeImage($image);
        }

        return Category::query()->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Category $category, array $data, ?UploadedFile $image = null): Category
    {
        unset($data['image']);

        if ($image) {
            $this->deleteImage($category->image_url);
            $data['image_url'] = $this->storeImage($image);
        }

        $category->update($data);

        return $category;
    }

    private function storeImage(UploadedFile $image): string
    {
        return Storage::disk('public')->url($image->store('categories', 'public'));
    }

    private function deleteImage(?string $url): void
    {
        if (! $url) {
            return;
        }

        $path = Str::after($url, Storage::disk('public')->url(''));

        if (Str::startsWith($path, 'categories/')) {
            Storage::disk('public')->delete($path);
        }
    }

    public function delete(Category $category): void
    {
        $category->delete();
    }

    public function toggleStatus(Category $category): Category
    {
        $category->update(['is_active' => ! $category->is_active]);

        return $category;
    }
}
