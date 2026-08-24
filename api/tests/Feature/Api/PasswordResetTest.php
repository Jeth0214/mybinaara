<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Enums\UserStatus;
use App\Models\User;
use App\Models\UserPasswordResetToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    private const RAW_TOKEN = 'a-known-raw-reset-token';

    private const OLD_PASSWORD = 'OldPass123!';

    public function test_forgot_password_returns_generic_success_for_an_existing_email(): void
    {
        Mail::fake();

        $user = User::factory()->create(['status' => UserStatus::Active, 'password' => self::OLD_PASSWORD]);

        $response = $this->postJson('/api/forgot-password', ['email' => $user->email]);

        $response->assertOk()->assertJsonStructure(['message']);
        $this->assertDatabaseCount('user_password_reset_tokens', 1);
        $this->assertSame($user->id, UserPasswordResetToken::query()->first()->user_id);
    }

    public function test_forgot_password_requires_a_valid_email_format(): void
    {
        Mail::fake();

        $this->postJson('/api/forgot-password', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        $this->postJson('/api/forgot-password', ['email' => 'not-an-email'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        $this->assertDatabaseCount('user_password_reset_tokens', 0);
    }

    public function test_forgot_password_returns_the_same_generic_success_for_an_unknown_email(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/forgot-password', ['email' => 'nobody@example.com']);

        $response->assertOk()->assertJsonStructure(['message']);
        $this->assertDatabaseCount('user_password_reset_tokens', 0);
    }

    public function test_forgot_password_replaces_any_previous_unused_token(): void
    {
        Mail::fake();

        $user = User::factory()->create(['status' => UserStatus::Active]);
        $this->createToken($user);

        $this->postJson('/api/forgot-password', ['email' => $user->email]);

        $this->assertDatabaseCount('user_password_reset_tokens', 1);
        $this->assertNotSame(
            hash('sha256', self::RAW_TOKEN),
            UserPasswordResetToken::query()->first()->token_hash
        );
    }

    public function test_forgot_password_is_rate_limited(): void
    {
        Mail::fake();

        $user = User::factory()->create(['status' => UserStatus::Active]);

        for ($i = 0; $i < 3; $i++) {
            $this->postJson('/api/forgot-password', ['email' => $user->email])->assertOk();
        }

        $this->postJson('/api/forgot-password', ['email' => $user->email])->assertStatus(429);
    }

    public function test_user_can_reset_password_with_a_valid_token(): void
    {
        $user = $this->createUserWithToken();

        $response = $this->postJson('/api/reset-password', [
            'token' => self::RAW_TOKEN,
            'email' => $user->email,
            'password' => 'BrandNewPass456!',
            'password_confirmation' => 'BrandNewPass456!',
        ]);

        $response->assertOk()->assertJsonStructure(['message']);

        $this->assertTrue(Hash::check('BrandNewPass456!', $user->fresh()->password));
        $this->assertFalse(Hash::check(self::OLD_PASSWORD, $user->fresh()->password));
        $this->assertNotNull(UserPasswordResetToken::query()->first()->used_at);
    }

    public function test_reset_password_revokes_all_existing_tokens(): void
    {
        $user = $this->createUserWithToken();
        $user->createToken('device-1');
        $user->createToken('device-2');

        $this->assertDatabaseCount('personal_access_tokens', 2);

        $this->postJson('/api/reset-password', [
            'token' => self::RAW_TOKEN,
            'email' => $user->email,
            'password' => 'BrandNewPass456!',
            'password_confirmation' => 'BrandNewPass456!',
        ])->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_reset_password_fails_with_an_invalid_token(): void
    {
        $user = User::factory()->create(['status' => UserStatus::Active]);

        $response = $this->postJson('/api/reset-password', [
            'token' => 'not-a-real-token',
            'email' => $user->email,
            'password' => 'BrandNewPass456!',
            'password_confirmation' => 'BrandNewPass456!',
        ]);

        $response->assertStatus(404);
    }

    public function test_reset_password_fails_with_an_expired_token(): void
    {
        $user = $this->createUserWithToken(expiresAt: now()->subMinute());

        $response = $this->postJson('/api/reset-password', [
            'token' => self::RAW_TOKEN,
            'email' => $user->email,
            'password' => 'BrandNewPass456!',
            'password_confirmation' => 'BrandNewPass456!',
        ]);

        $response->assertStatus(410);
    }

    public function test_reset_password_fails_with_an_already_used_token(): void
    {
        $user = $this->createUserWithToken(usedAt: now());

        $response = $this->postJson('/api/reset-password', [
            'token' => self::RAW_TOKEN,
            'email' => $user->email,
            'password' => 'BrandNewPass456!',
            'password_confirmation' => 'BrandNewPass456!',
        ]);

        $response->assertStatus(409);
    }

    public function test_reset_password_fails_when_email_does_not_match_the_token(): void
    {
        $this->createUserWithToken();

        $response = $this->postJson('/api/reset-password', [
            'token' => self::RAW_TOKEN,
            'email' => 'someone-else@example.com',
            'password' => 'BrandNewPass456!',
            'password_confirmation' => 'BrandNewPass456!',
        ]);

        $response->assertStatus(401);
    }

    public function test_reset_password_requires_token_email_and_password(): void
    {
        $response = $this->postJson('/api/reset-password', []);

        $response->assertStatus(422)->assertJsonValidationErrors(['token', 'email', 'password']);
    }

    private function createToken(User $user, ?Carbon $expiresAt = null, ?Carbon $usedAt = null): UserPasswordResetToken
    {
        return UserPasswordResetToken::query()->create([
            'user_id' => $user->id,
            'token_hash' => hash('sha256', self::RAW_TOKEN),
            'expires_at' => $expiresAt ?? now()->addMinutes(60),
            'used_at' => $usedAt,
        ]);
    }

    private function createUserWithToken(?Carbon $expiresAt = null, ?Carbon $usedAt = null): User
    {
        $user = User::factory()->create(['status' => UserStatus::Active, 'password' => self::OLD_PASSWORD]);
        $this->createToken($user, $expiresAt, $usedAt);

        return $user;
    }
}
