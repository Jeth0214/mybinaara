<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;

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
        // catalog_product_id is intentionally not updatable here, same
        // immutability precedent as store_id — a listing's identity is fixed
        // once created; only its commercial terms can change.
        return [
            'sku' => ['sometimes', 'nullable', 'string', 'max:50'],
            'price' => ['sometimes', 'numeric', 'min:0', 'max:99999999.99'],
            'compare_at_price' => ['sometimes', 'nullable', 'numeric', 'gt:price'],
            'stock_quantity' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
