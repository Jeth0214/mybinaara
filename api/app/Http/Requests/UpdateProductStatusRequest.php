<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\ProductStatus;
use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateProductStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Product $product */
        $product = $this->route('product');
        $target = ProductStatus::tryFrom((string) $this->input('status'));

        if ($target === null) {
            return true;
        }

        $user = $this->user();

        if ($user === null) {
            return false;
        }

        return match ($target) {
            ProductStatus::Inactive => $product->status === ProductStatus::Inactive
                ? true
                : $user->can('setInactive', $product),
            ProductStatus::Active => match ($product->status) {
                ProductStatus::Active => true,
                ProductStatus::Suspended => $user->can('unsuspend', $product),
                ProductStatus::Inactive => $user->can('reactivate', $product),
            },
            ProductStatus::Suspended => $user->can('suspend', $product),
        };
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', new Enum(ProductStatus::class)],
            'suspension_reason' => ['required_if:status,suspended', 'nullable', 'string', 'max:500'],
        ];
    }
}
