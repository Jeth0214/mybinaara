<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\StoreStatus;
use App\Enums\StoreUserRole;
use App\Enums\UserStatus;
use App\Enums\UserType;
use App\Mail\StoreActivationMail;
use App\Models\City;
use App\Models\District;
use App\Models\Role;
use App\Models\Store;
use App\Models\StoreActivationToken;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
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
     * @param  array{status?: string, search?: string, city_id?: int}  $filters
     */
    public function list(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return Store::query()
            ->with(['owners', 'creator'])
            ->withCount('products')
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where('name', 'like', "%{$search}%"))
            ->when($filters['city_id'] ?? null, fn ($query, $cityId) => $query->where('city_id', $cityId))
            ->latest()
            ->paginate($perPage);
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

            StoreActivationToken::query()->create([
                'store_id' => $store->id,
                'token_hash' => hash('sha256', $rawToken),
                'expires_at' => now()->addDays(7),
            ]);

            $activationUrl = rtrim((string) config('services.store_web_url'), '/').'/activate?token='.$rawToken;

            Mail::to($owner->email)->send(new StoreActivationMail($store, $owner, $temporaryPassword, $activationUrl));

            if (! empty($data['location'])) {
                $this->updateAddress($store, $data['location']);
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
    public function updateAddress(Store $store, array $data): Store
    {
        $store->update($this->resolveLocationNames($data));

        return $store;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateLocation(Store $store, array $data): Store
    {
        $store->update($this->resolveLocationNames($data));

        return $store;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function resolveLocationNames(array $data): array
    {
        if (! empty($data['city_id'])) {
            $data['city'] = City::query()->find($data['city_id'])?->name_en ?? $data['city'] ?? null;
        }
        if (! empty($data['district_id'])) {
            $data['district'] = District::query()->find($data['district_id'])?->name_en ?? $data['district'] ?? null;
        }

        return $data;
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

    public function updateStatus(Store $store, StoreStatus $status, ?string $rejectionReason = null): Store
    {
        $store->update([
            'status' => $status,
            'rejection_reason' => $status === StoreStatus::Rejected ? $rejectionReason : null,
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
