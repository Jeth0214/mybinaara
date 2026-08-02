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
        if ($user->user_type === UserType::Admin) {
            return $user->hasPermission('stores.view');
        }

        return $this->isOwnerOrStaffOf($user, $store);
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
        return $user->user_type === UserType::Admin && $user->hasPermission('stores.delete');
    }

    public function verify(User $user, Store $store): bool
    {
        return $user->user_type === UserType::Admin && $user->hasPermission('stores.verify');
    }

    public function approve(User $user, Store $store): bool
    {
        return $user->user_type === UserType::Admin && $user->hasPermission('stores.approve');
    }

    public function reject(User $user, Store $store): bool
    {
        return $user->user_type === UserType::Admin && $user->hasPermission('stores.reject');
    }

    public function suspend(User $user, Store $store): bool
    {
        return $user->user_type === UserType::Admin && $user->hasPermission('stores.suspend');
    }

    public function unsuspend(User $user, Store $store): bool
    {
        return $user->user_type === UserType::Admin && $user->hasPermission('stores.suspend');
    }

    public function updateSchedule(User $user, Store $store): bool
    {
        return $this->isAdminEditor($user) || $this->isOwnerOrStaffOf($user, $store);
    }

    public function updateAddress(User $user, Store $store): bool
    {
        return $this->isAdminEditor($user) || $this->isOwnerOrStaffOf($user, $store);
    }

    public function updateLocation(User $user, Store $store): bool
    {
        return $this->isAdminEditor($user) || $this->isOwnerOrStaffOf($user, $store);
    }

    public function updateLogo(User $user, Store $store): bool
    {
        return $this->isAdminEditor($user) || $this->isOwnerOrStaffOf($user, $store);
    }

    private function isAdminEditor(User $user): bool
    {
        return $user->user_type === UserType::Admin && $user->hasPermission('stores.edit');
    }

    private function isOwnerOrStaffOf(User $user, Store $store): bool
    {
        return in_array($user->user_type, [UserType::StoreOwner, UserType::VendorStaff], true)
            && $store->users()->where('users.id', $user->id)->exists();
    }
}
