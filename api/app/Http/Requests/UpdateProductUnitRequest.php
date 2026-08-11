<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\ProductUnit;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductUnitRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var ProductUnit $unit */
        $unit = $this->route('product_unit');

        return $this->user()?->can('update', $unit) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var ProductUnit $unit */
        $unit = $this->route('product_unit');

        return [
            'name' => ['sometimes', 'string', 'max:100', Rule::unique('product_units', 'name')->ignore($unit->id)],
            'abbreviation' => ['nullable', 'string', 'max:20'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
