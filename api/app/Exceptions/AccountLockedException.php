<?php

declare(strict_types=1);

namespace App\Exceptions;

use Carbon\CarbonInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class AccountLockedException extends RuntimeException
{
    private function __construct(
        private readonly string $reason,
        private readonly ?CarbonInterface $lockedUntil = null,
    ) {
        parent::__construct();
    }

    public static function until(CarbonInterface $lockedUntil): self
    {
        return new self('timed', $lockedUntil);
    }

    public static function pendingReview(): self
    {
        return new self('pending_review');
    }

    public function render(Request $request): JsonResponse
    {
        if ($this->reason === 'pending_review') {
            return response()->json([
                'message' => 'Your account has been locked due to repeated failed login attempts and requires administrator review. Please contact support.',
            ], 403);
        }

        return response()->json([
            'message' => "Your account is temporarily locked due to multiple failed login attempts. Please try again after {$this->lockedUntil->diffForHumans(now(), CarbonInterface::DIFF_ABSOLUTE)}.",
            'locked_until' => $this->lockedUntil->toIso8601String(),
        ], 403);
    }
}
