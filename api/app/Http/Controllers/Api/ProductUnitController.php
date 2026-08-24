<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductUnitRequest;
use App\Http\Requests\UpdateProductUnitRequest;
use App\Http\Resources\ProductUnitResource;
use App\Models\ProductUnit;
use App\Services\ProductUnitService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductUnitController extends Controller
{
    public function __construct(private readonly ProductUnitService $units) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'is_active' => ['sometimes', 'boolean'],
            'search' => ['sometimes', 'string', 'max:100'],
        ]);

        $units = $this->units->list($filters);

        return ProductUnitResource::collection($units)->response();
    }

    public function active(): JsonResponse
    {
        $units = $this->units->listActive();

        return ProductUnitResource::collection($units)->response();
    }

    public function show(ProductUnit $product_unit): JsonResponse
    {
        return (new ProductUnitResource($product_unit))->response();
    }

    public function store(StoreProductUnitRequest $request): JsonResponse
    {
        $unit = $this->units->create($request->validated());

        return (new ProductUnitResource($unit))->response()->setStatusCode(201);
    }

    public function update(UpdateProductUnitRequest $request, ProductUnit $product_unit): JsonResponse
    {
        $unit = $this->units->update($product_unit, $request->validated());

        return (new ProductUnitResource($unit))->response();
    }

    public function destroy(ProductUnit $product_unit): JsonResponse
    {
        $this->authorize('delete', $product_unit);

        $this->units->delete($product_unit);

        return response()->json(null, 204);
    }
}
