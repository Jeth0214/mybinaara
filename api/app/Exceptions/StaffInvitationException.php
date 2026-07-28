<?php

declare(strict_types=1);

namespace App\Exceptions;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class StaffInvitationException extends RuntimeException
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

    public static function alreadyAccepted(): self
    {
        return new self('already_accepted');
    }

    public function render(Request $request): JsonResponse
    {
        [$message, $status] = match ($this->reason) {
            'expired' => ['This invitation link has expired. Please ask an administrator to resend it.', 410],
            'already_accepted' => ['This invitation has already been accepted. Please use the login page instead.', 409],
            default => ['This invitation link is invalid.', 404],
        };

        return response()->json(['message' => $message], $status);
    }
}
