<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\StoreStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStoreRequest;
use App\Http\Requests\UpdateStoreAddressRequest;
use App\Http\Requests\UpdateStoreLocationRequest;
use App\Http\Requests\UpdateStoreLogoRequest;
use App\Http\Requests\UpdateStoreRequest;
use App\Http\Requests\UpdateStoreScheduleRequest;
use App\Http\Requests\UpdateStoreStatusRequest;
use App\Http\Resources\StoreResource;
use App\Models\Store;
use App\Services\StoreScheduleService;
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
            'city_id' => ['sometimes', 'integer'],
        ]);

        $stores = $this->stores->list($filters);

        return StoreResource::collection($stores)->response();
    }

    public function show(Store $store): JsonResponse
    {
        $this->authorize('view', $store);

        $store->load(['owners', 'creator', 'schedules']);

        return (new StoreResource($store))->response();
    }

    public function me(Request $request): JsonResponse
    {
        $store = $this->stores->findForUser($request->user());

        abort_if($store === null, 404);

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

    public function updateAddress(UpdateStoreAddressRequest $request, Store $store): JsonResponse
    {
        $store = $this->stores->updateAddress($store, $request->validated());

        return (new StoreResource($store->load(['owners', 'creator'])))->response();
    }

    public function updateLocation(UpdateStoreLocationRequest $request, Store $store): JsonResponse
    {
        $store = $this->stores->updateLocation($store, $request->validated());

        return (new StoreResource($store->load(['owners', 'creator'])))->response();
    }

    public function updateLogo(UpdateStoreLogoRequest $request, Store $store): JsonResponse
    {
        $store = $this->stores->updateLogo($store, $request->file('logo'));

        return (new StoreResource($store->load(['owners', 'creator'])))->response();
    }

    public function updateSchedule(UpdateStoreScheduleRequest $request, Store $store, StoreScheduleService $schedules): JsonResponse
    {
        $schedules->replace($store, $request->validated()['schedule']);

        return (new StoreResource($store->load(['owners', 'creator', 'schedules'])))->response();
    }
}
