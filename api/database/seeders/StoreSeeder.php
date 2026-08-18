<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Support\Seeding\GeoPoint;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class StoreSeeder extends Seeder
{
    private const REFERENCE_LAT = 21.572375;

    private const REFERENCE_LNG = 39.1874831;

    private const TEST_EMAIL_DOMAIN = '@mybinaara-test.com';

    /** @var array<int, array{count: int, min: float, max: float}> */
    private const DISTANCE_BANDS = [
        ['count' => 10, 'min' => 0.0, 'max' => 1.0],
        ['count' => 20, 'min' => 1.0, 'max' => 5.0],
        ['count' => 10, 'min' => 5.0, 'max' => 10.0],
        ['count' => 10, 'min' => 10.0, 'max' => 50.0],
    ];

    /** @var string[] */
    private const NAME_BASES = [
        'Al-Rajhi Hardware', 'Jeddah Building Materials', 'Al-Salam Tools & Equipment',
        'Makkah Steel & Metal Works', 'Al-Bawadi Plumbing Supplies', 'National Paint & Finishes',
        'Al-Faisaliah Construction Supplies', 'Red Sea Hardware', 'Al-Andalus Building Center',
        'Tihama Tools Trading', 'Al-Nakheel Electrical Supplies', 'Corniche Steel Trading',
        'Al-Hamra Hardware Store', 'Jeddah Gate Construction Materials', 'Al-Waha Plumbing & Sanitary',
        'Bab Makkah Hardware', 'Al-Rawdah Building Supplies', 'Sahari Tools & Machinery',
        'Al-Manar Electrical & Lighting', 'Obhur Marine & Hardware', 'Al-Safa Construction Trading',
        'Prince Sultan Hardware', 'Al-Zahra Building Materials', 'Al-Aziziyah Tools Est.',
        'Sharm Steel Supplies', 'Al-Salamah Hardware Trading', 'Ruwais Construction Center',
        'Al-Marwah Plumbing Supplies', 'Kilo 14 Hardware Market', 'Al-Basateen Building Materials',
        'Thuwal Hardware & Tools', 'Al-Naeem Electrical Trading', 'Petromin Steel Works',
        'Al-Muhammadiyah Building Supplies', 'Khumrah Tools & Equipment', 'Al-Sawari Hardware Est.',
        'Bani Malik Construction Materials', 'Al-Firdous Plumbing & Electrical', 'Al-Rehab Building Center',
        'Al-Yaqout Hardware Trading', 'Al-Amir Fahd Tools Est.', 'Taif Highlands Hardware',
        'Makkah Road Building Supplies', 'Al-Shatea Marine Hardware', 'Al-Fayha Construction Trading',
        'Al-Khalidiyah Steel Supplies', 'Al-Murjan Plumbing Center', 'Al-Wurood Electrical Est.',
        'Al-Jawhara Tools Trading', 'Al-Qusur Building Materials', 'Al-Nahda Hardware Est.',
        'Medina Gate Construction Supplies', 'Dammam Coast Hardware', 'Riyadh Central Tools Trading',
    ];

    /** @var string[] */
    private const SUFFIXES = ['Est.', 'Co.', 'Trading Co.', 'Trading Est.'];

    /** @var string[] */
    private const NEAR_CITIES = [
        'Al Rawdah, Jeddah', 'Al Salamah, Jeddah', 'Al Hamra, Jeddah', 'Al Naeem, Jeddah',
        'Al Zahra, Jeddah', 'Al Basateen, Jeddah', 'Al Safa, Jeddah', 'Al Marwah, Jeddah',
    ];

    /**
     * Real areas roughly 10-50km from central Jeddah (the seeder's reference point) —
     * intentionally NOT Mecca/Taif/Rabigh/etc, which sit 70km+ away in reality.
     *
     * @var string[]
     */
    private const FAR_CITIES = ['North Obhur, Jeddah', 'Bahra', 'Asfan', 'Khulais Road', 'Al Rayyan'];

    /** @var string[] */
    private const STREET_NAMES = [
        'King Abdulaziz Road', 'Prince Sultan Street', 'Palestine Street', 'Madinah Road',
        'Tahlia Street', 'Al Rawdah Street', 'Al Andalus Street', 'Corniche Road',
    ];

    private const SUSPENDED_STORE_COUNT = 5;

    /** @var string[] */
    private const SUSPENSION_REASONS = [
        'Expired commercial registration document pending renewal.',
        'Repeated customer complaints under investigation.',
        'VAT certificate could not be verified.',
        'Store requested a temporary suspension for maintenance.',
        'Failed a routine compliance review.',
    ];

    public function run(): void
    {
        $this->resetTestData();

        $vendorRoleId = DB::table('roles')->where('name', 'vendor')->value('id');
        $passwordHash = Hash::make('P@ssword123');
        $now = now();

        $totalStores = array_sum(array_column(self::DISTANCE_BANDS, 'count'));
        $suspendedIndexes = array_flip(
            (array) array_rand(range(0, $totalStores - 1), self::SUSPENDED_STORE_COUNT)
        );

        $storeRows = [];
        $userRows = [];
        $index = 0;

        foreach (self::DISTANCE_BANDS as $band) {
            for ($i = 0; $i < $band['count']; $i++, $index++) {
                $distanceKm = $this->randomDistance((float) $band['min'], (float) $band['max']);
                $bearingDeg = mt_rand(0, 3599) / 10;

                [$lat, $lng] = GeoPoint::destination(self::REFERENCE_LAT, self::REFERENCE_LNG, $distanceKm, $bearingDeg);

                $name = $this->storeName($index);
                $slug = Str::slug($name);
                $isSuspended = isset($suspendedIndexes[$index]);
                $district = $distanceKm > 10
                    ? fake()->randomElement(self::FAR_CITIES)
                    : fake()->randomElement(self::NEAR_CITIES);
                $city = $distanceKm > 10 ? $district : 'Jeddah';

                $storeRows[] = [
                    'name' => $name,
                    'cr_number' => str_pad((string) (1000000000 + $index), 10, '0', STR_PAD_LEFT),
                    'vat_number' => '300'.str_pad((string) $index, 11, '0', STR_PAD_LEFT).'3',
                    'status' => $isSuspended ? 'suspended' : 'active',
                    'is_activated' => true,
                    'activated_at' => $now,
                    'logo_url' => null,
                    'suspension_reason' => $isSuspended ? fake()->randomElement(self::SUSPENSION_REASONS) : null,
                    'city' => $city,
                    'formatted_address' => $this->formattedAddress($district),
                    'latitude' => $lat,
                    'longitude' => $lng,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];

                $userRows[] = [
                    'user_type' => 'store_owner',
                    'name' => $name.' Owner',
                    'email' => "{$slug}-{$index}".self::TEST_EMAIL_DOMAIN,
                    'phone' => '+9665'.str_pad((string) mt_rand(0, 99999999), 8, '0', STR_PAD_LEFT),
                    'whatsapp' => '+9665'.str_pad((string) mt_rand(0, 99999999), 8, '0', STR_PAD_LEFT),
                    'password' => $passwordHash,
                    'status' => 'active',
                    'email_verified_at' => $now,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        foreach (array_chunk($storeRows, 200) as $chunk) {
            DB::table('stores')->insert($chunk);
        }

        foreach (array_chunk($userRows, 200) as $chunk) {
            DB::table('users')->insert($chunk);
        }

        DB::table('users')
            ->where('email', 'like', '%'.self::TEST_EMAIL_DOMAIN)
            ->update(['role_id' => $vendorRoleId]);

        $storeIds = DB::table('stores')->orderBy('id')->pluck('id')->all();
        $ownerUserIds = DB::table('users')
            ->where('email', 'like', '%'.self::TEST_EMAIL_DOMAIN)
            ->orderBy('id')
            ->pluck('id')
            ->all();

        $pivotRows = [];
        foreach ($storeIds as $i => $storeId) {
            $pivotRows[] = [
                'store_id' => $storeId,
                'user_id' => $ownerUserIds[$i],
                'role' => 'owner',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        DB::table('store_user')->insert($pivotRows);
    }

    private function resetTestData(): void
    {
        Schema::disableForeignKeyConstraints();
        DB::table('products')->truncate();
        DB::table('store_activation_tokens')->truncate();
        DB::table('store_schedules')->truncate();
        DB::table('store_user')->truncate();
        DB::table('stores')->truncate();
        DB::table('users')->where('email', 'like', '%'.self::TEST_EMAIL_DOMAIN)->delete();
        Schema::enableForeignKeyConstraints();
    }

    private function randomDistance(float $min, float $max): float
    {
        $minUnits = (int) ($min * 1000);
        $maxUnits = (int) ($max * 1000);

        if ($min > 0.0) {
            $minUnits++;
        }

        return mt_rand($minUnits, $maxUnits) / 1000;
    }

    private function storeName(int $index): string
    {
        $base = self::NAME_BASES[$index % count(self::NAME_BASES)];

        if ($index < count(self::NAME_BASES)) {
            return $base;
        }

        $suffix = self::SUFFIXES[intdiv($index, count(self::NAME_BASES)) % count(self::SUFFIXES)];

        return "{$base} {$suffix}";
    }

    private function formattedAddress(string $district): string
    {
        $street = fake()->randomElement(self::STREET_NAMES);
        $building = fake()->buildingNumber();

        return "{$building} {$street}, {$district}, Saudi Arabia";
    }
}
