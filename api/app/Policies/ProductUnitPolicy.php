<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\UserType;
use App\Models\ProductUnit;
use App\Models\User;

class ProductUnitPolicy
{
    /**
     * Product unit browsing is public; no user is required to view the list.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, ProductUnit $unit): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->user_type === UserType::Admin && $user->hasPermission('product_units.create');
    }

    public function update(User $user, ProductUnit $unit): bool
    {
        return $user->user_type === UserType::Admin && $user->hasPermission('product_units.edit');
    }

    public function delete(User $user, ProductUnit $unit): bool
    {
        return $user->user_type === UserType::Admin && $user->hasPermission('product_units.delete');
    }
}
