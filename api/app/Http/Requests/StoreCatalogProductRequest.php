<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\CatalogProduct;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCatalogProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', CatalogProduct::class) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'category_id' => ['required', 'integer', Rule::exists('categories', 'id')],
            'unit_id' => ['required', 'integer', Rule::exists('product_units', 'id')],
            'name' => ['required', 'string', 'max:150'],
            'slug' => ['required', 'string', 'max:180', Rule::unique('catalog_products', 'slug')],
            'description' => ['nullable', 'string', 'max:2000'],
            'image' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048', 'dimensions:min_width=300,min_height=300'],
        ];
    }
}
