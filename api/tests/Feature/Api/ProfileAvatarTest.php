<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileAvatarTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
    }

    public function test_guest_cannot_upload_avatar(): void
    {
        $this->postJson('/api/profile/avatar', [
            'avatar' => UploadedFile::fake()->image('avatar.jpg'),
        ])->assertStatus(401);
    }

    public function test_user_can_upload_an_avatar(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/profile/avatar', [
            'avatar' => UploadedFile::fake()->image('avatar.jpg'),
        ]);

        $response->assertOk();
        $this->assertNotNull($response->json('data.avatar_url'));
        $this->assertNotNull($user->fresh()->avatar_url);
    }

    public function test_uploading_a_new_avatar_replaces_the_old_file(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')->postJson('/api/profile/avatar', [
            'avatar' => UploadedFile::fake()->image('first.jpg'),
        ])->assertOk();

        $firstPath = str($user->fresh()->avatar_url)->after('/storage/')->toString();
        Storage::disk('public')->assertExists($firstPath);

        $this->actingAs($user, 'sanctum')->postJson('/api/profile/avatar', [
            'avatar' => UploadedFile::fake()->image('second.jpg'),
        ])->assertOk();

        Storage::disk('public')->assertMissing($firstPath);

        $secondPath = str($user->fresh()->avatar_url)->after('/storage/')->toString();
        Storage::disk('public')->assertExists($secondPath);
    }

    public function test_non_image_file_is_rejected(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/profile/avatar', [
            'avatar' => UploadedFile::fake()->create('document.pdf', 100),
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['avatar']);
    }

    public function test_oversized_file_is_rejected(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/profile/avatar', [
            'avatar' => UploadedFile::fake()->image('avatar.jpg')->size(3000),
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['avatar']);
    }
}
