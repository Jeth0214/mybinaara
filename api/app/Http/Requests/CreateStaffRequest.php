<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\User;
use App\Rules\PhoneRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateStaffRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        if (! $user?->can('create', User::class)) {
            return false;
        }

        if ($this->input('role') === 'administrator' && $user->role?->name !== 'administrator') {
            return false;
        }

        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $role = $this->input('role', 'staff');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('users', 'email')],
            'phone' => ['required', 'string', 'max:13', PhoneRules::SAUDI_MOBILE],
            'whatsapp' => ['required', 'string', 'max:13', PhoneRules::SAUDI_MOBILE],
            'role' => ['sometimes', Rule::in(['administrator', 'staff'])],
            'permissions' => $role === 'administrator'
                ? ['sometimes', 'array']
                : ['required', 'array', 'min:1'],
            'permissions.*' => [Rule::exists('permissions', 'key')],
        ];
    }
}
