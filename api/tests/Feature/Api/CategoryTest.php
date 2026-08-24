<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Models\Category;
use App\Models\Permission;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Needed so the ->admin() factory state (User::factory()->admin())
        // actually resolves to a role carrying real permissions.
        $this->seed([RoleSeeder::class, PermissionSeeder::class, RolePermissionSeeder::class]);
    }

    public function test_anyone_can_list_categories(): void
    {
        Category::factory()->count(3)->create();

        $response = $this->getJson('/api/categories');

        $response->assertOk()->assertJsonCount(3, 'data');
    }

    public function test_categories_can_be_filtered_by_active_status(): void
    {
        Category::factory()->create(['is_active' => true]);
        Category::factory()->create(['is_active' => false]);

        $response = $this->getJson('/api/categories?is_active=0');

        $response->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_anyone_can_view_a_single_category(): void
    {
        $category = Category::factory()->create();

        $response = $this->getJson("/api/categories/{$category->id}");

        $response->assertOk()->assertJsonPath('data.slug', $category->slug);
    }

    public function test_viewing_a_missing_category_returns_404(): void
    {
        $response = $this->getJson('/api/categories/999999');

        $response->assertStatus(404);
    }

    public function test_guest_cannot_create_category(): void
    {
        $response = $this->postJson('/api/categories', [
            'name' => 'Adhesives',
            'slug' => 'adhesives',
        ]);

        $response->assertStatus(401);
    }

    public function test_non_admin_cannot_create_category(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/categories', [
            'name' => 'Adhesives',
            'slug' => 'adhesives',
        ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_create_category(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/categories', [
            'name' => 'Adhesives',
            'slug' => 'adhesives',
            'description' => 'Glues and sealants',
        ]);

        $response->assertStatus(201)->assertJsonPath('data.slug', 'adhesives');
        $this->assertDatabaseHas('categories', ['slug' => 'adhesives']);
    }

    public function test_creating_category_requires_name_and_slug(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/categories', []);

        $response->assertStatus(422)->assertJsonValidationErrors(['name', 'slug']);
    }

    public function test_creating_category_rejects_duplicate_slug(): void
    {
        $admin = User::factory()->admin()->create();
        Category::factory()->create(['slug' => 'adhesives']);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/categories', [
            'name' => 'Adhesives Again',
            'slug' => 'adhesives',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors(['slug']);
    }

    public function test_admin_can_update_category(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/categories/{$category->id}", ['name' => 'Updated Name']);

        $response->assertOk()->assertJsonPath('data.name', 'Updated Name');
    }

    public function test_non_admin_cannot_update_category(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->patchJson("/api/categories/{$category->id}", ['name' => 'Updated Name']);

        $response->assertStatus(403);
    }

    public function test_admin_can_delete_category(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->deleteJson("/api/categories/{$category->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }

    public function test_non_admin_cannot_delete_category(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/categories/{$category->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('categories', ['id' => $category->id]);
    }

    public function test_admin_can_toggle_category_status(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::factory()->create(['is_active' => true]);

        $response = $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/categories/{$category->id}/toggle-status");

        $response->assertOk()->assertJsonPath('data.is_active', false);
    }

    /**
     * Proves category writes are gated on the catalog.manage permission, not
     * just user_type === admin: this staff account is only granted
     * catalog.view and must still be rejected here.
     */
    public function test_admin_with_limited_role_cannot_write_categories(): void
    {
        $limitedAdmin = User::factory()->admin()->withRole('staff')->create();
        $limitedAdmin->permissions()->sync(Permission::query()->where('key', 'catalog.view')->pluck('id'));
        $category = Category::factory()->create(['is_active' => true]);

        $this->actingAs($limitedAdmin, 'sanctum')
            ->postJson('/api/categories', ['name' => 'Adhesives', 'slug' => 'adhesives'])
            ->assertStatus(403);

        $this->actingAs($limitedAdmin, 'sanctum')
            ->patchJson("/api/categories/{$category->id}", ['name' => 'Updated'])
            ->assertStatus(403);

        $this->actingAs($limitedAdmin, 'sanctum')
            ->deleteJson("/api/categories/{$category->id}")
            ->assertStatus(403);

        $this->actingAs($limitedAdmin, 'sanctum')
            ->patchJson("/api/categories/{$category->id}/toggle-status")
            ->assertStatus(403);
    }

    /**
     * Proves category writes are gated on their own distinct categories.*
     * permissions rather than all collapsing onto catalog.manage.
     */
    public function test_categories_create_permission_does_not_grant_edit_or_delete(): void
    {
        $creator = User::factory()->admin()->withRole('staff')->create();
        $creator->permissions()->sync(Permission::query()->where('key', 'categories.create')->pluck('id'));
        $category = Category::factory()->create();

        $this->actingAs($creator, 'sanctum')
            ->postJson('/api/categories', ['name' => 'Adhesives', 'slug' => 'adhesives'])
            ->assertStatus(201);

        $this->actingAs($creator, 'sanctum')
            ->patchJson("/api/categories/{$category->id}", ['name' => 'Updated'])
            ->assertStatus(403);

        $this->actingAs($creator, 'sanctum')
            ->deleteJson("/api/categories/{$category->id}")
            ->assertStatus(403);
    }

    public function test_categories_edit_permission_allows_update_not_delete(): void
    {
        $editor = User::factory()->admin()->withRole('staff')->create();
        $editor->permissions()->sync(Permission::query()->where('key', 'categories.edit')->pluck('id'));
        $category = Category::factory()->create();

        $this->actingAs($editor, 'sanctum')
            ->patchJson("/api/categories/{$category->id}", ['name' => 'Updated Name'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Updated Name');

        $this->actingAs($editor, 'sanctum')
            ->deleteJson("/api/categories/{$category->id}")
            ->assertStatus(403);
    }

    public function test_categories_delete_permission_allows_delete_not_edit(): void
    {
        $deleter = User::factory()->admin()->withRole('staff')->create();
        $deleter->permissions()->sync(Permission::query()->where('key', 'categories.delete')->pluck('id'));
        $category = Category::factory()->create();

        $this->actingAs($deleter, 'sanctum')
            ->patchJson("/api/categories/{$category->id}", ['name' => 'Updated Name'])
            ->assertStatus(403);

        $this->actingAs($deleter, 'sanctum')
            ->deleteJson("/api/categories/{$category->id}")
            ->assertStatus(204);
        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }
}
