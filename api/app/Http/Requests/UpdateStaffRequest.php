<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\User;
use App\Rules\PhoneRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStaffRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var User $staff */
        $staff = $this->route('staff');

        $user = $this->user();

        if (! $user?->can('update', $staff)) {
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
        /** @var User $staff */
        $staff = $this->route('staff');
        $role = $this->input('role', $staff->role?->name ?? 'staff');

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($staff->id)],
            'phone' => ['sometimes', 'string', 'max:13', PhoneRules::SAUDI_MOBILE],
            'whatsapp' => ['nullable', 'string', 'max:13', PhoneRules::SAUDI_MOBILE],
            'role' => ['sometimes', Rule::in(['administrator', 'staff'])],
            'permissions' => $role === 'administrator'
                ? ['sometimes', 'array']
                : ['sometimes', 'array', 'min:1'],
            'permissions.*' => [Rule::exists('permissions', 'key')],
        ];
    }
}
