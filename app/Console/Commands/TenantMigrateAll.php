<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

class TenantMigrateAll extends Command
{
    protected $signature = 'tenant:migrate-all';
    protected $description = 'Run tenant migrations on all existing tenant SQLite databases';

    public function handle(): int
    {
        $tenantDbDir = storage_path('database/tenants');

        if (!is_dir($tenantDbDir)) {
            return 0;
        }

        $files = glob($tenantDbDir . '/*.sqlite') ?: [];

        foreach ($files as $dbPath) {
            $slug = basename($dbPath, '.sqlite');
            $this->line("Migrating tenant: {$slug}");

            config(['database.connections.tenant.database' => $dbPath]);
            DB::purge('tenant');

            Artisan::call('migrate', [
                '--database' => 'tenant',
                '--path'     => 'database/migrations/tenant',
                '--force'    => true,
            ]);

            $output = trim(Artisan::output());
            if ($output) {
                $this->line($output);
            }
        }

        return 0;
    }
}
