<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Store;
use App\Rules\PhoneRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStoreOwnerRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Store $store */
        $store = $this->route('store');

        return $this->user()?->can('updateOwner', $store) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var Store $store */
        $store = $this->route('store');
        $ownerId = $store->owners()->first()?->id;

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($ownerId)],
            'phone' => ['sometimes', 'string', 'max:13'],
            'whatsapp' => ['sometimes', 'nullable', 'string', 'max:13', PhoneRules::SAUDI_MOBILE],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.unique' => 'This email is already registered to another user.',
        ];
    }
}
