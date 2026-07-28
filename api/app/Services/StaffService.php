<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\UserStatus;
use App\Enums\UserType;
use App\Mail\StaffInvitationMail;
use App\Models\Permission;
use App\Models\Role;
use App\Models\StaffInvitationToken;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class StaffService
{
    /**
     * @param  array{search?: string}  $filters
     */
    public function list(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return User::query()
            ->with(['role', 'permissions'])
            ->whereHas('role', fn ($query) => $query->whereIn('name', ['administrator', 'staff']))
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where('name', 'like', "%{$search}%"))
            ->latest()
            ->paginate($perPage);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $roleName = $data['role'] ?? 'staff';

            $staff = User::query()->create([
                'user_type' => UserType::Admin,
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'whatsapp' => $data['whatsapp'] ?? null,
                'password' => Str::random(40),
                'status' => UserStatus::Active,
            ]);

            $staff->forceFill([
                'role_id' => Role::query()->where('name', $roleName)->value('id'),
            ])->save();

            if ($roleName !== 'administrator') {
                $this->syncPermissions($staff, $data['permissions'] ?? []);
            }

            $this->sendInvitation($staff);

            return $staff->fresh(['role', 'permissions']);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(User $staff, array $data): User
    {
        $staff->update(array_intersect_key($data, array_flip(['name', 'email', 'phone', 'whatsapp'])));

        if (array_key_exists('role', $data)) {
            $staff->forceFill([
                'role_id' => Role::query()->where('name', $data['role'])->value('id'),
            ])->save();

            if ($data['role'] === 'administrator') {
                $staff->permissions()->sync([]);
            }
        }

        if (array_key_exists('permissions', $data) && $staff->role?->name !== 'administrator') {
            $this->syncPermissions($staff, $data['permissions']);
        }

        return $staff->fresh(['role', 'permissions']);
    }

    public function updateStatus(User $staff, UserStatus $status): User
    {
        $staff->update(['status' => $status]);

        return $staff;
    }

    public function delete(User $staff): void
    {
        $staff->delete();
    }

    /**
     * @param  array<int, string>  $permissionKeys
     */
    private function syncPermissions(User $staff, array $permissionKeys): void
    {
        $permissionIds = Permission::query()->whereIn('key', $permissionKeys)->pluck('id');

        $staff->permissions()->sync($permissionIds);
    }

    private function sendInvitation(User $staff): void
    {
        $rawToken = Str::random(64);

        StaffInvitationToken::query()->create([
            'user_id' => $staff->id,
            'token_hash' => hash('sha256', $rawToken),
            'expires_at' => now()->addDays(7),
        ]);

        $invitationUrl = rtrim((string) config('services.admin_web_url'), '/').'/staff/accept-invite?token='.$rawToken;

        Mail::to($staff->email)->send(new StaffInvitationMail($staff, $invitationUrl));
    }
}
