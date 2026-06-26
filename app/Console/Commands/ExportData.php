<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ExportData extends Command
{
    protected $signature = 'data:export';
    protected $description = 'Export all SQLite data to JSON files in storage/app/export/';

    public function handle(): int
    {
        $exportDir = database_path('export');
        if (!is_dir($exportDir)) {
            mkdir($exportDir, 0755, true);
        }

        $this->info('Exporting main database...');
        $this->exportSqlite(database_path('database.sqlite'), $exportDir . '/main');

        $tenantsDir = database_path('tenants');
        foreach (glob($tenantsDir . '/*.sqlite') as $file) {
            $slug = basename($file, '.sqlite');
            $this->info("Exporting tenant: {$slug}");
            $this->exportSqlite($file, $exportDir . '/tenant_' . $slug);
        }

        $this->info('Done. Files in: ' . $exportDir);
        return 0;
    }

    private function exportSqlite(string $sqliteFile, string $outDir): void
    {
        if (!file_exists($sqliteFile)) {
            $this->warn("  Skipping (file not found): {$sqliteFile}");
            return;
        }

        if (!is_dir($outDir)) {
            mkdir($outDir, 0755, true);
        }

        $connName = 'export_tmp_' . md5($sqliteFile);
        config(["database.connections.{$connName}" => [
            'driver'                  => 'sqlite',
            'database'                => $sqliteFile,
            'prefix'                  => '',
            'foreign_key_constraints' => false,
        ]]);
        DB::purge($connName);

        $tables = DB::connection($connName)
            ->select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");

        foreach ($tables as $table) {
            $name = $table->name;
            $rows = DB::connection($connName)->table($name)->get()
                ->map(fn($r) => (array) $r)->all();
            file_put_contents(
                "{$outDir}/{$name}.json",
                json_encode($rows, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
            );
            $this->line("  ✓ {$name}: " . count($rows) . ' rows');
        }

        DB::purge($connName);
    }
}
