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

#[Fillable([
    'name', 'cr_number', 'vat_number', 'status', 'is_activated', 'logo_url', 'rejection_reason', 'created_by',
    'full_address', 'building_number', 'street_name', 'district', 'district_id', 'city', 'city_id',
    'postal_code', 'additional_number', 'country', 'latitude', 'longitude', 'plus_code',
])]
class Store extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'status' => StoreStatus::class,
            'is_activated' => 'boolean',
            'latitude' => 'decimal:6',
            'longitude' => 'decimal:6',
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

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'store_user');
    }

    public function activationTokens(): HasMany
    {
        return $this->hasMany(StoreActivationToken::class);
    }

    public function cityRef(): BelongsTo
    {
        return $this->belongsTo(City::class, 'city_id');
    }

    public function districtRef(): BelongsTo
    {
        return $this->belongsTo(District::class, 'district_id');
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(StoreSchedule::class)
            ->orderByRaw("CASE day
                WHEN 'sat' THEN 1 WHEN 'sun' THEN 2 WHEN 'mon' THEN 3 WHEN 'tue' THEN 4
                WHEN 'wed' THEN 5 WHEN 'thu' THEN 6 WHEN 'fri' THEN 7 END");
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
