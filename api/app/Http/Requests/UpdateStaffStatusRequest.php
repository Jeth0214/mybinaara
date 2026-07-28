<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateStaffStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var User $staff */
        $staff = $this->route('staff');

        return $this->user()?->can('update', $staff) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', new Enum(UserStatus::class)],
        ];
    }
}
