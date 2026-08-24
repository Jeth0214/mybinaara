<?php

declare(strict_types=1);

namespace App\Exceptions;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class DuplicateCatalogListingException extends RuntimeException
{
    public function render(Request $request): JsonResponse
    {
        return response()->json(['message' => 'This store already lists this catalog product.'], 422);
    }
}
