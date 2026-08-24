<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;

class AccountLockoutService
{
    public function isLocked(User $user): bool
    {
        return $user->requires_admin_unlock || ($user->locked_until?->isFuture() ?? false);
    }

    public function registerFailedAttempt(User $user): void
    {
        $attempts = $user->failed_login_attempts + 1;

        // Each tier fires exactly once, at the attempt count that crosses it —
        // not on every subsequent attempt past that count (attempt #4, after the
        // #3 lock has expired, is a normal failure, not a fresh 15-minute lock).
        $lockedUntil = match (true) {
            $attempts >= 10 => null,
            $attempts === 5 => now()->addHour(),
            $attempts === 3 => now()->addMinutes(15),
            default => null,
        };
        $requiresAdminUnlock = $attempts >= 10;

        $user->forceFill([
            'failed_login_attempts' => $attempts,
            'locked_until' => $lockedUntil,
            'requires_admin_unlock' => $requiresAdminUnlock,
        ])->save();
    }

    public function resetOnSuccess(User $user): void
    {
        if ($user->failed_login_attempts === 0 && $user->locked_until === null) {
            return;
        }

        $user->forceFill([
            'failed_login_attempts' => 0,
            'locked_until' => null,
        ])->save();
    }

    public function unlock(User $user): void
    {
        $user->forceFill([
            'failed_login_attempts' => 0,
            'locked_until' => null,
            'requires_admin_unlock' => false,
        ])->save();
    }

    /**
     * How many more failed attempts until the next lockout tier, given the
     * user's current (already-incremented) attempt count.
     */
    public function attemptsRemaining(User $user): int
    {
        $attempts = $user->failed_login_attempts;

        $nextThreshold = match (true) {
            $attempts < 3 => 3,
            $attempts < 5 => 5,
            default => 10,
        };

        return max($nextThreshold - $attempts, 0);
    }
}
