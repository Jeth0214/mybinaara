<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\ProductStatus;
use App\Enums\UserType;
use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    public function viewAny(User $user): bool
    {
        if ($user->user_type === UserType::Admin) {
            return $user->hasPermission('products.view');
        }

        return in_array($user->user_type, [UserType::StoreOwner, UserType::VendorStaff], true);
    }

    public function view(User $user, Product $product): bool
    {
        if ($user->user_type === UserType::Admin) {
            return $user->hasPermission('products.view');
        }

        return $this->isOwnerOrStaffOf($user, $product);
    }

    public function create(User $user): bool
    {
        if ($user->user_type === UserType::Admin) {
            return $user->hasPermission('products.create');
        }

        return in_array($user->user_type, [UserType::StoreOwner, UserType::VendorStaff], true);
    }

    public function update(User $user, Product $product): bool
    {
        if ($user->user_type === UserType::Admin) {
            return $user->hasPermission('products.edit');
        }

        return $this->isOwnerOrStaffOf($user, $product);
    }

    public function delete(User $user, Product $product): bool
    {
        if ($user->user_type === UserType::Admin) {
            return $user->hasPermission('products.delete');
        }

        return $this->isOwnerOrStaffOf($user, $product);
    }

    /**
     * Store owner/staff or a hide-permissioned admin setting an Active
     * product to Inactive. Never reachable while Suspended.
     */
    public function setInactive(User $user, Product $product): bool
    {
        if ($product->status === ProductStatus::Suspended) {
            return false;
        }

        if ($user->user_type === UserType::Admin) {
            return $user->hasPermission('products.hide');
        }

        return $this->isOwnerOrStaffOf($user, $product);
    }

    /**
     * Reactivating an Inactive product back to Active. Store owner/staff
     * may only do this while currently Inactive (never from Suspended).
     */
    public function reactivate(User $user, Product $product): bool
    {
        if ($product->status !== ProductStatus::Inactive) {
            return false;
        }

        if ($user->user_type === UserType::Admin) {
            return $user->hasPermission('products.hide') || $user->hasPermission('products.suspend');
        }

        return $this->isOwnerOrStaffOf($user, $product);
    }

    /**
     * Admin-only, from Active or Inactive into Suspended.
     */
    public function suspend(User $user, Product $product): bool
    {
        return $user->user_type === UserType::Admin
            && $user->hasPermission('products.suspend')
            && $product->status !== ProductStatus::Suspended;
    }

    /**
     * Lifting a Suspended product back to Active. Only suspend-permissioned
     * admins; store users can never do this.
     */
    public function unsuspend(User $user, Product $product): bool
    {
        return $user->user_type === UserType::Admin
            && $user->hasPermission('products.suspend')
            && $product->status === ProductStatus::Suspended;
    }

    private function isOwnerOrStaffOf(User $user, Product $product): bool
    {
        return in_array($user->user_type, [UserType::StoreOwner, UserType::VendorStaff], true)
            && $product->store->users()->where('users.id', $user->id)->exists();
    }
}
