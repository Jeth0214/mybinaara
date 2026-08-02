<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Http\Requests\Concerns\ValidatesStoreLocation;
use App\Models\Store;
use Illuminate\Foundation\Http\FormRequest;

class UpdateStoreAddressRequest extends FormRequest
{
    use ValidatesStoreLocation;

    public function authorize(): bool
    {
        /** @var Store $store */
        $store = $this->route('store');

        return $this->user()?->can('updateAddress', $store) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return $this->storeLocationRules(required: false, includeCoordinates: false);
    }
}
