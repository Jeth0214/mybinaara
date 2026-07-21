<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\StoreStatus;
use App\Enums\UserStatus;
use App\Enums\UserType;
use App\Exceptions\AccountSuspendedException;
use App\Exceptions\InvalidCredentialsException;
use App\Exceptions\StoreAccountNotActiveException;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    /**
     * @return array{user: User, token: string}
     */
    public function attemptLogin(string $email, string $password, string $deviceName): array
    {
        $user = User::query()->with(['role.permissions', 'stores'])->where('email', $email)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            throw new InvalidCredentialsException;
        }

        if ($user->status === UserStatus::Suspended) {
            throw new AccountSuspendedException;
        }

        if (in_array($user->user_type, [UserType::StoreOwner, UserType::StoreStaff], true)) {
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
