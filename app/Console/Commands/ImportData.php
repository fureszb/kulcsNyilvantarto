<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportData extends Command
{
    protected $signature = 'data:import {path? : Path to export directory (default: storage/app/export)}';
    protected $description = 'Import JSON-exported data into the configured database';

    // Main DB tables in FK-safe order
    const MAIN_ORDER = [
        'users',
        'tenants',
        'jobs',
        'cache',
        'cache_locks',
    ];

    // Tenant tables in FK-safe order
    const TENANT_ORDER = [
        'settings',
        'item_groups',
        'locations',
        'items',
        'users',
        'checks',
        'check_items',
        'trainings',
        'training_steps',
        'training_results',
        'exams',
        'exam_steps',
        'exam_results',
        'pm_messages',
        'pm_message_recipients',
        'shift_notes',
        'security_daily_reports',
        'security_report_shares',
        'activity_logs',
    ];

    public function handle(): int
    {
        $exportDir = $this->argument('path') ?? database_path('export');

        if (!is_dir($exportDir)) {
            $this->error("Export directory not found: {$exportDir}");
            return 1;
        }

        // Main database
        $mainDir = $exportDir . '/main';
        if (is_dir($mainDir)) {
            $this->info('Importing main database...');
            $this->importDir($mainDir, config('database.default'), self::MAIN_ORDER);
        }

        // Tenant databases
        foreach (glob($exportDir . '/tenant_*', GLOB_ONLYDIR) as $tenantDir) {
            $slug = str_replace($exportDir . '/tenant_', '', $tenantDir);
            $this->info("Importing tenant: {$slug}");
            $this->importTenantDir($tenantDir, $slug);
        }

        $this->info('Import complete.');
        return 0;
    }

    private function importDir(string $dir, string $connection, array $order): void
    {
        $conn = DB::connection($connection);
        $driver = $conn->getDriverName();

        // Disable FK checks during import
        if ($driver === 'mysql') {
            $conn->statement('SET FOREIGN_KEY_CHECKS=0');
        } elseif ($driver === 'pgsql') {
            $conn->statement('SET session_replication_role = replica');
        } elseif ($driver === 'sqlite') {
            $conn->statement('PRAGMA foreign_keys = OFF');
        }

        $files = glob($dir . '/*.json');
        $nameMap = [];
        foreach ($files as $f) {
            $nameMap[basename($f, '.json')] = $f;
        }

        // Import in defined order first, then any remaining files
        $done = [];
        foreach ($order as $table) {
            if (isset($nameMap[$table])) {
                $this->importTable($conn, $table, $nameMap[$table]);
                $done[] = $table;
            }
        }
        foreach ($nameMap as $table => $file) {
            if (!in_array($table, $done)) {
                $this->importTable($conn, $table, $file);
            }
        }

        // Re-enable FK checks
        if ($driver === 'mysql') {
            $conn->statement('SET FOREIGN_KEY_CHECKS=1');
        } elseif ($driver === 'pgsql') {
            $conn->statement('SET session_replication_role = DEFAULT');
        } elseif ($driver === 'sqlite') {
            $conn->statement('PRAGMA foreign_keys = ON');
        }
    }

    private function importTenantDir(string $dir, string $slug): void
    {
        // Configure tenant connection to the server's default DB with a prefix,
        // OR use the default connection if single-DB multi-tenant is configured.
        // For SQLite-based servers: point to the tenant file.
        // For MySQL/PgSQL: the tenant connection must already be configured in .env

        // Try to configure tenant connection dynamically for SQLite servers
        $sqliteFile = storage_path("database/tenants/{$slug}.sqlite");
        $driver = DB::connection(config('database.default'))->getDriverName();

        if ($driver === 'sqlite') {
            if (!is_dir(storage_path('database/tenants'))) {
                mkdir(storage_path('database/tenants'), 0755, true);
            }
            if (!file_exists($sqliteFile)) {
                touch($sqliteFile);
            }
            config(['database.connections.tenant.database' => $sqliteFile]);
            DB::purge('tenant');
            \Artisan::call('migrate', [
                '--database' => 'tenant',
                '--path'     => 'database/migrations/tenant',
                '--force'    => true,
            ]);
        }

        $this->importDir($dir, 'tenant', self::TENANT_ORDER);
    }

    private function importTable($conn, string $table, string $file): void
    {
        $rows = json_decode(file_get_contents($file), true);
        if (empty($rows)) {
            $this->line("  – {$table}: 0 rows (skipped)");
            return;
        }

        try {
            // Truncate existing data
            $driver = $conn->getDriverName();
            if ($driver === 'pgsql') {
                $conn->statement("TRUNCATE TABLE \"{$table}\" RESTART IDENTITY CASCADE");
            } elseif ($driver === 'mysql') {
                $conn->statement("TRUNCATE TABLE `{$table}`");
            } else {
                $conn->table($table)->delete();
            }

            // Insert in chunks of 200
            foreach (array_chunk($rows, 200) as $chunk) {
                $conn->table($table)->insert($chunk);
            }

            $this->line("  ✓ {$table}: " . count($rows) . ' rows');
        } catch (\Exception $e) {
            $this->warn("  ✗ {$table}: " . $e->getMessage());
        }
    }
}
