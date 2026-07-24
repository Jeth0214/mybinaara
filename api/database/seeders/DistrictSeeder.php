<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DistrictSeeder extends Seeder
{
    public function run(): void
    {
        $districts = json_decode(
            file_get_contents(database_path('data/districts.json')),
            associative: true,
            flags: JSON_THROW_ON_ERROR,
        );

        foreach ($districts as $district) {
            DB::table('districts')->updateOrInsert(
                ['id' => $district['district_id']],
                [
                    'city_id' => $district['city_id'],
                    'region_id' => $district['region_id'],
                    'name_ar' => $district['name_ar'],
                    'name_en' => $district['name_en'],
                ],
            );
        }
    }
}
