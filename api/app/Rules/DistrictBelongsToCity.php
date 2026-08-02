<?php

declare(strict_types=1);

namespace App\Rules;

use App\Models\District;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

final class DistrictBelongsToCity implements ValidationRule
{
    public function __construct(private readonly ?int $cityId) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if ($this->cityId === null || $value === null || $value === '') {
            return;
        }

        $belongs = District::query()->where('id', $value)->where('city_id', $this->cityId)->exists();

        if (! $belongs) {
            $fail('The selected district does not belong to the selected city.');
        }
    }
}
