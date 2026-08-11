<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Models\Permission;
use App\Models\Product;
use App\Models\ProductUnit;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductUnitTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class, PermissionSeeder::class, RolePermissionSeeder::class]);
    }

    public function test_anyone_can_list_product_units(): void
    {
        ProductUnit::factory()->count(3)->create();

        $response = $this->getJson('/api/product-units');

        $response->assertOk()->assertJsonCount(3, 'data');
    }

    public function test_product_units_can_be_filtered_by_active_status(): void
    {
        ProductUnit::factory()->create(['is_active' => true]);
        ProductUnit::factory()->create(['is_active' => false]);

        $response = $this->getJson('/api/product-units?is_active=0');

        $response->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_anyone_can_view_a_single_product_unit(): void
    {
        $unit = ProductUnit::factory()->create();

        $response = $this->getJson("/api/product-units/{$unit->id}");

        $response->assertOk()->assertJsonPath('data.name', $unit->name);
    }

    public function test_viewing_a_missing_product_unit_returns_404(): void
    {
        $response = $this->getJson('/api/product-units/999999');

        $response->assertStatus(404);
    }

    public function test_active_endpoint_only_returns_active_units_ordered_alphabetically(): void
    {
        ProductUnit::factory()->create(['name' => 'Zebra', 'is_active' => true]);
        ProductUnit::factory()->create(['name' => 'Alpha', 'is_active' => true]);
        ProductUnit::factory()->create(['name' => 'Hidden', 'is_active' => false]);

        $response = $this->getJson('/api/product-units/active');

        $response->assertOk()->assertJsonCount(2, 'data');
        $response->assertJsonPath('data.0.name', 'Alpha');
        $response->assertJsonPath('data.1.name', 'Zebra');
    }

    public function test_listing_product_units_includes_products_count(): void
    {
        $unit = ProductUnit::factory()->create();
        Product::factory()->count(2)->create(['unit_id' => $unit->id]);
        $unused = ProductUnit::factory()->create();

        $response = $this->getJson('/api/product-units');

        $response->assertOk();
        $byId = collect($response->json('data'))->keyBy('id');
        $this->assertSame(2, $byId[$unit->id]['products_count']);
        $this->assertSame(0, $byId[$unused->id]['products_count']);
    }

    public function test_guest_cannot_create_product_unit(): void
    {
        $response = $this->postJson('/api/product-units', ['name' => 'Bag']);

        $response->assertStatus(401);
    }

    public function test_non_admin_cannot_create_product_unit(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/product-units', ['name' => 'Bag']);

        $response->assertStatus(403);
    }

    public function test_admin_can_create_product_unit(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/product-units', [
            'name' => 'Bag',
            'abbreviation' => 'bag',
        ]);

        $response->assertStatus(201)->assertJsonPath('data.name', 'Bag');
        $this->assertDatabaseHas('product_units', ['name' => 'Bag']);
    }

    public function test_creating_product_unit_requires_name(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/product-units', []);

        $response->assertStatus(422)->assertJsonValidationErrors(['name']);
    }

    public function test_creating_product_unit_rejects_duplicate_name(): void
    {
        $admin = User::factory()->admin()->create();
        ProductUnit::factory()->create(['name' => 'Bag']);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/product-units', ['name' => 'Bag']);

        $response->assertStatus(422)->assertJsonValidationErrors(['name']);
    }

    public function test_admin_can_update_product_unit(): void
    {
        $admin = User::factory()->admin()->create();
        $unit = ProductUnit::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/product-units/{$unit->id}", ['name' => 'Updated Unit']);

        $response->assertOk()->assertJsonPath('data.name', 'Updated Unit');
    }

    public function test_non_admin_cannot_update_product_unit(): void
    {
        $user = User::factory()->create();
        $unit = ProductUnit::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->patchJson("/api/product-units/{$unit->id}", ['name' => 'Updated Unit']);

        $response->assertStatus(403);
    }

    public function test_admin_can_delete_product_unit(): void
    {
        $admin = User::factory()->admin()->create();
        $unit = ProductUnit::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->deleteJson("/api/product-units/{$unit->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('product_units', ['id' => $unit->id]);
    }

    public function test_non_admin_cannot_delete_product_unit(): void
    {
        $user = User::factory()->create();
        $unit = ProductUnit::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/product-units/{$unit->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('product_units', ['id' => $unit->id]);
    }

    public function test_deleting_a_product_unit_in_use_is_blocked(): void
    {
        $admin = User::factory()->admin()->create();
        $unit = ProductUnit::factory()->create();
        Product::factory()->create(['unit_id' => $unit->id]);

        $response = $this->actingAs($admin, 'sanctum')->deleteJson("/api/product-units/{$unit->id}");

        $response->assertStatus(409);
        $this->assertDatabaseHas('product_units', ['id' => $unit->id]);
    }

    /**
     * Proves product unit writes are gated on their own distinct
     * product_units.* permissions rather than user_type alone.
     */
    public function test_admin_with_limited_role_cannot_write_product_units(): void
    {
        $limitedAdmin = User::factory()->admin()->withRole('staff')->create();
        $limitedAdmin->permissions()->sync(Permission::query()->where('key', 'product_units.view')->pluck('id'));
        $unit = ProductUnit::factory()->create();

        $this->actingAs($limitedAdmin, 'sanctum')
            ->postJson('/api/product-units', ['name' => 'Bag'])
            ->assertStatus(403);

        $this->actingAs($limitedAdmin, 'sanctum')
            ->patchJson("/api/product-units/{$unit->id}", ['name' => 'Updated'])
            ->assertStatus(403);

        $this->actingAs($limitedAdmin, 'sanctum')
            ->deleteJson("/api/product-units/{$unit->id}")
            ->assertStatus(403);
    }

    public function test_product_units_create_permission_does_not_grant_edit_or_delete(): void
    {
        $creator = User::factory()->admin()->withRole('staff')->create();
        $creator->permissions()->sync(Permission::query()->where('key', 'product_units.create')->pluck('id'));
        $unit = ProductUnit::factory()->create();

        $this->actingAs($creator, 'sanctum')
            ->postJson('/api/product-units', ['name' => 'Bag'])
            ->assertStatus(201);

        $this->actingAs($creator, 'sanctum')
            ->patchJson("/api/product-units/{$unit->id}", ['name' => 'Updated'])
            ->assertStatus(403);

        $this->actingAs($creator, 'sanctum')
            ->deleteJson("/api/product-units/{$unit->id}")
            ->assertStatus(403);
    }

    public function test_product_units_edit_permission_allows_update_not_delete(): void
    {
        $editor = User::factory()->admin()->withRole('staff')->create();
        $editor->permissions()->sync(Permission::query()->where('key', 'product_units.edit')->pluck('id'));
        $unit = ProductUnit::factory()->create();

        $this->actingAs($editor, 'sanctum')
            ->patchJson("/api/product-units/{$unit->id}", ['name' => 'Updated Unit'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Updated Unit');

        $this->actingAs($editor, 'sanctum')
            ->deleteJson("/api/product-units/{$unit->id}")
            ->assertStatus(403);
    }

    public function test_product_units_delete_permission_allows_delete_not_edit(): void
    {
        $deleter = User::factory()->admin()->withRole('staff')->create();
        $deleter->permissions()->sync(Permission::query()->where('key', 'product_units.delete')->pluck('id'));
        $unit = ProductUnit::factory()->create();

        $this->actingAs($deleter, 'sanctum')
            ->patchJson("/api/product-units/{$unit->id}", ['name' => 'Updated Unit'])
            ->assertStatus(403);

        $this->actingAs($deleter, 'sanctum')
            ->deleteJson("/api/product-units/{$unit->id}")
            ->assertStatus(204);
        $this->assertDatabaseMissing('product_units', ['id' => $unit->id]);
    }
}
