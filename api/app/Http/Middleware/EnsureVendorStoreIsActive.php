<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Enums\StoreStatus;
use App\Enums\UserType;
use App\Exceptions\StoreAccountNotActiveException;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureVendorStoreIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && in_array($user->user_type, [UserType::StoreOwner, UserType::StoreStaff], true)) {
            $store = $user->stores()->first();
            $status = $store?->status;

            if ($status !== StoreStatus::Active) {
                $user->tokens()->delete();

                throw new StoreAccountNotActiveException($status ?? StoreStatus::Pending);
            }
        }

        return $next($request);
    }
}
