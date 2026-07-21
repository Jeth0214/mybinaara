<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\UserType;
use App\Models\Store;
use App\Models\User;

class StorePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->user_type === UserType::Admin && $user->hasPermission('stores.view');
    }

    public function view(User $user, Store $store): bool
    {
        return $user->user_type === UserType::Admin && $user->hasPermission('stores.view');
    }

    public function create(User $user): bool
    {
        return $user->user_type === UserType::Admin && $user->hasPermission('stores.create');
    }

    public function update(User $user, Store $store): bool
    {
        return $user->user_type === UserType::Admin && $user->hasPermission('stores.edit');
    }

    public function delete(User $user, Store $store): bool
    {
        return $user->user_type === UserType::Admin && $user->hasPermission('stores.edit');
    }

    public function verify(User $user, Store $store): bool
    {
        return $user->user_type === UserType::Admin && $user->hasPermission('stores.verify');
    }
}
