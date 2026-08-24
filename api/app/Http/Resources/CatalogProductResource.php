<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\CatalogProduct;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Public-safe by construction — no vendor/internal fields exist on the
 * catalog entity itself, so unlike PublicStoreResource this needs no trimming.
 *
 * @mixin CatalogProduct
 */
class CatalogProductResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'image_url' => $this->image_url,
            'category' => $this->whenLoaded('category', fn () => $this->category === null ? null : [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ]),
            'unit' => $this->whenLoaded('unit', fn () => $this->unit === null ? null : [
                'id' => $this->unit->id,
                'name' => $this->unit->name,
                'abbreviation' => $this->unit->abbreviation,
            ]),
            'min_price' => $this->min_price === null ? null : (float) $this->min_price,
            'max_price' => $this->max_price === null ? null : (float) $this->max_price,
            'listings_count' => (int) ($this->listings_count ?? 0),
        ];
    }
}
