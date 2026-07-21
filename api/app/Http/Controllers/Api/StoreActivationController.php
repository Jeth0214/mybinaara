<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ActivateStoreRequest;
use App\Http\Resources\StoreResource;
use App\Http\Resources\UserResource;
use App\Services\StoreActivationService;
use Illuminate\Http\JsonResponse;

class StoreActivationController extends Controller
{
    public function __construct(private readonly StoreActivationService $activation) {}

    public function activate(ActivateStoreRequest $request): JsonResponse
    {
        $result = $this->activation->activate(
            $request->string('token')->toString(),
            $request->string('current_password')->toString(),
            $request->string('new_password')->toString(),
        );

        return response()->json([
            'store' => new StoreResource($result['store']),
            'user' => new UserResource($result['user']),
            'token' => $result['token'],
        ]);
    }
}
