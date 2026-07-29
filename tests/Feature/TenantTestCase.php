<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\TenantUser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * Feature-teszt alaposztály valódi (fájl-alapú SQLite) tenant adatbázissal — a
 * `TenantMiddleware` a `{tenant}` route-paraméterből (URL-szlug) közvetlenül vezeti le a
 * `storage/database/tenants/{slug}.sqlite` elérési utat, és 503-at ad, ha a fájl fizikailag
 * nem létezik — ezért a teszteknek egy valódi sqlite fájlt kell létrehozniuk és lefuttatniuk
 * rajta a tenant migrációkat, ugyanúgy, ahogy az `App\Console\Commands\TenantCreate` teszi
 * éles környezetben. Minden teszt egyedi, uniqid()-alapú slug-ot kap, hogy a párhuzamosan
 * futó tesztek ne ütközzenek, és a fájlt `tearDown()`-ban töröljük.
 */
abstract class TenantTestCase extends TestCase
{
    use RefreshDatabase;

    protected string $tenantSlug;
    protected string $tenantDbPath;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenantSlug = 'phpunit-' . uniqid();

        $dbDir = storage_path('database/tenants');
        if (!is_dir($dbDir)) {
            mkdir($dbDir, 0755, true);
        }
        $this->tenantDbPath = $dbDir . DIRECTORY_SEPARATOR . $this->tenantSlug . '.sqlite';
        touch($this->tenantDbPath);

        $this->pointAtTenantDb();

        Artisan::call('migrate', [
            '--database' => 'tenant',
            '--path'     => 'database/migrations/tenant',
            '--force'    => true,
        ]);

        Tenant::create(['name' => 'PHPUnit Test Tenant', 'slug' => $this->tenantSlug, 'is_active' => true]);
    }

    protected function tearDown(): void
    {
        DB::purge('tenant');
        if (isset($this->tenantDbPath) && file_exists($this->tenantDbPath)) {
            @unlink($this->tenantDbPath);
        }
        parent::tearDown();
    }

    /** Minden segédmetódus előtt hívandó, mert HTTP-kérések között a `tenant` kapcsolat a
     *  valós kérésen belül a `TenantMiddleware` által lesz újra a helyes fájlra állítva, de a
     *  teszt setup-kódnak (fixture-létrehozás a HTTP-hívás ELŐTT) saját magának kell. */
    protected function pointAtTenantDb(): void
    {
        config(['database.connections.tenant.database' => $this->tenantDbPath]);
        DB::purge('tenant');
    }

    protected function createTenantUser(array $attributes = []): TenantUser
    {
        $this->pointAtTenantDb();

        return TenantUser::create(array_merge([
            'name'      => 'Test User',
            'email'     => 'user-' . uniqid() . '@example.com',
            'password'  => Hash::make('password'),
            'role'      => 'user',
            'is_active' => true,
        ], $attributes));
    }

    protected function authHeaders(TenantUser $user): array
    {
        $this->pointAtTenantDb();

        return ['Authorization' => 'Bearer ' . $user->createToken('test')->plainTextToken];
    }

    protected function apiUrl(string $path): string
    {
        return '/api/' . $this->tenantSlug . '/' . ltrim($path, '/');
    }
}
