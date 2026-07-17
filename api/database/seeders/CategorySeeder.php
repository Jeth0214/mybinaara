<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // Matches apps/store-web's PRODUCT_CATEGORIES exactly (name + icon file).
        // Slugs are set explicitly rather than via Str::slug(), which drops "&"
        // instead of expanding it to "and" and would otherwise mismatch the icon filenames.
        $categories = [
            ['name' => 'Building Materials', 'slug' => 'building-materials', 'image_url' => 'categories/building-materials.svg'],
            ['name' => 'Cement & Blocks', 'slug' => 'cement-and-blocks', 'image_url' => 'categories/cement-and-blocks.svg'],
            ['name' => 'Steel & Metal', 'slug' => 'steel-and-metal', 'image_url' => 'categories/steel-and-metal.svg'],
            ['name' => 'Doors & Windows', 'slug' => 'doors-and-windows', 'image_url' => 'categories/doors-and-windows.svg'],
            ['name' => 'Paint & Finishes', 'slug' => 'paints-and-finishes', 'image_url' => 'categories/paints-and-finishes.svg'],
            ['name' => 'Electrical', 'slug' => 'electrical', 'image_url' => 'categories/electrical.svg'],
            ['name' => 'Plumbing', 'slug' => 'plumbing', 'image_url' => 'categories/plumbing.svg'],
            ['name' => 'HVAC & Air Conditioning', 'slug' => 'hvac-and-air-conditioning', 'image_url' => 'categories/hvac-and-air-conditioning.svg'],
            ['name' => 'Wood & Carpentry', 'slug' => 'wood-and-carpentry', 'image_url' => 'categories/wood-and-carpentry.svg'],
            ['name' => 'Roofing', 'slug' => 'roofing', 'image_url' => 'categories/roofing.svg'],
            ['name' => 'Flooring & Tiles', 'slug' => 'flooring-and-tiles', 'image_url' => 'categories/flooring-and-tiles.svg'],
            ['name' => 'Glass & Aluminum', 'slug' => 'glass-and-aluminum', 'image_url' => 'categories/glass-and-aluminum.svg'],
            ['name' => 'Waterproofing', 'slug' => 'waterproofing', 'image_url' => 'categories/waterproofing.svg'],
            ['name' => 'Tools & Hardware', 'slug' => 'tools-and-hardware', 'image_url' => 'categories/tools-and-hardware.svg'],
            ['name' => 'Equipment & Machinery', 'slug' => 'equipment-and-machinery', 'image_url' => 'categories/equipments-and-machinery.svg'],
            ['name' => 'Safety Supplies', 'slug' => 'safety-supplies', 'image_url' => 'categories/safety-supplies.svg'],
            ['name' => 'Landscaping', 'slug' => 'landscaping', 'image_url' => 'categories/landscaping.svg'],
            ['name' => 'Miscellaneous', 'slug' => 'miscellaneous', 'image_url' => 'categories/miscellaneous.svg'],
        ];

        foreach ($categories as $category) {
            Category::query()->firstOrCreate(
                ['slug' => $category['slug']],
                ['name' => $category['name'], 'image_url' => $category['image_url'], 'is_active' => true],
            );
        }
    }
}
