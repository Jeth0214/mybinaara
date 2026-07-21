<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\StoreStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStoreRequest;
use App\Http\Requests\UpdateStoreRequest;
use App\Http\Requests\UpdateStoreStatusRequest;
use App\Http\Resources\StoreResource;
use App\Models\Store;
use App\Services\StoreService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoreController extends Controller
{
    public function __construct(private readonly StoreService $stores) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Store::class);

        $filters = $request->validate([
            'status' => ['sometimes', 'string'],
            'search' => ['sometimes', 'string', 'max:100'],
        ]);

        $stores = $this->stores->list($filters);

        return StoreResource::collection($stores)->response();
    }

    public function show(Store $store): JsonResponse
    {
        $this->authorize('view', $store);

        $store->load(['owners', 'creator']);

        return (new StoreResource($store))->response();
    }

    public function store(StoreStoreRequest $request): JsonResponse
    {
        $store = $this->stores->create($request->validated(), $request->user());

        return (new StoreResource($store))->response()->setStatusCode(201);
    }

    public function update(UpdateStoreRequest $request, Store $store): JsonResponse
    {
        $store = $this->stores->update($store, $request->validated());

        return (new StoreResource($store->load(['owners', 'creator'])))->response();
    }

    public function destroy(Store $store): JsonResponse
    {
        $this->authorize('delete', $store);

        $this->stores->delete($store);

        return response()->json(null, 204);
    }

    public function updateStatus(UpdateStoreStatusRequest $request, Store $store): JsonResponse
    {
        $store = $this->stores->updateStatus(
            $store,
            $request->enum('status', StoreStatus::class),
            $request->input('rejection_reason'),
        );

        return (new StoreResource($store->load(['owners', 'creator'])))->response();
    }
}
