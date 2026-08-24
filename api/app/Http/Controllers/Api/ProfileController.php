<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateAvatarRequest;
use App\Http\Resources\UserResource;
use App\Services\ProfileService;
use Illuminate\Http\JsonResponse;

class ProfileController extends Controller
{
    public function __construct(private readonly ProfileService $profile) {}

    public function updateAvatar(UpdateAvatarRequest $request): JsonResponse
    {
        $user = $this->profile->updateAvatar($request->user(), $request->file('avatar'));

        return (new UserResource($user))->response();
    }
}
