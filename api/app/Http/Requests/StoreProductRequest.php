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
            'category_id' => ['nullable', 'integer', Rule::exists('categories', 'id')],
            'unit_id' => ['nullable', 'integer', Rule::exists('product_units', 'id')],
            'name' => ['required', 'string', 'max:150'],
            'slug' => [
                'required', 'string', 'max:180',
                Rule::unique('products', 'slug')->where(fn ($query) => $query->where('store_id', $this->input('store_id'))),
            ],
            'description' => ['nullable', 'string', 'max:2000'],
            'sku' => ['nullable', 'string', 'max:50'],
            'price' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'compare_at_price' => ['nullable', 'numeric', 'gt:price'],
            'stock_quantity' => ['sometimes', 'integer', 'min:0'],
            'image' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048', 'dimensions:min_width=300,min_height=300'],
        ];
    }
}
