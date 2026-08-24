<?php

declare(strict_types=1);

namespace App\Observers;

use App\Enums\UserStatus;
use App\Models\User;

class UserObserver
{
    public function updated(User $user): void
    {
        if ($user->wasChanged('status') && $user->status === UserStatus::Inactive) {
            $user->tokens()->delete();
        }
    }
}
