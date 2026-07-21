<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\StoreStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'cr_number', 'vat_number', 'status', 'is_activated', 'logo_url', 'rejection_reason', 'created_by'])]
class Store extends Model
{
    use HasFactory;

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

    public function owners(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'store_user')->wherePivot('role', 'owner');
    }

    public function activationTokens(): HasMany
    {
        return $this->hasMany(StoreActivationToken::class);
    }
}
