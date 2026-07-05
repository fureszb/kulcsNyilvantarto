<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * A role CHECK constraint bővítése: +security_lead (biztonsági vezető,
 * PM-szintű jogok) és +area_director (területi igazgató, admin-szintű).
 *
 * SQLite-ban a CHECK nem módosítható ALTER-rel → tábla-újraépítés. A séma
 * DINAMIKUSAN a sqlite_master-ből jön, így a később hozzáadott oszlopok
 * (notes_read_at, messages_read_at, …) sem vesznek el.
 */
return new class extends Migration
{
    protected $connection = 'tenant';

    private const OLD_ROLES = "'admin', 'user', 'property_manager'";
    private const NEW_ROLES = "'admin', 'user', 'property_manager', 'security_lead', 'area_director'";

    public function up(): void
    {
        $this->rebuildWithRoles(self::NEW_ROLES);
    }

    public function down(): void
    {
        // Az új role-ú felhasználókat visszaminősítjük, hogy a szűkebb CHECK ne bukjon
        DB::connection('tenant')->statement(
            "UPDATE users SET role = 'user' WHERE role IN ('security_lead', 'area_director')"
        );
        $this->rebuildWithRoles(self::OLD_ROLES);
    }

    private function rebuildWithRoles(string $roleList): void
    {
        $conn = DB::connection('tenant');

        $row = $conn->selectOne("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'");
        if (!$row) {
            return;
        }

        // A meglévő role CHECK kifejezés cseréje az új listára (bármi is volt benne)
        $createSql = preg_replace(
            '/check\s*\(\s*"?role"?\s+in\s*\([^)]*\)\s*\)/i',
            'check ("role" in (' . $roleList . '))',
            $row->sql
        );
        $createNew = preg_replace('/CREATE TABLE\s+"?users"?/i', 'CREATE TABLE "users_new"', $createSql, 1);

        $columns = collect($conn->select('PRAGMA table_info(users)'))
            ->pluck('name')
            ->map(fn ($c) => '"' . $c . '"')
            ->implode(', ');

        $conn->statement('PRAGMA foreign_keys=OFF');
        $conn->statement($createNew);
        $conn->statement("INSERT INTO users_new ($columns) SELECT $columns FROM users");
        $conn->statement('DROP TABLE users');
        $conn->statement('ALTER TABLE users_new RENAME TO users');
        $conn->statement('CREATE UNIQUE INDEX users_email_unique ON users (email)');
        $conn->statement('PRAGMA foreign_keys=ON');
    }
};
