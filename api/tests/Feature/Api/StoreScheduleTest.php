<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Enums\StoreUserRole;
use App\Enums\UserType;
use App\Models\Store;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StoreScheduleTest extends TestCase
{
    use RefreshDatabase;

    private const DAYS = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class, PermissionSeeder::class, RolePermissionSeeder::class]);
    }

    private function fullWeekPayload(array $overridesByDay = []): array
    {
        $entries = [];

        foreach (self::DAYS as $day) {
            $entries[] = $overridesByDay[$day] ?? [
                'day' => $day,
                'open_time' => '08:00 AM',
                'close_time' => '10:00 PM',
                'is_off' => false,
            ];
        }

        return ['schedule' => $entries];
    }

    public function test_guest_cannot_update_schedule(): void
    {
        $store = Store::factory()->create();

        $this->putJson("/api/stores/{$store->id}/schedule", $this->fullWeekPayload())->assertStatus(401);
    }

    public function test_unrelated_user_cannot_update_schedule(): void
    {
        $store = Store::factory()->create();
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->putJson("/api/stores/{$store->id}/schedule", $this->fullWeekPayload())
            ->assertStatus(403);
    }

    public function test_store_owner_can_update_schedule(): void
    {
        $store = Store::factory()->active()->create();
        $owner = User::factory()->create(['user_type' => UserType::StoreOwner]);
        $store->users()->attach($owner->id, ['role' => StoreUserRole::Owner->value]);

        $response = $this->actingAs($owner, 'sanctum')
            ->putJson("/api/stores/{$store->id}/schedule", $this->fullWeekPayload());

        $response->assertOk()->assertJsonCount(7, 'data.schedule');
    }

    public function test_store_staff_can_update_schedule(): void
    {
        $store = Store::factory()->active()->create();
        $staff = User::factory()->create(['user_type' => UserType::StoreStaff]);
        $store->users()->attach($staff->id, ['role' => StoreUserRole::Staff->value]);

        $response = $this->actingAs($staff, 'sanctum')
            ->putJson("/api/stores/{$store->id}/schedule", $this->fullWeekPayload());

        $response->assertOk()->assertJsonCount(7, 'data.schedule');
    }

    public function test_admin_can_update_schedule(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/stores/{$store->id}/schedule", $this->fullWeekPayload());

        $response->assertOk()->assertJsonCount(7, 'data.schedule');

        $this->assertDatabaseHas('store_schedules', [
            'store_id' => $store->id,
            'day' => 'sat',
            'open_time' => '08:00 AM',
            'close_time' => '10:00 PM',
            'is_off' => false,
        ]);
    }

    public function test_missing_a_day_is_rejected(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create();

        $payload = $this->fullWeekPayload();
        array_pop($payload['schedule']);

        $response = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/stores/{$store->id}/schedule", $payload);

        $response->assertStatus(422);
    }

    public function test_duplicate_day_is_rejected(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create();

        $payload = $this->fullWeekPayload();
        $payload['schedule'][6] = $payload['schedule'][0];

        $response = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/stores/{$store->id}/schedule", $payload);

        $response->assertStatus(422);
    }

    public function test_non_off_day_requires_open_and_close_time(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create();

        $payload = $this->fullWeekPayload();
        $payload['schedule'][0]['open_time'] = null;
        $payload['schedule'][0]['close_time'] = null;

        $response = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/stores/{$store->id}/schedule", $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['schedule.0.open_time', 'schedule.0.close_time']);
    }

    public function test_is_off_day_accepted_without_times(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create();

        $payload = $this->fullWeekPayload();
        $payload['schedule'][0] = ['day' => 'sat', 'open_time' => null, 'close_time' => null, 'is_off' => true];

        $response = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/stores/{$store->id}/schedule", $payload);

        $response->assertOk();

        $this->assertDatabaseHas('store_schedules', [
            'store_id' => $store->id,
            'day' => 'sat',
            'open_time' => null,
            'close_time' => null,
            'is_off' => true,
        ]);
    }
}
