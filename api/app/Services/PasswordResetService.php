<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\InvalidCredentialsException;
use App\Exceptions\PasswordResetException;
use App\Mail\PasswordResetMail;
use App\Models\User;
use App\Models\UserPasswordResetToken;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class PasswordResetService
{
    /**
     * Silently no-ops for an unknown email so the caller can always return
     * the same generic success response, regardless of whether the account exists.
     */
    public function requestReset(string $email): void
    {
        $user = User::query()->where('email', $email)->first();

        if ($user === null) {
            return;
        }

        UserPasswordResetToken::query()
            ->where('user_id', $user->id)
            ->whereNull('used_at')
            ->delete();

        $rawToken = Str::random(64);
        $expiresAt = now()->addMinutes(60);

        UserPasswordResetToken::query()->create([
            'user_id' => $user->id,
            'token_hash' => hash('sha256', $rawToken),
            'expires_at' => $expiresAt,
        ]);

        $resetUrl = rtrim((string) config('services.store_web_url'), '/')
            .'/reset-password?token='.$rawToken.'&email='.urlencode($user->email);

        Mail::to($user->email)->send(new PasswordResetMail($user, $resetUrl, $expiresAt));
    }

    public function resetPassword(string $token, string $email, string $newPassword): void
    {
        $tokenRecord = UserPasswordResetToken::query()
            ->where('token_hash', hash('sha256', $token))
            ->first();

        if ($tokenRecord === null) {
            throw PasswordResetException::invalid();
        }

        if ($tokenRecord->expires_at->isPast()) {
            throw PasswordResetException::expired();
        }

        if ($tokenRecord->used_at !== null) {
            throw PasswordResetException::alreadyUsed();
        }

        $user = $tokenRecord->user;

        if ($user === null || strcasecmp($user->email, $email) !== 0) {
            throw new InvalidCredentialsException;
        }

        DB::transaction(function () use ($tokenRecord, $user, $newPassword) {
            $user->update(['password' => $newPassword]);
            $tokenRecord->update(['used_at' => now()]);
            $user->tokens()->delete();
        });
    }
}
