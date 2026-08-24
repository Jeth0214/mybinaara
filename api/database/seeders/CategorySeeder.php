<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // Matches apps/store-web's PRODUCT_CATEGORIES exactly (name + icon file).
        // Slugs are set explicitly rather than via Str::slug(), which drops "&"
        // instead of expanding it to "and" and would otherwise mismatch the icon filenames.
        $categories = [
            ['name' => 'Building Materials', 'slug' => 'building-materials', 'icon' => 'building-materials.svg', 'description' => 'Basic building raw materials, cement bases, and structural elements'],
            ['name' => 'Cement & Blocks', 'slug' => 'cement-and-blocks', 'icon' => 'cement-and-blocks.svg', 'description' => 'Portland cement bags, lightweight blocks, hollow concrete blocks'],
            ['name' => 'Steel & Metal', 'slug' => 'steel-and-metal', 'icon' => 'steel-and-metal.svg', 'description' => 'Rebars, steel beams, structural metal elements, wires, and sheets'],
            ['name' => 'Doors & Windows', 'slug' => 'doors-and-windows', 'icon' => 'doors-and-windows.svg', 'description' => 'Wooden doors, aluminum windows, safety panels, frames, and locks'],
            ['name' => 'Paint & Finishes', 'slug' => 'paints-and-finishes', 'icon' => 'paints-and-finishes.svg', 'description' => 'Interior and exterior paints, varnishes, primers, and brushes'],
            ['name' => 'Electrical', 'slug' => 'electrical', 'icon' => 'electrical.svg', 'description' => 'Wires, cables, breaker boxes, sockets, switches, lighting systems'],
            ['name' => 'Plumbing', 'slug' => 'plumbing', 'icon' => 'plumbing.svg', 'description' => 'Pipes, joints, drains, water tanks, pumps, valves, and fixtures'],
            ['name' => 'HVAC & Air Conditioning', 'slug' => 'hvac-and-air-conditioning', 'icon' => 'hvac-and-air-conditioning.svg', 'description' => 'Central AC systems, split units, ventilation fans, and ductworks'],
            ['name' => 'Wood & Carpentry', 'slug' => 'wood-and-carpentry', 'icon' => 'wood-and-carpentry.svg', 'description' => 'Plywood, hardwood panels, timber beams, frames, and carpenters tools'],
            ['name' => 'Roofing', 'slug' => 'roofing', 'icon' => 'roofing.svg', 'description' => 'Corrugated roof sheets, tiles, roof frames, panels, and rain gutters'],
            ['name' => 'Flooring & Tiles', 'slug' => 'flooring-and-tiles', 'icon' => 'flooring-and-tiles.svg', 'description' => 'Ceramic tiles, porcelain, marble slabs, wooden parquet, floor finishes'],
            ['name' => 'Glass & Aluminum', 'slug' => 'glass-and-aluminum', 'icon' => 'glass-and-aluminum.svg', 'description' => 'Glass panels, double glazing windows, aluminum profiles, and facades'],
            ['name' => 'Waterproofing', 'slug' => 'waterproofing', 'icon' => 'waterproofing.svg', 'description' => 'Waterproofing membranes, sealants, chemical coatings, and rolls'],
            ['name' => 'Tools & Hardware', 'slug' => 'tools-and-hardware', 'icon' => 'tools-and-hardware.svg', 'description' => 'Hand tools, power tools, nails, screws, hinges, and hardware boxes'],
            ['name' => 'Equipment & Machinery', 'slug' => 'equipment-and-machinery', 'icon' => 'equipments-and-machinery.svg', 'description' => 'Concrete mixers, generators, scaffolding lifts, compactors, machinery'],
            ['name' => 'Safety Supplies', 'slug' => 'safety-supplies', 'icon' => 'safety-supplies.svg', 'description' => 'Helmets, safety vests, gloves, boots, signs, and first aid kits'],
            ['name' => 'Landscaping', 'slug' => 'landscaping', 'icon' => 'landscaping.svg', 'description' => 'Outdoor pavers, soil, decorative rocks, artificial grass, garden pipes'],
            ['name' => 'Miscellaneous', 'slug' => 'miscellaneous', 'icon' => 'miscellaneous.svg', 'description' => 'General building supplies, auxiliary accessories, non-categorized items'],
        ];

        $iconSourceDir = base_path('../lib/shared-assets/images/category-icons');

        foreach ($categories as $category) {
            $imageUrl = $this->publishIcon($iconSourceDir, $category['icon']);

            Category::query()->updateOrCreate(
                ['slug' => $category['slug']],
                [
                    'name' => $category['name'],
                    'description' => $category['description'],
                    'image_url' => $imageUrl,
                    'is_active' => true,
                ],
            );
        }
    }

    private function publishIcon(string $sourceDir, string $filename): ?string
    {
        $sourcePath = $sourceDir.DIRECTORY_SEPARATOR.$filename;

        if (! is_file($sourcePath)) {
            return null;
        }

        $storagePath = 'categories/'.$filename;
        Storage::disk('public')->put($storagePath, file_get_contents($sourcePath));

        return Storage::disk('public')->url($storagePath);
    }
}
