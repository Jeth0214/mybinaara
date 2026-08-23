<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\ProductStatus;
use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Requests\UpdateProductStatusRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductService;
use App\Services\StoreService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(
        private readonly ProductService $products,
        private readonly StoreService $stores,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Product::class);

        $filters = $request->validate([
            'store_id' => ['sometimes', 'integer'],
            'store_name' => ['sometimes', 'string', 'max:150'],
            'category_id' => ['sometimes', 'integer'],
            'unit_id' => ['sometimes', 'integer'],
            'status' => ['sometimes', 'string'],
            'search' => ['sometimes', 'string', 'max:100'],
            'sort' => ['sometimes', 'string', 'in:latest,name,price_asc,price_desc'],
        ]);

        $user = $request->user();

        if (in_array($user->user_type, [UserType::StoreOwner, UserType::VendorStaff], true)) {
            $filters['store_id'] = $this->stores->findForUser($user)?->id;
        }

        $products = $this->products->list($filters);

        return ProductResource::collection($products)->response();
    }

    public function show(Product $product): JsonResponse
    {
        $this->authorize('view', $product);

        $product->load(['store', 'catalogProduct.category', 'catalogProduct.unit', 'creator', 'editor']);

        return (new ProductResource($product))->response();
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $user = $request->user();

        $forcedStoreId = in_array($user->user_type, [UserType::StoreOwner, UserType::VendorStaff], true)
            ? $this->stores->findForUser($user)?->id
            : null;

        $product = $this->products->create($request->validated(), $user, $forcedStoreId);

        return (new ProductResource($product->load(['store', 'catalogProduct.category', 'catalogProduct.unit', 'creator', 'editor'])))->response()->setStatusCode(201);
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $product = $this->products->update($product, $request->validated(), $request->user());

        return (new ProductResource($product->load(['store', 'catalogProduct.category', 'catalogProduct.unit', 'creator', 'editor'])))->response();
    }

    public function destroy(Product $product): JsonResponse
    {
        $this->authorize('delete', $product);

        $this->products->delete($product);

        return response()->json(null, 204);
    }

    public function updateStatus(UpdateProductStatusRequest $request, Product $product): JsonResponse
    {
        $product = $this->products->updateStatus(
            $product,
            $request->enum('status', ProductStatus::class),
            $request->user(),
            $request->input('suspension_reason')
        );

        return (new ProductResource($product->load(['store', 'catalogProduct.category', 'catalogProduct.unit', 'creator', 'editor'])))->response();
    }
}
