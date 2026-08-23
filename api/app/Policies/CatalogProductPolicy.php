<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\UserType;
use App\Models\User;

class CatalogProductPolicy
{
    /**
     * Any active vendor (or a permissioned admin) may create a shared
     * catalog entry — there is no ownership concept here, unlike Product.
     */
    public function create(User $user): bool
    {
        if ($user->user_type === UserType::Admin) {
            return $user->hasPermission('products.create');
        }

        return in_array($user->user_type, [UserType::StoreOwner, UserType::VendorStaff], true);
    }
}
