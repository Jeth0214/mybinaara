<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * StorePolicy::delete() and StoreController::updateStatus previously enforced
 * a single 'stores.verify'/'stores.edit' permission for actions that are now
 * split into distinct 'stores.approve'/'stores.reject'/'stores.suspend'/'stores.delete'
 * checks; likewise CategoryPolicy previously enforced 'catalog.manage' for
 * what is now 'categories.create'/'categories.edit'/'categories.delete'.
 * This backfills the new granular permissions onto users who already held
 * the old bundled one, so no staff member loses access on deploy.
 */
return new class extends Migration
{
    public function up(): void
    {
        $this->grantAlongside('stores.verify', ['stores.approve', 'stores.reject', 'stores.suspend']);
        $this->grantAlongside('catalog.manage', ['categories.create', 'categories.edit', 'categories.delete']);
    }

    public function down(): void
    {
        // Data backfill only — intentionally not reversible.
    }

    /**
     * @param  array<int, string>  $newKeys
     */
    private function grantAlongside(string $existingKey, array $newKeys): void
    {
        $existingPermissionId = DB::table('permissions')->where('key', $existingKey)->value('id');

        if ($existingPermissionId === null) {
            return;
        }

        $userIds = DB::table('user_permissions')
            ->where('permission_id', $existingPermissionId)
            ->pluck('user_id');

        if ($userIds->isEmpty()) {
            return;
        }

        $newPermissionIds = DB::table('permissions')->whereIn('key', $newKeys)->pluck('id', 'key');

        foreach ($userIds as $userId) {
            foreach ($newPermissionIds as $permissionId) {
                DB::table('user_permissions')->updateOrInsert(
                    ['user_id' => $userId, 'permission_id' => $permissionId],
                    ['updated_at' => now(), 'created_at' => now()],
                );
            }
        }
    }
};
