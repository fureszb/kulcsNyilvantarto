<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

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

        if (!is_dir(database_path('tenants'))) {
            mkdir(database_path('tenants'), 0755, true);
        }

        $dbPath = database_path('tenants/' . $slug . '.sqlite');
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

        DB::setDefaultConnection($prev);
        DB::purge('tenant');

        Tenant::create(['name' => $name, 'slug' => $slug]);

        $this->info("✓ \"{$name}\" létrehozva. URL: " . url($slug));

        return 0;
    }
}
