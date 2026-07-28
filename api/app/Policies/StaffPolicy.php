<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\UserType;
use App\Models\User;

class StaffPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->user_type === UserType::Admin && $user->hasPermission('staff.view');
    }

    public function view(User $user, User $staff): bool
    {
        return $user->user_type === UserType::Admin && $user->hasPermission('staff.view');
    }

    public function create(User $user): bool
    {
        return $user->user_type === UserType::Admin && $user->hasPermission('staff.create');
    }

    public function update(User $user, User $staff): bool
    {
        return $user->user_type === UserType::Admin && $user->hasPermission('staff.edit');
    }

    public function delete(User $user, User $staff): bool
    {
        return $user->user_type === UserType::Admin && $user->hasPermission('staff.delete');
    }

    public function unlock(User $user, User $target): bool
    {
        return $user->user_type === UserType::Admin && $user->hasPermission('users.manage');
    }
}
