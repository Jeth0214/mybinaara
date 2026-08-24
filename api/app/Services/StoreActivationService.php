<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\StoreStatus;
use App\Exceptions\InvalidCredentialsException;
use App\Exceptions\StoreActivationException;
use App\Models\Store;
use App\Models\StoreActivationToken;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StoreActivationService
{
    public function __construct(private readonly ActivityLogService $activityLogs) {}

    /**
     * Verifies a token/email/temporary-password combination without activating
     * the store, so the frontend can confirm credentials before letting the
     * owner choose a new permanent password.
     */
    public function verify(string $token, string $email, string $currentPassword): Store
    {
        return $this->resolveOwner($token, $email, $currentPassword)['store'];
    }

    /**
     * @return array{store: Store, user: User, token: string}
     */
    public function activate(string $token, string $email, string $currentPassword, string $newPassword): array
    {
        ['tokenRecord' => $tokenRecord, 'store' => $store, 'owner' => $owner] =
            $this->resolveOwner($token, $email, $currentPassword);

        return DB::transaction(function () use ($tokenRecord, $store, $owner, $newPassword) {
            $owner->update(['password' => $newPassword]);
            $tokenRecord->update(['verified_at' => now()]);
            $store->update(['is_activated' => true, 'status' => StoreStatus::Active, 'activated_at' => now()]);

            $this->activityLogs->record($store, 'activation', 'Store activated by owner', $owner);

            return [
                'store' => $store->fresh(),
                'user' => $owner->fresh(),
                'token' => $owner->createToken('store-activation')->plainTextToken,
            ];
        });
    }

    /**
     * @return array{store: Store, tokenRecord: StoreActivationToken, owner: User}
     */
    private function resolveOwner(string $token, string $email, string $currentPassword): array
    {
        $tokenRecord = StoreActivationToken::query()
            ->where('token_hash', hash('sha256', $token))
            ->first();

        if ($tokenRecord === null) {
            throw StoreActivationException::invalid();
        }

        if ($tokenRecord->expires_at->isPast()) {
            throw StoreActivationException::expired();
        }

        $store = $tokenRecord->store;

        if ($tokenRecord->verified_at !== null || $store->is_activated) {
            throw StoreActivationException::alreadyActivated();
        }

        if (in_array($store->status, [StoreStatus::Suspended, StoreStatus::Rejected], true)) {
            throw StoreActivationException::notEligible();
        }

        $owner = $store->owners()->first();

        if ($owner === null || strcasecmp($owner->email, $email) !== 0 || ! Hash::check($currentPassword, $owner->password)) {
            throw new InvalidCredentialsException;
        }

        return ['store' => $store, 'tokenRecord' => $tokenRecord, 'owner' => $owner];
    }
}
