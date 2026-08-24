<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\UserType;
use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Product::class) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        // Store owners/staff always have store_id forced to their own store
        // server-side (see ProductController::store), so it isn't required
        // from them — only admins must supply a valid target store.
        $isStoreUser = in_array($this->user()?->user_type, [UserType::StoreOwner, UserType::VendorStaff], true);

        return [
            'store_id' => [$isStoreUser ? 'sometimes' : 'required', 'integer', Rule::exists('stores', 'id')],
            'catalog_product_id' => [
                'required', 'integer', Rule::exists('catalog_products', 'id'),
                Rule::unique('products', 'catalog_product_id')->where(fn ($query) => $query->where('store_id', $this->input('store_id'))),
            ],
            'sku' => ['nullable', 'string', 'max:50'],
            'price' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'compare_at_price' => ['nullable', 'numeric', 'gt:price'],
            'stock_quantity' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
