<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Services\PasswordResetService;
use Illuminate\Http\JsonResponse;

class PasswordResetController extends Controller
{
    public function __construct(private readonly PasswordResetService $passwordReset) {}

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $this->passwordReset->requestReset($request->string('email')->toString());

        return response()->json([
            'message' => 'If an account exists for that email, a password reset link has been sent.',
        ]);
    }

    public function reset(ResetPasswordRequest $request): JsonResponse
    {
        $this->passwordReset->resetPassword(
            $request->string('token')->toString(),
            $request->string('email')->toString(),
            $request->string('password')->toString(),
        );

        return response()->json([
            'message' => 'Your password has been reset. Please sign in.',
        ]);
    }
}
