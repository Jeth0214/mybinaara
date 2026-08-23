<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\StoreStatus;
use App\Enums\StoreUserRole;
use App\Enums\UserStatus;
use App\Enums\UserType;
use App\Mail\StoreActivationMail;
use App\Models\Role;
use App\Models\Store;
use App\Models\StoreActivationToken;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class StoreService
{
    public function __construct(
        private readonly StoreScheduleService $schedules,
        private readonly ActivityLogService $activityLogs,
        private readonly DefaultPasswordProvider $passwords,
    ) {}

    /**
     * @param  array{status?: string, search?: string, city?: string}  $filters
     */
    public function list(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return Store::query()
            ->with(['owners', 'creator'])
            ->withCount('products')
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where(
                fn ($query) => $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhereHas('owners', fn ($query) => $query->where('name', 'like', "%{$search}%"))
            ))
            ->when($filters['city'] ?? null, fn ($query, $city) => $query->where('city', $city))
            ->latest()
            ->paginate($perPage);
    }

    /**
     * @return Collection<int, Store>
     */
    public function nearby(float $lat, float $lng, int $limit = 5): Collection
    {
        $haversine = '(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude))))';

        return Store::query()
            ->where('status', StoreStatus::Active)
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->selectRaw("stores.*, {$haversine} AS distance_km", [$lat, $lng, $lat])
            ->orderBy('distance_km')
            ->limit($limit)
            ->get();
    }

    /**
     * Creates the store, its owner's user account, links them via store_user,
     * and issues + emails an activation token. All-or-nothing.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, User $creator): Store
    {
        return DB::transaction(function () use ($data, $creator) {
            $temporaryPassword = $this->passwords->forRole('vendor');

            $owner = User::query()->create([
                'user_type' => UserType::StoreOwner,
                'name' => $data['owner_name'],
                'email' => $data['owner_email'],
                'phone' => $data['owner_phone'],
                'whatsapp' => $data['owner_whatsapp'] ?? null,
                'password' => $temporaryPassword,
                'status' => UserStatus::Active,
            ]);

            $owner->forceFill([
                'role_id' => Role::query()->where('name', 'vendor')->value('id'),
            ])->save();

            $store = Store::query()->create([
                'name' => $data['name'],
                'cr_number' => $data['cr_number'],
                'vat_number' => $data['vat_number'],
                'status' => StoreStatus::Pending,
                'is_activated' => false,
                'created_by' => $creator->id,
            ]);

            $store->owners()->attach($owner->id, ['role' => StoreUserRole::Owner->value]);

            $this->activityLogs->record($store, 'registration', 'New store registered', $creator);

            $rawToken = Str::random(64);
            $expiresAt = now()->addDays(7);

            StoreActivationToken::query()->create([
                'store_id' => $store->id,
                'token_hash' => hash('sha256', $rawToken),
                'expires_at' => $expiresAt,
            ]);

            $activationUrl = rtrim((string) config('services.store_web_url'), '/').'/activate?token='.$rawToken;

            Mail::to($owner->email)->send(new StoreActivationMail($store, $owner, $temporaryPassword, $activationUrl, $expiresAt));

            if (! empty($data['location'])) {
                $this->updateLocation($store, $data['location']);
            }

            $this->schedules->replace($store, $data['schedule']);

            if (! empty($data['logo'])) {
                $this->updateLogo($store, $data['logo']);
            }

            return $store->fresh(['owners', 'creator', 'schedules']);
        });
    }

    public function findForUser(User $user): ?Store
    {
        return $user->stores()->with(['owners', 'creator', 'schedules'])->first();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Store $store, array $data): Store
    {
        $store->update($data);

        return $store;
    }

    public function delete(Store $store): void
    {
        $store->delete();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateLocation(Store $store, array $data): Store
    {
        $store->update($data);

        return $store;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateOwner(Store $store, array $data): Store
    {
        $owner = $store->owners()->first();

        if ($owner !== null) {
            $owner->update($data);
        }

        return $store;
    }

    public function updateLogo(Store $store, UploadedFile $file): Store
    {
        $oldPath = $store->logo_url ? Str::after($store->logo_url, Storage::disk('public')->url('')) : null;

        $path = $file->store('stores/logos', 'public');

        $store->update(['logo_url' => Storage::disk('public')->url($path)]);

        if ($oldPath && Str::startsWith($oldPath, 'stores/logos/')) {
            Storage::disk('public')->delete($oldPath);
        }

        return $store;
    }

    public function removeLogo(Store $store): Store
    {
        $oldPath = $store->logo_url ? Str::after($store->logo_url, Storage::disk('public')->url('')) : null;

        $store->update(['logo_url' => null]);

        if ($oldPath && Str::startsWith($oldPath, 'stores/logos/')) {
            Storage::disk('public')->delete($oldPath);
        }

        return $store;
    }

    public function updateStatus(Store $store, StoreStatus $status, ?string $rejectionReason = null, ?string $suspensionReason = null): Store
    {
        $store->update([
            'status' => $status,
            'rejection_reason' => $status === StoreStatus::Rejected ? $rejectionReason : null,
            // Cleared whenever the store isn't Suspended, so an unsuspended
            // store doesn't keep showing a stale suspension reason.
            'suspension_reason' => $status === StoreStatus::Suspended ? $suspensionReason : null,
        ]);

        $this->activityLogs->record($store, ...match ($status) {
            StoreStatus::Active => ['activation', 'Store approved'],
            StoreStatus::Suspended => ['suspension', 'Store suspended'],
            StoreStatus::Rejected => ['verification', 'Store rejected'],
            StoreStatus::Pending => ['verification', 'Store returned to pending'],
        });

        return $store;
    }
}
