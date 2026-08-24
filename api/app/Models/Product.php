<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ProductStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'store_id', 'catalog_product_id', 'sku',
    'price', 'compare_at_price', 'stock_quantity', 'status', 'suspension_reason',
    'created_by', 'updated_by',
])]
class Product extends Model
{
    use HasFactory;

    protected $attributes = [
        'status' => 'active',
        'stock_quantity' => 0,
    ];

    protected function casts(): array
    {
        return [
            'status' => ProductStatus::class,
            'price' => 'decimal:2',
            'compare_at_price' => 'decimal:2',
            'stock_quantity' => 'integer',
        ];
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function catalogProduct(): BelongsTo
    {
        return $this->belongsTo(CatalogProduct::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
