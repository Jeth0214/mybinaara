<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RegionSeeder extends Seeder
{
    public function run(): void
    {
        $regions = json_decode(
            file_get_contents(database_path('data/regions.json')),
            associative: true,
            flags: JSON_THROW_ON_ERROR,
        );

        foreach ($regions as $region) {
            // Raw query builder, not the Region model: seeding reference data by its
            // source region_id, which isn't mass-assignable through the model's fillable list.
            DB::table('regions')->updateOrInsert(
                ['id' => $region['region_id']],
                [
                    'code' => $region['code'],
                    'name_ar' => $region['name_ar'],
                    'name_en' => $region['name_en'],
                ],
            );
        }
    }
}
