<?php

declare(strict_types=1);

namespace App\Http\Requests\Concerns;

trait ValidatesStoreLocation
{
    /**
     * Location is all-or-nothing: either all four fields carry a value, or all
     * four are null. `$requirePresence` additionally forces every key to appear
     * in the payload (used by the dedicated PATCH endpoint, where an explicit
     * all-null body is how a location is cleared).
     *
     * @return array<string, mixed>
     */
    protected function storeLocationRules(string $prefix = '', bool $requirePresence = true): array
    {
        $p = $prefix === '' ? '' : $prefix.'.';
        $base = $requirePresence ? ['present', 'nullable'] : ['nullable'];

        return [
            $p.'latitude' => [...$base, 'numeric', 'between:-90,90', "required_with:{$p}longitude,{$p}city,{$p}formatted_address"],
            $p.'longitude' => [...$base, 'numeric', 'between:-180,180', "required_with:{$p}latitude,{$p}city,{$p}formatted_address"],
            $p.'city' => [...$base, 'string', 'max:150', "required_with:{$p}latitude,{$p}longitude,{$p}formatted_address"],
            $p.'formatted_address' => [...$base, 'string', 'max:500', "required_with:{$p}latitude,{$p}longitude,{$p}city"],
        ];
    }
}
