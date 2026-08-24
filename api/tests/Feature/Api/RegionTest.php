<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use Database\Seeders\RegionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RegionSeeder::class);
    }

    public function test_anyone_can_list_all_regions(): void
    {
        $response = $this->getJson('/api/regions');

        $response->assertOk()->assertJsonCount(13, 'data');
    }

    public function test_anyone_can_view_a_single_region(): void
    {
        $response = $this->getJson('/api/regions/1');

        $response->assertOk()
            ->assertJsonPath('data.id', 1)
            ->assertJsonPath('data.code', 'RD')
            ->assertJsonPath('data.name_en', 'Riyadh');
    }

    public function test_viewing_a_missing_region_returns_404(): void
    {
        $response = $this->getJson('/api/regions/999');

        $response->assertStatus(404);
    }
}
