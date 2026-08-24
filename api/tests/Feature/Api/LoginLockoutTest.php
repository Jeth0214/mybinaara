<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Enums\UserType;
use App\Models\Permission;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class LoginLockoutTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class, PermissionSeeder::class, RolePermissionSeeder::class]);
    }

    private function login(User $user, string $password): TestResponse
    {
        return $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => $password,
            'device_name' => 'phpunit',
        ]);
    }

    public function test_first_two_failed_attempts_are_normal_and_hint_remaining_attempts(): void
    {
        $user = User::factory()->create(['password' => Hash::make('correct-password')]);

        $first = $this->login($user, 'wrong');
        $first->assertStatus(401)->assertJsonFragment([
            'message' => 'The provided credentials are incorrect. 2 attempts remaining before your account is temporarily locked.',
        ]);

        $second = $this->login($user, 'wrong');
        $second->assertStatus(401)->assertJsonFragment([
            'message' => 'The provided credentials are incorrect. 1 attempt remaining before your account is temporarily locked.',
        ]);

        $this->assertEquals(2, $user->fresh()->failed_login_attempts);
        $this->assertNull($user->fresh()->locked_until);
    }

    public function test_third_failed_attempt_locks_account_for_15_minutes(): void
    {
        $user = User::factory()->create(['password' => Hash::make('correct-password')]);

        $this->login($user, 'wrong');
        $this->login($user, 'wrong');
        $response = $this->login($user, 'wrong');

        $response->assertStatus(403);
        $this->assertStringContainsString('temporarily locked', $response->json('message'));

        $lockedUntil = $user->fresh()->locked_until;
        $this->assertNotNull($lockedUntil);
        $this->assertTrue($lockedUntil->between(now()->addMinutes(14), now()->addMinutes(16)));
    }

    public function test_locked_account_rejects_even_the_correct_password(): void
    {
        $user = User::factory()->create(['password' => Hash::make('correct-password')]);

        $this->login($user, 'wrong');
        $this->login($user, 'wrong');
        $this->login($user, 'wrong');

        $response = $this->login($user, 'correct-password');

        $response->assertStatus(403);
        $this->assertStringContainsString('temporarily locked', $response->json('message'));
    }

    public function test_account_unlocks_automatically_after_the_lock_window_passes(): void
    {
        $user = User::factory()->create(['password' => Hash::make('correct-password')]);

        $this->login($user, 'wrong');
        $this->login($user, 'wrong');
        $this->login($user, 'wrong');

        $this->travel(16)->minutes();

        $response = $this->login($user, 'correct-password');

        $response->assertOk();
    }

    public function test_fifth_failed_attempt_locks_account_for_one_hour(): void
    {
        $user = User::factory()->create(['password' => Hash::make('correct-password')]);

        $this->login($user, 'wrong');
        $this->login($user, 'wrong');
        $this->login($user, 'wrong');

        $this->travel(16)->minutes();

        $this->login($user, 'wrong');
        $response = $this->login($user, 'wrong');

        $response->assertStatus(403);

        $lockedUntil = $user->fresh()->locked_until;
        $this->assertNotNull($lockedUntil);
        $this->assertTrue($lockedUntil->between(now()->addMinutes(58), now()->addMinutes(62)));
    }

    public function test_tenth_failed_attempt_requires_admin_review_and_blocks_indefinitely(): void
    {
        $user = User::factory()->create(['password' => Hash::make('correct-password')]);

        $this->login($user, 'wrong');
        $this->login($user, 'wrong');
        $this->login($user, 'wrong');
        $this->travel(16)->minutes();
        $this->login($user, 'wrong');
        $this->login($user, 'wrong');
        $this->travel(61)->minutes();
        $this->login($user, 'wrong'); // 6
        $this->login($user, 'wrong'); // 7
        $this->login($user, 'wrong'); // 8
        $this->login($user, 'wrong'); // 9
        $response = $this->login($user, 'wrong'); // 10

        $response->assertStatus(403)->assertJsonFragment([
            'message' => 'Your account has been locked due to repeated failed login attempts and requires administrator review. Please contact support.',
        ]);

        $this->assertTrue($user->fresh()->requires_admin_unlock);

        // Even far in the future, without an explicit unlock, login stays blocked.
        $this->travel(30)->days();
        $this->login($user, 'correct-password')->assertStatus(403);
    }

    public function test_successful_login_resets_the_failed_attempt_counter(): void
    {
        $user = User::factory()->create(['password' => Hash::make('correct-password')]);

        $this->login($user, 'wrong');
        $this->login($user, 'wrong');
        $this->login($user, 'correct-password')->assertOk();

        $this->assertEquals(0, $user->fresh()->failed_login_attempts);
        $this->assertNull($user->fresh()->locked_until);
    }

    public function test_administrator_can_unlock_an_account_pending_review(): void
    {
        $administrator = User::factory()->admin()->create();
        $user = User::factory()->create([
            'password' => Hash::make('correct-password'),
            'failed_login_attempts' => 10,
            'requires_admin_unlock' => true,
        ]);

        $response = $this->actingAs($administrator, 'sanctum')
            ->patchJson("/api/users/{$user->id}/unlock");

        $response->assertOk()->assertJsonPath('data.locked', false);

        $fresh = $user->fresh();
        $this->assertFalse($fresh->requires_admin_unlock);
        $this->assertEquals(0, $fresh->failed_login_attempts);
        $this->assertNull($fresh->locked_until);

        $this->login($user, 'correct-password')->assertOk();
    }

    public function test_staff_without_users_manage_permission_cannot_unlock(): void
    {
        $staff = User::factory()->admin()->withRole('staff')->create();
        $staff->permissions()->sync(Permission::query()->where('key', 'staff.view')->pluck('id'));
        $user = User::factory()->create();

        $response = $this->actingAs($staff, 'sanctum')->patchJson("/api/users/{$user->id}/unlock");

        $response->assertStatus(403);
    }

    public function test_staff_with_users_manage_permission_can_unlock(): void
    {
        $staff = User::factory()->admin()->withRole('staff')->create();
        $staff->permissions()->sync(Permission::query()->where('key', 'users.manage')->pluck('id'));
        $user = User::factory()->create(['requires_admin_unlock' => true]);

        $response = $this->actingAs($staff, 'sanctum')->patchJson("/api/users/{$user->id}/unlock");

        $response->assertOk();
        $this->assertFalse($user->fresh()->requires_admin_unlock);
    }

    public function test_vendor_cannot_unlock_an_account(): void
    {
        $vendor = User::factory()->create(['user_type' => UserType::StoreOwner]);
        $user = User::factory()->create();

        $response = $this->actingAs($vendor, 'sanctum')->patchJson("/api/users/{$user->id}/unlock");

        $response->assertStatus(403);
    }

    public function test_guest_cannot_unlock_an_account(): void
    {
        $user = User::factory()->create();

        $this->patchJson("/api/users/{$user->id}/unlock")->assertStatus(401);
    }
}
