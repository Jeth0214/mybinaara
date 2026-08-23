<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCatalogProductRequest;
use App\Http\Resources\CatalogProductResource;
use App\Http\Resources\ProductListingResource;
use App\Models\CatalogProduct;
use App\Services\CatalogProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CatalogProductController extends Controller
{
    public function __construct(private readonly CatalogProductService $catalogProducts) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'search' => ['sometimes', 'string', 'max:100'],
            'category_id' => ['sometimes', 'integer'],
            'include_unlisted' => ['sometimes'],
        ]);

        // The route is public (customer browsing), but requesting unlisted
        // (0-store) catalog items is only honored for callers who could
        // actually list one — an unauthenticated guest passing the flag is
        // silently treated the same as not passing it at all.
        $includeUnlisted = $request->boolean('include_unlisted')
            && ($request->user('sanctum')?->can('create', CatalogProduct::class) ?? false);

        $products = $this->catalogProducts->search($filters, includeUnlisted: $includeUnlisted);

        return CatalogProductResource::collection($products)->response();
    }

    public function show(CatalogProduct $catalogProduct): JsonResponse
    {
        return (new CatalogProductResource($this->catalogProducts->find($catalogProduct->id)))->response();
    }

    public function listings(CatalogProduct $catalogProduct, Request $request): JsonResponse
    {
        $filters = $request->validate([
            'lat' => ['required', 'numeric', 'between:-90,90'],
            'lng' => ['required', 'numeric', 'between:-180,180'],
            'limit' => ['sometimes', 'integer', 'min:1', 'max:50'],
        ]);

        $listings = $this->catalogProducts->listingsNearby(
            $catalogProduct->id,
            (float) $filters['lat'],
            (float) $filters['lng'],
            (int) ($filters['limit'] ?? 20)
        );

        return ProductListingResource::collection($listings)->response();
    }

    public function store(StoreCatalogProductRequest $request): JsonResponse
    {
        $catalogProduct = $this->catalogProducts->create($request->validated(), $request->file('image'), $request->user());

        return (new CatalogProductResource($catalogProduct->load(['category', 'unit'])))->response()->setStatusCode(201);
    }
}
