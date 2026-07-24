<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Models\City;
use App\Models\District;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DistrictTest extends TestCase
{
    use RefreshDatabase;

    public function test_anyone_can_list_districts(): void
    {
        District::factory()->count(3)->create();

        $response = $this->getJson('/api/districts');

        $response->assertOk()->assertJsonCount(3, 'data');
    }

    public function test_districts_can_be_filtered_by_city(): void
    {
        $city = City::factory()->create();
        District::factory()->count(2)->create(['city_id' => $city->id, 'region_id' => $city->region_id]);
        District::factory()->count(3)->create();

        $response = $this->getJson("/api/districts?city_id={$city->id}");

        $response->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_anyone_can_view_a_single_district(): void
    {
        $district = District::factory()->create(['name_en' => 'Al Olaya']);

        $response = $this->getJson("/api/districts/{$district->id}");

        $response->assertOk()->assertJsonPath('data.name_en', 'Al Olaya');
    }

    public function test_viewing_a_missing_district_returns_404(): void
    {
        $response = $this->getJson('/api/districts/999999');

        $response->assertStatus(404);
    }
}
