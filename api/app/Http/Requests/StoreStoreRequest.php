<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Http\Requests\Concerns\ValidatesStoreLocation;
use App\Http\Requests\Concerns\ValidatesStoreSchedule;
use App\Models\Store;
use App\Rules\PhoneRules;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStoreRequest extends FormRequest
{
    use ValidatesStoreLocation, ValidatesStoreSchedule;

    public function authorize(): bool
    {
        return $this->user()?->can('create', Store::class) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return array_merge([
            'name' => ['required', 'string', 'max:255'],
            'cr_number' => ['required', 'string', 'size:10', Rule::unique('stores', 'cr_number')],
            'vat_number' => ['required', 'string', 'size:15', Rule::unique('stores', 'vat_number')],
            'owner_name' => ['required', 'string', 'max:255'],
            'owner_email' => ['required', 'email', Rule::unique('users', 'email')],
            'owner_phone' => ['required', 'string', 'max:13'],
            'owner_whatsapp' => ['required', 'string', 'max:13', PhoneRules::SAUDI_MOBILE],
            'logo' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'location' => ['nullable', 'array'],
        ], $this->storeLocationRules('location', required: false, includeCoordinates: false), $this->scheduleRules());
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(fn (Validator $v) => $this->validateScheduleCompleteness($v));
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'cr_number.unique' => 'This CR number is already registered to another store.',
            'vat_number.unique' => 'This VAT number is already registered to another store.',
        ];
    }
}
