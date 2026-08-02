<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreateStaffRequest;
use App\Http\Requests\UpdateStaffRequest;
use App\Http\Requests\UpdateStaffStatusRequest;
use App\Http\Resources\StaffResource;
use App\Models\User;
use App\Services\StaffService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StaffController extends Controller
{
    public function __construct(private readonly StaffService $staff) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $filters = $request->validate([
            'search' => ['sometimes', 'string', 'max:100'],
            'role' => ['sometimes', Rule::in(['administrator', 'staff'])],
            'status' => ['sometimes', Rule::in(['active', 'inactive'])],
        ]);

        $staff = $this->staff->list($filters);

        return StaffResource::collection($staff)->response();
    }

    public function show(User $staff): JsonResponse
    {
        $this->authorize('view', $staff);

        $staff->load(['role', 'permissions']);

        return (new StaffResource($staff))->response();
    }

    public function store(CreateStaffRequest $request): JsonResponse
    {
        $staff = $this->staff->create($request->validated());

        return (new StaffResource($staff))->response()->setStatusCode(201);
    }

    public function update(UpdateStaffRequest $request, User $staff): JsonResponse
    {
        $staff = $this->staff->update($staff, $request->validated());

        return (new StaffResource($staff))->response();
    }

    public function updateStatus(UpdateStaffStatusRequest $request, User $staff): JsonResponse
    {
        $staff = $this->staff->updateStatus($staff, $request->enum('status', UserStatus::class));

        return (new StaffResource($staff->load(['role', 'permissions'])))->response();
    }

    public function destroy(User $staff): JsonResponse
    {
        $this->authorize('delete', $staff);

        $this->staff->delete($staff);

        return response()->json(null, 204);
    }
}
