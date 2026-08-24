<?php

declare(strict_types=1);

namespace App\Rules;

final class PhoneRules
{
    /** Saudi mobile format: optional +966 or 0 prefix, then 5 + 8 digits. Mirrors the frontend's SAUDI_PHONE_PATTERN. */
    public const SAUDI_MOBILE = 'regex:/^(?:\+966|0)?5[0-9]{8}$/';
}
