<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Category $category */
        $category = $this->route('category');

        return $this->user()?->can('update', $category) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var Category $category */
        $category = $this->route('category');

        return [
            'name' => ['sometimes', 'string', 'max:100'],
            'slug' => ['sometimes', 'string', 'max:120', Rule::unique('categories', 'slug')->ignore($category->id)],
            'description' => ['nullable', 'string', 'max:500'],
            'image' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
