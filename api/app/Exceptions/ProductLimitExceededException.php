<?php

declare(strict_types=1);

namespace App\Exceptions;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class ProductLimitExceededException extends RuntimeException
{
    public function render(Request $request): JsonResponse
    {
        return response()->json(['message' => 'This store has reached the maximum of 100 products.'], 422);
    }
}
