<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\UserType;
use App\Models\Category;
use App\Models\User;

class CategoryPolicy
{
    /**
     * Category browsing is public; no user is required to view the catalog.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Category $category): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->user_type === UserType::Admin && $user->hasPermission('categories.create');
    }

    public function update(User $user, Category $category): bool
    {
        return $user->user_type === UserType::Admin && $user->hasPermission('categories.edit');
    }

    public function delete(User $user, Category $category): bool
    {
        return $user->user_type === UserType::Admin && $user->hasPermission('categories.delete');
    }
}
