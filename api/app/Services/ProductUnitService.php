<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\UnitInUseException;
use App\Models\ProductUnit;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class ProductUnitService
{
    /**
     * @param  array{is_active?: bool, search?: string}  $filters
     */
    public function list(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return ProductUnit::query()
            ->withCount('products')
            ->when(array_key_exists('is_active', $filters), fn ($query) => $query->where('is_active', $filters['is_active']))
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate($perPage);
    }

    /**
     * @return Collection<int, ProductUnit>
     */
    public function listActive(): Collection
    {
        return ProductUnit::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): ProductUnit
    {
        return ProductUnit::query()->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(ProductUnit $unit, array $data): ProductUnit
    {
        $unit->update($data);

        return $unit;
    }

    public function delete(ProductUnit $unit): void
    {
        if ($unit->products()->exists()) {
            throw new UnitInUseException();
        }

        $unit->delete();
    }
}
