<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Product $product */
        $product = $this->route('product');

        return $this->user()?->can('update', $product) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var Product $product */
        $product = $this->route('product');

        return [
            'category_id' => ['sometimes', 'nullable', 'integer', Rule::exists('categories', 'id')],
            'unit_id' => ['sometimes', 'nullable', 'integer', Rule::exists('product_units', 'id')],
            'name' => ['sometimes', 'string', 'max:150'],
            'slug' => [
                'sometimes', 'string', 'max:180',
                Rule::unique('products', 'slug')
                    ->where(fn ($query) => $query->where('store_id', $product->store_id))
                    ->ignore($product->id),
            ],
            'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'sku' => ['sometimes', 'nullable', 'string', 'max:50'],
            'price' => ['sometimes', 'numeric', 'min:0', 'max:99999999.99'],
            'compare_at_price' => ['sometimes', 'nullable', 'numeric', 'gt:price'],
            'stock_quantity' => ['sometimes', 'integer', 'min:0'],
            'image' => ['sometimes', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048', 'dimensions:min_width=300,min_height=300'],
        ];
    }
}
