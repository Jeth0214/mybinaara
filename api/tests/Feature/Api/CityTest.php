<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Models\City;
use App\Models\Region;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CityTest extends TestCase
{
    use RefreshDatabase;

    public function test_anyone_can_list_cities(): void
    {
        City::factory()->count(3)->create();

        $response = $this->getJson('/api/cities');

        $response->assertOk()->assertJsonCount(3, 'data');
    }

    public function test_cities_can_be_filtered_by_region(): void
    {
        $region = Region::factory()->create();
        City::factory()->count(2)->create(['region_id' => $region->id]);
        City::factory()->count(3)->create();

        $response = $this->getJson("/api/cities?region_id={$region->id}");

        $response->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_anyone_can_view_a_single_city(): void
    {
        $city = City::factory()->create(['name_en' => 'Riyadh']);

        $response = $this->getJson("/api/cities/{$city->id}");

        $response->assertOk()->assertJsonPath('data.name_en', 'Riyadh');
    }

    public function test_viewing_a_missing_city_returns_404(): void
    {
        $response = $this->getJson('/api/cities/999999');

        $response->assertStatus(404);
    }
}
