<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StoreProductSeeder extends Seeder
{
    private const HUNDRED_PRODUCT_STORE_COUNT = 12;

    private const CHUNK_SIZE = 500;

    /**
     * category slug => list of [name, minPrice, maxPrice].
     *
     * @var array<string, array<int, array{0: string, 1: float, 2: float}>>
     */
    private const PRODUCT_POOLS = [
        'building-materials' => [
            ['Portland Cement 50kg Bag', 15, 35],
            ['Ready-Mix Concrete Additive', 40, 120],
            ['Sand (Fine) per Ton', 60, 100],
            ['Gravel Aggregate per Ton', 55, 95],
            ['Concrete Hollow Block 20cm', 3, 8],
            ['Lightweight Block 15cm', 4, 9],
            ['Gypsum Board 12mm', 25, 55],
            ['Insulation Board 5cm', 30, 70],
        ],
        'cement-and-blocks' => [
            ['White Cement 40kg Bag', 20, 45],
            ['Sulfate Resistant Cement 50kg', 18, 38],
            ['Hollow Concrete Block 20x20x40cm', 3, 7],
            ['Solid Concrete Block', 4, 9],
            ['Cement Mortar Mix 25kg', 12, 28],
        ],
        'steel-and-metal' => [
            ['Rebar 12mm x 12m', 45, 90],
            ['Rebar 16mm x 12m', 60, 110],
            ['Steel Angle Bar 40x40mm', 20, 60],
            ['Steel I-Beam 6m', 200, 500],
            ['Galvanized Steel Sheet 1.2mm', 80, 180],
            ['Steel Wire Mesh Roll', 90, 200],
            ['Steel Pipe 2 inch x 6m', 35, 75],
        ],
        'doors-and-windows' => [
            ['Wooden Panel Door 90x210cm', 350, 900],
            ['Aluminum Sliding Window 120x120cm', 400, 950],
            ['Security Steel Door', 800, 2000],
            ['Door Frame Set', 150, 400],
            ['Window Lock Set', 25, 60],
        ],
        'paints-and-finishes' => [
            ['Interior Emulsion Paint 18L', 90, 220],
            ['Exterior Weatherproof Paint 18L', 120, 280],
            ['Wood Varnish 4L', 35, 80],
            ['Metal Primer 4L', 30, 70],
            ['Paint Roller Set', 15, 35],
            ['Paint Brush Set', 10, 25],
        ],
        'electrical' => [
            ['Circuit Breaker 32A', 20, 60],
            ['PVC Conduit Pipe 20mm x 3m', 5, 15],
            ['Electrical Cable 2.5mm² (100m Roll)', 150, 350],
            ['LED Ceiling Light 24W', 25, 65],
            ['Distribution Board 12-Way', 90, 220],
            ['Wall Socket Outlet', 8, 20],
            ['Switch Plate Dual', 6, 18],
        ],
        'plumbing' => [
            ['PVC Pipe 4" x 6m', 25, 55],
            ['PVC Pipe 2" x 6m', 12, 30],
            ['Brass Gate Valve 1"', 30, 90],
            ['PPR Pipe 20mm x 4m', 15, 35],
            ['Water Tank 1000L', 400, 900],
            ['Submersible Water Pump', 350, 800],
            ['Bathroom Faucet Set', 60, 180],
            ['Sink Drain Trap', 15, 40],
        ],
        'hvac-and-air-conditioning' => [
            ['Split AC Unit 1.5 Ton', 1200, 2500],
            ['Central AC Duct Section', 150, 400],
            ['Exhaust Fan 8 inch', 60, 140],
            ['Ventilation Duct Pipe 6m', 80, 180],
            ['AC Copper Pipe Set', 100, 250],
        ],
        'wood-and-carpentry' => [
            ['Plywood Sheet 18mm 4x8ft', 90, 220],
            ['MDF Board 16mm 4x8ft', 70, 180],
            ['Timber Beam 4x4 inch x 3m', 60, 140],
            ['Hardwood Panel 12mm', 100, 260],
            ['Wood Screws Box (200pcs)', 10, 25],
        ],
        'roofing' => [
            ['Corrugated Steel Roof Sheet 3m', 45, 110],
            ['Roof Tile (per m²)', 25, 65],
            ['Rain Gutter 3m Section', 30, 75],
            ['Roof Insulation Roll', 60, 150],
            ['Roof Fastener Kit', 15, 35],
        ],
        'flooring-and-tiles' => [
            ['Ceramic Floor Tile 60x60cm (per m²)', 25, 70],
            ['Porcelain Tile 80x80cm (per m²)', 40, 110],
            ['Marble Slab (per m²)', 150, 400],
            ['Wooden Parquet Flooring (per m²)', 60, 160],
            ['Tile Adhesive 25kg Bag', 20, 45],
            ['Tile Grout 5kg', 12, 28],
        ],
        'glass-and-aluminum' => [
            ['Tempered Glass Panel 6mm (per m²)', 100, 260],
            ['Double Glazing Window Unit', 350, 850],
            ['Aluminum Profile 6m Length', 40, 100],
            ['Aluminum Facade Panel', 120, 300],
            ['Glass Door Handle Set', 30, 80],
        ],
        'waterproofing' => [
            ['Waterproofing Membrane Roll', 80, 200],
            ['Bitumen Sealant 20L', 60, 140],
            ['Roof Waterproof Coating 18L', 90, 220],
            ['Silicone Sealant Tube', 8, 20],
            ['Waterproofing Tape Roll', 15, 35],
        ],
        'tools-and-hardware' => [
            ['Bosch Cordless Drill 18V', 250, 600],
            ['Claw Hammer 16oz', 15, 40],
            ['Adjustable Wrench Set', 30, 80],
            ['Angle Grinder 4.5 inch', 150, 350],
            ['Screwdriver Set (12pcs)', 20, 50],
            ['Measuring Tape 8m', 10, 25],
            ['Hex Bolt & Nut Assortment Box', 25, 60],
            ['Hinges (Pair)', 8, 20],
        ],
        'equipment-and-machinery' => [
            ['Concrete Mixer 350L', 1500, 3200],
            ['Portable Generator 5kW', 1800, 4000],
            ['Scaffolding Frame Set', 400, 900],
            ['Plate Compactor', 1200, 2800],
            ['Water Pump (Petrol) 2 inch', 500, 1100],
        ],
        'safety-supplies' => [
            ['Safety Helmet ANSI-Rated', 20, 45],
            ['Reflective Safety Vest', 15, 30],
            ['Safety Goggles', 10, 25],
            ['Work Gloves (Pair)', 8, 22],
            ['Steel Toe Safety Boots', 90, 220],
            ['First Aid Kit (Industrial)', 60, 150],
            ['Fire Extinguisher 6kg', 80, 180],
        ],
        'landscaping' => [
            ['Outdoor Paver Stone (per m²)', 25, 60],
            ['Garden Soil 40L Bag', 15, 35],
            ['Decorative Rock (per Ton)', 70, 150],
            ['Artificial Grass Roll (per m²)', 30, 75],
            ['Garden Irrigation Pipe 25m', 40, 90],
        ],
        'miscellaneous' => [
            ['Cable Ties (Pack of 100)', 5, 15],
            ['Duct Tape Roll', 8, 18],
            ['Storage Toolbox', 40, 100],
            ['Work Light LED', 30, 70],
            ['Extension Cord 10m', 25, 55],
        ],
    ];

    public function run(): void
    {
        $storeIds = DB::table('stores')->pluck('id')->all();
        shuffle($storeIds);

        $hundredProductStoreIds = array_slice($storeIds, 0, self::HUNDRED_PRODUCT_STORE_COUNT);
        $restStoreIds = array_slice($storeIds, self::HUNDRED_PRODUCT_STORE_COUNT);

        $countsByStore = [];
        foreach ($hundredProductStoreIds as $id) {
            $countsByStore[$id] = 100;
        }
        foreach ($restStoreIds as $id) {
            $countsByStore[$id] = mt_rand(20, 99);
        }

        $categoryIdBySlug = DB::table('categories')->pluck('id', 'slug')->all();
        $unitIds = DB::table('product_units')->pluck('id')->all();
        $categorySlugs = array_keys(self::PRODUCT_POOLS);

        $now = now();
        $productRows = [];

        foreach ($countsByStore as $storeId => $count) {
            for ($i = 1; $i <= $count; $i++) {
                $categorySlug = $categorySlugs[array_rand($categorySlugs)];
                $pool = self::PRODUCT_POOLS[$categorySlug];
                [$name, $min, $max] = $pool[array_rand($pool)];

                $productRows[] = [
                    'store_id' => $storeId,
                    'category_id' => $categoryIdBySlug[$categorySlug] ?? null,
                    'unit_id' => $unitIds[array_rand($unitIds)],
                    'name' => $name,
                    'slug' => Str::slug($name).'-'.$i,
                    'description' => "Quality {$name} suitable for construction and hardware projects.",
                    'sku' => "SKU-{$storeId}-{$i}",
                    'price' => round(mt_rand((int) ($min * 100), (int) ($max * 100)) / 100, 2),
                    'compare_at_price' => null,
                    'stock_quantity' => mt_rand(0, 200),
                    'status' => 'active',
                    'created_at' => $now,
                    'updated_at' => $now,
                ];

                if (count($productRows) >= self::CHUNK_SIZE) {
                    DB::table('products')->insert($productRows);
                    $productRows = [];
                }
            }
        }

        if ($productRows) {
            DB::table('products')->insert($productRows);
        }
    }
}
