<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Product
 */
class ProductResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'price' => (float) $this->price,
            'compare_at_price' => $this->compare_at_price === null ? null : (float) $this->compare_at_price,
            'stock_quantity' => $this->stock_quantity,
            'status' => $this->status,
            'suspension_reason' => $this->suspension_reason,
            'catalog_product' => $this->whenLoaded('catalogProduct', fn () => [
                'id' => $this->catalogProduct->id,
                'name' => $this->catalogProduct->name,
                'slug' => $this->catalogProduct->slug,
                'description' => $this->catalogProduct->description,
                'image_url' => $this->catalogProduct->image_url,
                'category' => $this->catalogProduct->relationLoaded('category') && $this->catalogProduct->category !== null ? [
                    'id' => $this->catalogProduct->category->id,
                    'name' => $this->catalogProduct->category->name,
                    'slug' => $this->catalogProduct->category->slug,
                ] : null,
                'unit' => $this->catalogProduct->relationLoaded('unit') && $this->catalogProduct->unit !== null ? [
                    'id' => $this->catalogProduct->unit->id,
                    'name' => $this->catalogProduct->unit->name,
                    'abbreviation' => $this->catalogProduct->unit->abbreviation,
                ] : null,
            ]),
            'store' => $this->whenLoaded('store', fn () => [
                'id' => $this->store->id,
                'name' => $this->store->name,
            ]),
            'created_by' => $this->whenLoaded('creator', fn () => $this->creator === null ? null : [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
            ]),
            'updated_by' => $this->whenLoaded('editor', fn () => $this->editor === null ? null : [
                'id' => $this->editor->id,
                'name' => $this->editor->name,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
