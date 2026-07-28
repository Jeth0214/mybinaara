<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\StaffInvitationException;
use App\Models\StaffInvitationToken;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class StaffInvitationService
{
    /**
     * @return array{user: User, token: string}
     */
    public function accept(string $token, string $newPassword): array
    {
        $tokenRecord = StaffInvitationToken::query()
            ->where('token_hash', hash('sha256', $token))
            ->first();

        if ($tokenRecord === null) {
            throw StaffInvitationException::invalid();
        }

        if ($tokenRecord->expires_at->isPast()) {
            throw StaffInvitationException::expired();
        }

        if ($tokenRecord->accepted_at !== null) {
            throw StaffInvitationException::alreadyAccepted();
        }

        return DB::transaction(function () use ($tokenRecord, $newPassword) {
            $staff = $tokenRecord->user;

            $staff->update(['password' => $newPassword]);
            $tokenRecord->update(['accepted_at' => now()]);

            return [
                'user' => $staff->fresh(['role', 'permissions']),
                'token' => $staff->createToken('staff-invitation')->plainTextToken,
            ];
        });
    }
}
