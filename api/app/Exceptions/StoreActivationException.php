<?php

declare(strict_types=1);

namespace App\Exceptions;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class StoreActivationException extends RuntimeException
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

    public static function alreadyActivated(): self
    {
        return new self('already_activated');
    }

    public static function notEligible(): self
    {
        return new self('not_eligible');
    }

    public function render(Request $request): JsonResponse
    {
        [$message, $status] = match ($this->reason) {
            'expired' => ['This activation link has expired. Please contact support for a new one.', 410],
            'already_activated' => ['This account has already been activated. Please use the login page instead.', 409],
            'not_eligible' => ['This store account is no longer eligible for activation. Please contact support.', 403],
            default => ['This activation link is invalid.', 404],
        };

        return response()->json(['message' => $message], $status);
    }
}
