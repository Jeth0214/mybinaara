<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Enums\UserStatus;
use App\Exceptions\AccountInactiveException;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->status !== UserStatus::Active) {
            $user->tokens()->delete();

            throw new AccountInactiveException;
        }

        return $next($request);
    }
}
