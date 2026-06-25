<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    protected $connection = 'tenant';

    public function up(): void
    {
        // SQLite-ban a CHECK constraint nem módosítható ALTER TABLE-lel, ezért újraépítjük a táblát
        DB::connection('tenant')->statement('
            CREATE TABLE users_new (
                "id"             integer primary key autoincrement not null,
                "name"           varchar not null,
                "email"          varchar not null,
                "password"       varchar not null,
                "role"           varchar check ("role" in (\'admin\', \'user\', \'property_manager\')) not null default \'user\',
                "is_active"      tinyint(1) not null default \'1\',
                "employed_since" date null,
                "remember_token" varchar null,
                "created_at"     datetime null,
                "updated_at"     datetime null
            )
        ');
        DB::connection('tenant')->statement('INSERT INTO users_new SELECT * FROM users');
        DB::connection('tenant')->statement('DROP TABLE users');
        DB::connection('tenant')->statement('ALTER TABLE users_new RENAME TO users');
        DB::connection('tenant')->statement('CREATE UNIQUE INDEX users_email_unique ON users (email)');
    }

    public function down(): void
    {
        DB::connection('tenant')->statement('
            CREATE TABLE users_new (
                "id"             integer primary key autoincrement not null,
                "name"           varchar not null,
                "email"          varchar not null,
                "password"       varchar not null,
                "role"           varchar check ("role" in (\'admin\', \'user\')) not null default \'user\',
                "is_active"      tinyint(1) not null default \'1\',
                "employed_since" date null,
                "remember_token" varchar null,
                "created_at"     datetime null,
                "updated_at"     datetime null
            )
        ');
        DB::connection('tenant')->statement('INSERT INTO users_new SELECT id,name,email,password,CASE WHEN role=\'property_manager\' THEN \'user\' ELSE role END,is_active,employed_since,remember_token,created_at,updated_at FROM users');
        DB::connection('tenant')->statement('DROP TABLE users');
        DB::connection('tenant')->statement('ALTER TABLE users_new RENAME TO users');
        DB::connection('tenant')->statement('CREATE UNIQUE INDEX users_email_unique ON users (email)');
    }
};
