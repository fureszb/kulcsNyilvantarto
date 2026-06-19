<?php

namespace Database\Seeders;

use App\Models\Check;
use App\Models\CheckItem;
use App\Models\Item;
use App\Models\Location;
use App\Models\Setting;
use App\Models\Tenant;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->createAndSeedTenant('demo', 'Demo Cég Kft.');
        $this->createAndSeedTenant('liwo', 'Liwo Kft.');
    }

    private function createAndSeedTenant(string $slug, string $name): void
    {
        if (!is_dir(database_path('tenants'))) {
            mkdir(database_path('tenants'), 0755, true);
        }

        $dbPath = database_path('tenants/' . $slug . '.sqlite');

        if (file_exists($dbPath)) {
            unlink($dbPath);
        }
        touch($dbPath);

        config(['database.connections.tenant.database' => $dbPath]);
        DB::purge('tenant');
        $prev = DB::getDefaultConnection();
        DB::setDefaultConnection('tenant');

        Artisan::call('migrate', [
            '--database' => 'tenant',
            '--path'     => 'database/migrations/tenant',
            '--force'    => true,
        ]);

        $this->seedTenantData();

        DB::setDefaultConnection($prev);
        DB::purge('tenant');

        Tenant::firstOrCreate(['slug' => $slug], ['name' => $name, 'is_active' => true]);

        $this->command->info("Tenant '{$slug}' kész.");
    }

    private function seedTenantData(): void
    {
        Setting::set('admin_password_hash', Hash::make('admin123'));
        Setting::set('global_email', 'demo@company.hu');

        $locations = [
            [
                'name'               => 'Irodaépület – Főbejárat',
                'responsible_person' => 'Nagy Péter',
                'email'              => 'nagy.peter@company.hu',
                'items'              => [
                    ['name' => 'Főbejárat kulcs',      'type' => 'key',  'sort_order' => 1],
                    ['name' => 'Garázskapu kulcs',      'type' => 'key',  'sort_order' => 2],
                    ['name' => 'Portásfülke kulcs',     'type' => 'key',  'sort_order' => 3],
                    ['name' => 'Belépőkártya – Portás', 'type' => 'card', 'sort_order' => 4],
                    ['name' => 'Parkolókapu kártya',    'type' => 'card', 'sort_order' => 5],
                    ['name' => 'Liftkártya – Vendég',   'type' => 'card', 'sort_order' => 6],
                ],
            ],
            [
                'name'               => 'Szervizterem',
                'responsible_person' => 'Kiss Tamás',
                'email'              => 'kiss.tamas@company.hu',
                'items'              => [
                    ['name' => 'Szervizterem főkulcs', 'type' => 'key',  'sort_order' => 1],
                    ['name' => 'Rack szekrény kulcs',  'type' => 'key',  'sort_order' => 2],
                    ['name' => 'UPS szoba kulcs',      'type' => 'key',  'sort_order' => 3],
                    ['name' => 'Admin belépőkártya',   'type' => 'card', 'sort_order' => 4],
                    ['name' => 'Backup tároló kártya', 'type' => 'card', 'sort_order' => 5],
                ],
            ],
            [
                'name'               => 'Raktár',
                'responsible_person' => 'Varga Mónika',
                'email'              => 'varga.monika@company.hu',
                'items'              => [
                    ['name' => 'Raktár főkulcs',         'type' => 'key',  'sort_order' => 1],
                    ['name' => 'Raktár B szárny kulcs',  'type' => 'key',  'sort_order' => 2],
                    ['name' => 'Teherliftkártya',        'type' => 'card', 'sort_order' => 3],
                    ['name' => 'Biztonsági zóna kártya', 'type' => 'card', 'sort_order' => 4],
                ],
            ],
            [
                'name'               => 'Tárgyaló – 2. emelet',
                'responsible_person' => 'Horváth Éva',
                'email'              => 'horvath.eva@company.hu',
                'items'              => [
                    ['name' => 'Tárgyaló ajtókulcs',         'type' => 'key',  'sort_order' => 1],
                    ['name' => 'Prezentációs szekrény kulcs', 'type' => 'key',  'sort_order' => 2],
                    ['name' => 'AV-rendszer kártya',          'type' => 'card', 'sort_order' => 3],
                ],
            ],
        ];

        $createdLocations = [];
        foreach ($locations as $locData) {
            $items = $locData['items'];
            unset($locData['items']);
            $location = Location::create($locData);
            $createdLocations[] = ['model' => $location, 'items' => $items];
            foreach ($items as $itemData) {
                Item::create(array_merge($itemData, ['location_id' => $location->id]));
            }
        }

        $history = [
            ['location_idx' => 0, 'checked_by' => 'Szabó Anna',   'days_ago' => 5, 'checked_idx' => 'all',        'notes' => null],
            ['location_idx' => 0, 'checked_by' => 'Molnár Gábor', 'days_ago' => 4, 'checked_idx' => [0,1,2,3,4], 'notes' => 'A liftkártya reggelre előkerült.'],
            ['location_idx' => 1, 'checked_by' => 'Kiss Tamás',   'days_ago' => 4, 'checked_idx' => 'all',        'notes' => null],
            ['location_idx' => 2, 'checked_by' => 'Varga Mónika', 'days_ago' => 3, 'checked_idx' => 'all',        'notes' => null],
            ['location_idx' => 0, 'checked_by' => 'Fekete Zoltán','days_ago' => 3, 'checked_idx' => 'all',        'notes' => null],
            ['location_idx' => 3, 'checked_by' => 'Tóth Réka',    'days_ago' => 2, 'checked_idx' => [0,2],        'notes' => 'A prezentációs szekrény kulcsát az igazgató magánál tartotta.'],
            ['location_idx' => 1, 'checked_by' => 'Balogh István','days_ago' => 2, 'checked_idx' => 'all',        'notes' => null],
            ['location_idx' => 2, 'checked_by' => 'Szabó Anna',   'days_ago' => 1, 'checked_idx' => 'all',        'notes' => null],
            ['location_idx' => 0, 'checked_by' => 'Molnár Gábor', 'days_ago' => 0, 'checked_idx' => 'all',        'notes' => null],
            ['location_idx' => 1, 'checked_by' => 'Kiss Tamás',   'days_ago' => 0, 'checked_idx' => 'all',        'notes' => null],
        ];

        foreach ($history as $entry) {
            $locData  = $createdLocations[$entry['location_idx']];
            $location = $locData['model'];
            $allItems = Item::where('location_id', $location->id)->orderBy('sort_order')->get();

            $check = Check::create([
                'location_id' => $location->id,
                'checked_by'  => $entry['checked_by'],
                'notes'       => $entry['notes'],
                'extra_email' => null,
                'created_at'  => now()->subDays($entry['days_ago'])->setTime(rand(7, 17), rand(0, 59)),
                'updated_at'  => now()->subDays($entry['days_ago'])->setTime(rand(7, 17), rand(0, 59)),
            ]);

            foreach ($allItems as $idx => $item) {
                CheckItem::create([
                    'check_id'   => $check->id,
                    'item_id'    => $item->id,
                    'is_checked' => $entry['checked_idx'] === 'all' || in_array($idx, $entry['checked_idx']),
                ]);
            }
        }
    }
}
