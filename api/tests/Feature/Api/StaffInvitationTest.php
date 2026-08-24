<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Mail\StaffInvitationMail;
use App\Models\StaffInvitationToken;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Tests\TestCase;

class StaffInvitationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class, PermissionSeeder::class, RolePermissionSeeder::class]);
    }

    public function test_creating_staff_sends_an_invitation_instead_of_a_usable_password(): void
    {
        Mail::fake();
        $administrator = User::factory()->admin()->create();

        $response = $this->actingAs($administrator, 'sanctum')->postJson('/api/staff', [
            'name' => 'Jane Doe',
            'email' => 'jane@mybinaara.com',
            'phone' => '0530000002',
            'permissions' => ['catalog.view'],
        ]);

        $response->assertStatus(201);

        Mail::assertQueued(StaffInvitationMail::class, fn ($mail) => $mail->hasTo('jane@mybinaara.com'));

        $staff = User::query()->where('email', 'jane@mybinaara.com')->firstOrFail();
        $this->assertFalse(Hash::check('password', $staff->password));
        $this->assertDatabaseHas('staff_invitation_tokens', ['user_id' => $staff->id, 'accepted_at' => null]);

        $this->postJson('/api/login', [
            'email' => 'jane@mybinaara.com',
            'password' => 'anything-guessed',
            'device_name' => 'test',
        ])->assertStatus(401);
    }

    public function test_accepting_a_valid_invitation_sets_password_and_returns_a_token(): void
    {
        Mail::fake();
        $administrator = User::factory()->admin()->create();

        $this->actingAs($administrator, 'sanctum')->postJson('/api/staff', [
            'name' => 'Jane Doe',
            'email' => 'jane@mybinaara.com',
            'phone' => '0530000002',
            'permissions' => ['catalog.view'],
        ])->assertStatus(201);

        $rawToken = null;
        Mail::assertQueued(StaffInvitationMail::class, function ($mail) use (&$rawToken) {
            $rawToken = Str::of($mail->invitationUrl)->after('token=')->toString();

            return true;
        });

        $response = $this->postJson('/api/staff/accept-invite', [
            'token' => $rawToken,
            'new_password' => 'BrandNewPassword1',
            'new_password_confirmation' => 'BrandNewPassword1',
        ]);

        $response->assertOk()->assertJsonStructure(['user', 'token']);

        $this->postJson('/api/login', [
            'email' => 'jane@mybinaara.com',
            'password' => 'BrandNewPassword1',
            'device_name' => 'test',
        ])->assertOk();
    }

    public function test_expired_invitation_is_rejected(): void
    {
        $staff = User::factory()->admin()->withRole('staff')->create();

        $token = StaffInvitationToken::query()->create([
            'user_id' => $staff->id,
            'token_hash' => hash('sha256', 'raw-token'),
            'expires_at' => now()->subDay(),
        ]);

        $response = $this->postJson('/api/staff/accept-invite', [
            'token' => 'raw-token',
            'new_password' => 'BrandNewPassword1',
            'new_password_confirmation' => 'BrandNewPassword1',
        ]);

        $response->assertStatus(410);
        $this->assertNull($token->fresh()->accepted_at);
    }

    public function test_already_accepted_invitation_is_rejected(): void
    {
        $staff = User::factory()->admin()->withRole('staff')->create();

        StaffInvitationToken::query()->create([
            'user_id' => $staff->id,
            'token_hash' => hash('sha256', 'raw-token'),
            'expires_at' => now()->addDays(7),
            'accepted_at' => now(),
        ]);

        $response = $this->postJson('/api/staff/accept-invite', [
            'token' => 'raw-token',
            'new_password' => 'BrandNewPassword1',
            'new_password_confirmation' => 'BrandNewPassword1',
        ]);

        $response->assertStatus(409);
    }

    public function test_invalid_invitation_token_is_rejected(): void
    {
        $response = $this->postJson('/api/staff/accept-invite', [
            'token' => 'does-not-exist',
            'new_password' => 'BrandNewPassword1',
            'new_password_confirmation' => 'BrandNewPassword1',
        ]);

        $response->assertStatus(404);
    }
}
