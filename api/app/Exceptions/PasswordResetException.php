<?php

declare(strict_types=1);

namespace App\Exceptions;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class PasswordResetException extends RuntimeException
{
    public function __construct(private readonly string $reason)
    {
        parent::__construct();
    }

    public static function invalid(): self
    {
        return new self('invalid');
    }

    public static function expired(): self
    {
        return new self('expired');
    }

    public static function alreadyUsed(): self
    {
        return new self('already_used');
    }

    public function render(Request $request): JsonResponse
    {
        [$message, $status] = match ($this->reason) {
            'expired' => ['This password reset link has expired. Please request a new one.', 410],
            'already_used' => ['This password reset link has already been used. Please request a new one.', 409],
            default => ['This password reset link is invalid.', 404],
        };

        return response()->json(['message' => $message], $status);
    }
}
