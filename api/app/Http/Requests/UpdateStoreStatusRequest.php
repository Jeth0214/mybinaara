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
        $target = StoreStatus::tryFrom((string) $this->input('status'));

        if ($target === null) {
            return true; // let validation reject the bad enum value
        }

        $user = $this->user();
        if ($user === null) {
            return false;
        }

        return match ($target) {
            StoreStatus::Active => $store->status === StoreStatus::Suspended
                ? $user->can('unsuspend', $store)
                : $user->can('approve', $store),
            StoreStatus::Rejected => $user->can('reject', $store),
            StoreStatus::Suspended => $user->can('suspend', $store),
            StoreStatus::Pending => $user->can('verify', $store),
        };
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', new Enum(StoreStatus::class)],
            'rejection_reason' => ['required_if:status,rejected', 'nullable', 'string', 'max:500'],
            'suspension_reason' => ['required_if:status,suspended', 'nullable', 'string', 'max:500'],
        ];
    }
}
