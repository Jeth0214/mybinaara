<?php

declare(strict_types=1);

namespace App\Exceptions;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class InvalidCredentialsException extends RuntimeException
{
    public function __construct(private readonly ?int $attemptsRemaining = null)
    {
        parent::__construct();
    }

    public function render(Request $request): JsonResponse
    {
        $message = 'The provided credentials are incorrect.';

        if ($this->attemptsRemaining !== null && $this->attemptsRemaining > 0) {
            $message .= sprintf(
                ' %d attempt%s remaining before your account is temporarily locked.',
                $this->attemptsRemaining,
                $this->attemptsRemaining === 1 ? '' : 's',
            );
        }

        return response()->json(['message' => $message], 401);
    }
}
