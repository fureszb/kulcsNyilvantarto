<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use App\Models\TenantUser;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TenantCreate extends Command
{
    protected $signature = 'tenant:create {slug} {name}';
    protected $description = 'Új tenant (cég) létrehozása saját adatbázissal';

    public function handle(): int
    {
        $slug = $this->argument('slug');
        $name = $this->argument('name');

        if (!preg_match('/^[a-z0-9\-]+$/', $slug)) {
            $this->error('A slug csak kisbetűket, számokat és kötőjelet tartalmazhat.');
            return 1;
        }

        if (Tenant::where('slug', $slug)->exists()) {
            $this->error("A '{$slug}' slug már foglalt.");
            return 1;
        }

        // A valós app (TenantMiddleware, Tenant::database_path) ezt az elérési
        // utat olvassa — database_path('tenants/...') egy másik, soha nem
        // használt fájlra mutatna, és a tenant élesben elérhetetlen maradna.
        if (!is_dir(storage_path('database/tenants'))) {
            mkdir(storage_path('database/tenants'), 0755, true);
        }

        $dbPath = storage_path('database/tenants/' . $slug . '.sqlite');
        touch($dbPath);
        $this->line("DB létrehozva: {$dbPath}");

        config(['database.connections.tenant.database' => $dbPath]);
        DB::purge('tenant');
        $prev = DB::getDefaultConnection();
        DB::setDefaultConnection('tenant');

        Artisan::call('migrate', [
            '--database' => 'tenant',
            '--path'     => 'database/migrations/tenant',
            '--force'    => true,
        ], $this->output);

        // Első admin felhasználó létrehozása
        $adminName  = $this->ask('Admin neve');
        $adminEmail = $this->ask('Admin email');
        $adminPass  = $this->secret('Admin jelszó (min. 8 karakter)');

        if (strlen((string) $adminPass) >= 8) {
            TenantUser::create([
                'name'      => $adminName,
                'email'     => $adminEmail,
                'password'  => Hash::make($adminPass),
                'role'      => 'admin',
                'is_active' => true,
            ]);
            $this->line("Admin létrehozva: {$adminName} <{$adminEmail}>");
        } else {
            $this->warn('Jelszó kihagyva (túl rövid). Adj hozzá admin felhasználót manuálisan.');
        }

        DB::setDefaultConnection($prev);
        DB::purge('tenant');

        Tenant::create(['name' => $name, 'slug' => $slug]);

        $this->info("✓ \"{$name}\" létrehozva. URL: " . url($slug));

        return 0;
    }
}
