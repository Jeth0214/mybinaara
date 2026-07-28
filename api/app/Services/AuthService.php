<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\StoreStatus;
use App\Enums\UserStatus;
use App\Enums\UserType;
use App\Exceptions\AccountInactiveException;
use App\Exceptions\AccountLockedException;
use App\Exceptions\InvalidCredentialsException;
use App\Exceptions\StoreAccountNotActiveException;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function __construct(private readonly AccountLockoutService $lockout) {}

    /**
     * @return array{user: User, token: string}
     */
    public function attemptLogin(string $email, string $password, string $deviceName): array
    {
        $user = User::query()->with(['role', 'permissions', 'stores'])->where('email', $email)->first();

        if ($user === null) {
            throw new InvalidCredentialsException;
        }

        if ($user->requires_admin_unlock) {
            throw AccountLockedException::pendingReview();
        }

        if ($user->locked_until?->isFuture()) {
            throw AccountLockedException::until($user->locked_until);
        }

        if (! Hash::check($password, $user->password)) {
            $this->lockout->registerFailedAttempt($user);

            if ($user->requires_admin_unlock) {
                throw AccountLockedException::pendingReview();
            }

            if ($user->locked_until !== null) {
                throw AccountLockedException::until($user->locked_until);
            }

            throw new InvalidCredentialsException($this->lockout->attemptsRemaining($user));
        }

        $this->lockout->resetOnSuccess($user);

        if ($user->status !== UserStatus::Active) {
            throw new AccountInactiveException;
        }

        if (in_array($user->user_type, [UserType::StoreOwner, UserType::VendorStaff], true)) {
            $store = $user->stores->first();

            if ($store === null || $store->status !== StoreStatus::Active) {
                throw new StoreAccountNotActiveException($store?->status ?? StoreStatus::Pending);
            }
        }

        $user->forceFill(['last_login_at' => now()])->save();

        return [
            'user' => $user,
            'token' => $user->createToken($deviceName)->plainTextToken,
        ];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }
}
