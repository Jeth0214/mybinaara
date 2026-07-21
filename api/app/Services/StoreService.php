<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\StoreStatus;
use App\Enums\StoreUserRole;
use App\Enums\UserStatus;
use App\Enums\UserType;
use App\Mail\StoreActivationMail;
use App\Models\Store;
use App\Models\StoreActivationToken;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class StoreService
{
    /**
     * @param  array{status?: string, search?: string}  $filters
     */
    public function list(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return Store::query()
            ->with(['owners', 'creator'])
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where('name', 'like', "%{$search}%"))
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
            $temporaryPassword = $this->generateTemporaryPassword();

            $owner = User::query()->create([
                'user_type' => UserType::StoreOwner,
                'name' => $data['owner_name'],
                'email' => $data['owner_email'],
                'phone' => $data['owner_phone'],
                'whatsapp' => $data['owner_whatsapp'] ?? null,
                'password' => $temporaryPassword,
                'status' => UserStatus::Active,
            ]);

            $store = Store::query()->create([
                'name' => $data['name'],
                'cr_number' => $data['cr_number'],
                'vat_number' => $data['vat_number'],
                'status' => StoreStatus::Pending,
                'is_activated' => false,
                'created_by' => $creator->id,
            ]);

            $store->owners()->attach($owner->id, ['role' => StoreUserRole::Owner->value]);

            $rawToken = Str::random(64);

            StoreActivationToken::query()->create([
                'store_id' => $store->id,
                'token_hash' => hash('sha256', $rawToken),
                'expires_at' => now()->addDays(7),
            ]);

            $activationUrl = rtrim((string) config('services.store_web_url'), '/').'/activate?token='.$rawToken;

            Mail::to($owner->email)->send(new StoreActivationMail($store, $owner, $temporaryPassword, $activationUrl));

            return $store->fresh(['owners', 'creator']);
        });
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

    public function updateStatus(Store $store, StoreStatus $status, ?string $rejectionReason = null): Store
    {
        $store->update([
            'status' => $status,
            'rejection_reason' => $status === StoreStatus::Rejected ? $rejectionReason : null,
        ]);

        return $store;
    }

    private function generateTemporaryPassword(): string
    {
        return 'Binaara'.Str::upper(Str::random(6)).'!';
    }
}
