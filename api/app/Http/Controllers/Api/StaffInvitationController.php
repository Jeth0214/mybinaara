<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AcceptStaffInvitationRequest;
use App\Http\Resources\UserResource;
use App\Services\StaffInvitationService;
use Illuminate\Http\JsonResponse;

class StaffInvitationController extends Controller
{
    public function __construct(private readonly StaffInvitationService $invitations) {}

    public function accept(AcceptStaffInvitationRequest $request): JsonResponse
    {
        $result = $this->invitations->accept(
            $request->string('token')->toString(),
            $request->string('new_password')->toString(),
        );

        return response()->json([
            'user' => new UserResource($result['user']),
            'token' => $result['token'],
        ]);
    }
}
