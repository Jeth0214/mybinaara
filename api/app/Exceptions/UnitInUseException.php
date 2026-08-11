<?php

declare(strict_types=1);

namespace App\Exceptions;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class UnitInUseException extends RuntimeException
{
    public function render(Request $request): JsonResponse
    {
        return response()->json(['message' => 'This unit is assigned to one or more products and cannot be deleted.'], 409);
    }
}
