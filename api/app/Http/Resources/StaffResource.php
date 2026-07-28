<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Permission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
class StaffResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'whatsapp' => $this->whatsapp,
            'status' => $this->status,
            'locked' => $this->requires_admin_unlock || ($this->locked_until?->isFuture() ?? false),
            'locked_until' => $this->locked_until?->toIso8601String(),
            'requires_admin_unlock' => $this->requires_admin_unlock,
            'role' => $this->role?->name,
            'permissions' => $this->role?->name === 'administrator'
                ? Permission::query()->pluck('key')->values()
                : $this->permissions->pluck('key')->values(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
