<?php

declare(strict_types=1);

namespace App\Http\Requests\Concerns;

use Illuminate\Validation\Rule;

trait ValidatesStoreLocation
{
    /**
     * @return array<string, mixed>
     */
    protected function storeLocationRules(string $prefix = '', bool $required = true): array
    {
        $p = $prefix === '' ? '' : $prefix.'.';

        return [
            $p.'full_address' => [$required ? 'required' : 'nullable', 'string', 'max:500'],
            $p.'building_number' => ['nullable', 'string', 'max:20'],
            $p.'street_name' => ['nullable', 'string', 'max:255'],
            $p.'district' => ['nullable', 'string', 'max:150'],
            $p.'district_id' => ['nullable', 'integer', Rule::exists('districts', 'id')],
            $p.'city' => ['nullable', 'string', 'max:150'],
            $p.'city_id' => ['nullable', 'integer', Rule::exists('cities', 'id')],
            $p.'postal_code' => ['nullable', 'string', 'max:10'],
            $p.'additional_number' => ['nullable', 'string', 'max:10'],
            $p.'country' => ['nullable', 'string', 'max:100'],
            $p.'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            $p.'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            $p.'plus_code' => ['nullable', 'string', 'max:20'],
        ];
    }
}
