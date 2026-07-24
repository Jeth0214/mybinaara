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
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StoreLogoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class, PermissionSeeder::class, RolePermissionSeeder::class]);
        Storage::fake('public');
    }

    public function test_guest_cannot_upload_logo(): void
    {
        $store = Store::factory()->create();

        $this->postJson("/api/stores/{$store->id}/logo", [
            'logo' => UploadedFile::fake()->image('logo.png'),
        ])->assertStatus(401);
    }

    public function test_non_admin_cannot_upload_logo(): void
    {
        $store = Store::factory()->create();
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')->postJson("/api/stores/{$store->id}/logo", [
            'logo' => UploadedFile::fake()->image('logo.png'),
        ])->assertStatus(403);
    }

    public function test_admin_can_upload_logo(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->postJson("/api/stores/{$store->id}/logo", [
            'logo' => UploadedFile::fake()->image('logo.png'),
        ]);

        $response->assertOk();

        $store->refresh();
        $this->assertNotNull($store->logo_url);

        $path = str_replace(Storage::disk('public')->url(''), '', $store->logo_url);
        Storage::disk('public')->assertExists($path);
    }

    public function test_store_owner_can_upload_logo(): void
    {
        $store = Store::factory()->active()->create();
        $owner = User::factory()->create(['user_type' => UserType::StoreOwner]);
        $store->users()->attach($owner->id, ['role' => StoreUserRole::Owner->value]);

        $response = $this->actingAs($owner, 'sanctum')->postJson("/api/stores/{$store->id}/logo", [
            'logo' => UploadedFile::fake()->image('logo.png'),
        ]);

        $response->assertOk();
        $store->refresh();
        $this->assertNotNull($store->logo_url);
    }

    public function test_store_staff_can_upload_logo(): void
    {
        $store = Store::factory()->active()->create();
        $staff = User::factory()->create(['user_type' => UserType::StoreStaff]);
        $store->users()->attach($staff->id, ['role' => StoreUserRole::Staff->value]);

        $response = $this->actingAs($staff, 'sanctum')->postJson("/api/stores/{$store->id}/logo", [
            'logo' => UploadedFile::fake()->image('logo.png'),
        ]);

        $response->assertOk();
        $store->refresh();
        $this->assertNotNull($store->logo_url);
    }

    public function test_unrelated_vendor_cannot_upload_logo_for_another_store(): void
    {
        $store = Store::factory()->create();
        $otherStore = Store::factory()->active()->create();
        $otherOwner = User::factory()->create(['user_type' => UserType::StoreOwner]);
        $otherStore->users()->attach($otherOwner->id, ['role' => StoreUserRole::Owner->value]);

        $this->actingAs($otherOwner, 'sanctum')->postJson("/api/stores/{$store->id}/logo", [
            'logo' => UploadedFile::fake()->image('logo.png'),
        ])->assertStatus(403);
    }

    public function test_invalid_mime_type_is_rejected(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->postJson("/api/stores/{$store->id}/logo", [
            'logo' => UploadedFile::fake()->create('document.pdf', 100, 'application/pdf'),
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('logo');
    }

    public function test_oversized_file_is_rejected(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->postJson("/api/stores/{$store->id}/logo", [
            'logo' => UploadedFile::fake()->create('logo.jpg', 3000, 'image/jpeg'),
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('logo');
    }

    public function test_reuploading_deletes_the_previous_file(): void
    {
        $admin = User::factory()->admin()->create();
        $store = Store::factory()->create();

        $this->actingAs($admin, 'sanctum')->postJson("/api/stores/{$store->id}/logo", [
            'logo' => UploadedFile::fake()->image('first.png'),
        ])->assertOk();

        $store->refresh();
        $firstPath = str_replace(Storage::disk('public')->url(''), '', $store->logo_url);
        Storage::disk('public')->assertExists($firstPath);

        $this->actingAs($admin, 'sanctum')->postJson("/api/stores/{$store->id}/logo", [
            'logo' => UploadedFile::fake()->image('second.png'),
        ])->assertOk();

        Storage::disk('public')->assertMissing($firstPath);
    }
}
