<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\ProductUnit;
use Illuminate\Database\Seeder;

class ProductUnitSeeder extends Seeder
{
    public function run(): void
    {
        $units = [
            ['name' => 'Piece', 'abbreviation' => 'pc'],
            ['name' => 'Bag', 'abbreviation' => 'bag'],
            ['name' => 'Box', 'abbreviation' => 'box'],
            ['name' => 'Pack', 'abbreviation' => 'pack'],
            ['name' => 'Bundle', 'abbreviation' => 'bdl'],
            ['name' => 'Roll', 'abbreviation' => 'roll'],
            ['name' => 'Meter', 'abbreviation' => 'm'],
            ['name' => 'Square Meter', 'abbreviation' => 'm²'],
            ['name' => 'Kilogram', 'abbreviation' => 'kg'],
            ['name' => 'Ton', 'abbreviation' => 't'],
            ['name' => 'Liter', 'abbreviation' => 'L'],
            ['name' => 'Bucket', 'abbreviation' => 'bkt'],
            ['name' => 'Pallet', 'abbreviation' => 'plt'],
            ['name' => 'Carton', 'abbreviation' => 'ctn'],
            ['name' => 'Set', 'abbreviation' => 'set'],
            ['name' => 'Pair', 'abbreviation' => 'pr'],
            ['name' => 'Gallon', 'abbreviation' => 'gal'],
            ['name' => 'Sheet', 'abbreviation' => 'sht'],
            ['name' => 'Length', 'abbreviation' => 'len'],
            ['name' => 'Coil', 'abbreviation' => 'coil'],
            ['name' => 'Drum', 'abbreviation' => 'drum'],
            ['name' => 'Sack', 'abbreviation' => 'sack'],
        ];

        foreach ($units as $unit) {
            ProductUnit::query()->updateOrCreate(
                ['name' => $unit['name']],
                [
                    'abbreviation' => $unit['abbreviation'],
                    'is_active' => true,
                ],
            );
        }
    }
}
