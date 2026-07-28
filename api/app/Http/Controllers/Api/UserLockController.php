<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StaffResource;
use App\Models\User;
use App\Services\AccountLockoutService;
use Illuminate\Http\JsonResponse;

class UserLockController extends Controller
{
    public function __construct(private readonly AccountLockoutService $lockout) {}

    public function unlock(User $user): JsonResponse
    {
        $this->authorize('unlock', $user);

        $this->lockout->unlock($user);

        return (new StaffResource($user->fresh(['role', 'permissions'])))->response();
    }
}
