<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Store;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Store::class) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'cr_number' => ['required', 'string', 'size:10', Rule::unique('stores', 'cr_number')],
            'vat_number' => ['required', 'string', 'size:15', Rule::unique('stores', 'vat_number')],
            'owner_name' => ['required', 'string', 'max:255'],
            'owner_email' => ['required', 'email', Rule::unique('users', 'email')],
            'owner_phone' => ['required', 'string', 'max:13'],
            'owner_whatsapp' => ['nullable', 'string', 'max:13'],
        ];
    }
}
