<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\StoreStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['name', 'cr_number', 'vat_number', 'status', 'is_activated', 'activation_token', 'logo_url', 'rejection_reason', 'created_by'])]
class Store extends Model
{
    protected function casts(): array
    {
        return [
            'status' => StoreStatus::class,
            'is_activated' => 'boolean',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
