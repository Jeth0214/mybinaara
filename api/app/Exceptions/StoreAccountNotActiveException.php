<?php

declare(strict_types=1);

namespace App\Exceptions;

use App\Enums\StoreStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class StoreAccountNotActiveException extends RuntimeException
{
    public function __construct(private readonly StoreStatus $status)
    {
        parent::__construct();
    }

    public function render(Request $request): JsonResponse
    {
        $message = match ($this->status) {
            StoreStatus::Pending => 'Your store account is pending activation. Please check your email for the activation link we sent you.',
            StoreStatus::Suspended => 'Your store account has been suspended. Please contact support for assistance.',
            StoreStatus::Rejected => 'Your store account application was rejected. Please contact support for more information.',
            StoreStatus::Active => 'Your store account is not currently active.',
        };

        return response()->json(['message' => $message, 'code' => 'store_inactive'], 403);
    }
}
