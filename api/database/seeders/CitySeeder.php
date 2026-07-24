<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CitySeeder extends Seeder
{
    public function run(): void
    {
        $cities = json_decode(
            file_get_contents(database_path('data/cities.json')),
            associative: true,
            flags: JSON_THROW_ON_ERROR,
        );

        foreach ($cities as $city) {
            DB::table('cities')->updateOrInsert(
                ['id' => $city['city_id']],
                [
                    'region_id' => $city['region_id'],
                    'name_ar' => $city['name_ar'],
                    'name_en' => $city['name_en'],
                ],
            );
        }
    }
}
