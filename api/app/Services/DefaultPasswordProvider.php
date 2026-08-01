<?php

declare(strict_types=1);

namespace App\Services;

/**
 * TESTING/DEVELOPMENT ONLY.
 *
 * Assigns fixed, predictable default passwords by role so dev/QA environments
 * have known credentials. This must be replaced before production use — e.g.
 * with an env-driven or randomly generated temporary password + forced reset.
 * Swap by rebinding this class in a service provider or replacing its body;
 * StaffService/StoreService only depend on this class's public method.
 */
class DefaultPasswordProvider
{
    public function forRole(string $roleName): string
    {
        if (app()->environment('production')) {
            throw new \RuntimeException('DefaultPasswordProvider must not be used in production.');
        }

        return match ($roleName) {
            'administrator' => 'Admin123',
            'staff' => 'Staff123',
            'vendor' => 'Store123',
            default => 'Store123',
        };
    }
}
