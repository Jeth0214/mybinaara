<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * One store's listing of a catalog product — the "Available at" entries on
 * the customer product-detail page. Reuses PublicStoreResource for the
 * nested store, same as the store's own fields elsewhere.
 *
 * @mixin Product
 */
class ProductListingResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'price' => (float) $this->price,
            'compare_at_price' => $this->compare_at_price === null ? null : (float) $this->compare_at_price,
            'stock_quantity' => $this->stock_quantity,
            'sku' => $this->sku,
            'store' => new PublicStoreResource($this->store),
            'distance_km' => $this->when(array_key_exists('distance_km', $this->getAttributes()), fn () => round((float) $this->getAttributes()['distance_km'], 1)),
        ];
    }
}
