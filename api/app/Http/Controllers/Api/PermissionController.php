<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class PermissionController extends Controller
{
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $groups = Permission::query()
            ->orderBy('category')
            ->orderBy('label')
            ->get()
            ->groupBy('category')
            ->map(fn ($permissions, $category) => [
                'category' => $category,
                'permissions' => $permissions->map(fn ($permission) => [
                    'key' => $permission->key,
                    'label' => $permission->label,
                ])->values(),
            ])
            ->values();

        return response()->json(['data' => $groups]);
    }
}
