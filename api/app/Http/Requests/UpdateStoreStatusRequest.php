<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\StoreStatus;
use App\Models\Store;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateStoreStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Store $store */
        $store = $this->route('store');

        return $this->user()?->can('verify', $store) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', new Enum(StoreStatus::class)],
            'rejection_reason' => ['required_if:status,rejected', 'nullable', 'string', 'max:500'],
        ];
    }
}
