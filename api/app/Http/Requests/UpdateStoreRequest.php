<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Store;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Store $store */
        $store = $this->route('store');

        return $this->user()?->can('update', $store) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var Store $store */
        $store = $this->route('store');

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'cr_number' => ['sometimes', 'string', 'size:10', Rule::unique('stores', 'cr_number')->ignore($store->id)],
            'vat_number' => ['sometimes', 'string', 'size:15', Rule::unique('stores', 'vat_number')->ignore($store->id)],
            'logo_url' => ['nullable', 'string', 'max:2048'],
        ];
    }
}
