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
    /**
     * @return array{store: Store, user: User, token: string}
     */
    public function activate(string $token, string $currentPassword, string $newPassword): array
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

        if ($owner === null || ! Hash::check($currentPassword, $owner->password)) {
            throw new InvalidCredentialsException;
        }

        return DB::transaction(function () use ($tokenRecord, $store, $owner, $newPassword) {
            $owner->update(['password' => $newPassword]);
            $tokenRecord->update(['verified_at' => now()]);
            $store->update(['is_activated' => true, 'status' => StoreStatus::Active]);

            return [
                'store' => $store->fresh(),
                'user' => $owner->fresh(),
                'token' => $owner->createToken('store-activation')->plainTextToken,
            ];
        });
    }
}
