# Szerver Konfiguráció — Kulcs Nyilvántartó

## Összefoglaló

A KulcsNyilvantarto alkalmazás egy Hetzner VPS-en fut, Coolify PaaS rétegen keresztül, Docker containerben. Nincs domain, az alkalmazás sslip.io subdomain-en érhető el HTTP-n.

---

## Elérhetőség

| Adat | Érték |
|------|-------|
| URL | `http://krhpwagyq2l73lmt029qjztr.178.105.192.10.sslip.io` |
| VPS IP | `178.105.192.10` |
| Protokoll | HTTP (HTTPS nincs konfigurálva, domain nincs) |
| Port (külső) | 80 (Traefik kezeli) |

---

## Infrastruktúra

### Hetzner VPS
- **Szolgáltató:** Hetzner Cloud
- **OS:** Linux
- **IP:** `178.105.192.10`

### Coolify
- **Típus:** Self-hosted PaaS (Coolify v4)
- **Szerepe:** Deploy pipeline, environment variables kezelése, volume management, Traefik reverse proxy konfigurálása
- **Reverse proxy:** Traefik (Coolify beépített)
  - A Traefik hozzáad `X-Forwarded-Proto: https` headert — ezt a kód kezeli (ld. AppServiceProvider)

### Docker
- **Build pack:** Dockerfile (nem Nixpacks)
- **Multi-stage build:**
  - `node:20-alpine` — frontend (Vite/React build)
  - `php:8.3-fpm-alpine` — alkalmazás runtime

---

## Container belső felépítése

### Nginx
- Port: **80** (container belső)
- Config: `docker/nginx.conf`
- Document root: `/app/public`
- PHP forwarding: FastCGI → `127.0.0.1:9000`

### PHP-FPM
- Verzió: **PHP 8.3** (fpm-alpine)
- Port: `9000` (csak localhost, nginx hívja)
- Futási user: `www-data`
- PHP extensions: `pdo`, `pdo_sqlite`, `mbstring`, `bcmath`, `zip`

### Startup script
- Fájl: `docker/start.sh`
- Sorrendben elvégzett műveletek:
  1. `mkdir -p /app/storage/database/tenants` — könyvtár létrehozás (volume mount előtt)
  2. `chmod -R 775 /app/storage/database` — SQLite fájlok írhatósága
  3. `php artisan migrate --force` — adatbázis migrációk
  4. `php artisan storage:link` — symlink (hiba esetén folytatja)
  5. `php artisan config:cache` — konfig cache
  6. `php artisan route:cache` — route cache
  7. `php artisan view:cache` — view cache (hiba esetén folytatja — régi blade view-k miatt)
  8. `chown -R www-data:www-data /app/storage /app/bootstrap/cache` — PHP-FPM jogosultság
  9. `php-fpm -D` + `nginx` indítás

> **Fontos:** Az artisan parancsok `root`-ként futnak, a PHP-FPM `www-data`-ként. A `chown` ezért kötelező a startup végén.

---

## Adatbázis

### Típus
- **SQLite** (multi-tenant)
- Nincs külső adatbázis szerver

### Fájlok helye (containerben)
| Adatbázis | Útvonal |
|-----------|---------|
| Főadatbázis | `/app/storage/database/database.sqlite` |
| Tenant adatbázisok | `/app/storage/database/tenants/{slug}.sqlite` |

### Docker Volume (Coolify)
- **Volume neve:** `laravel-sqlite-data`
- **Container mount pont:** `/app/storage/database`
- **Célja:** Az SQLite fájlok perzisztálása — deploy után sem vesznek el az adatok

> **Kritikus:** A volume mount `/app/storage/database`-re mutat, NEM `/app/database`-re. Ha átállítják, a migrációk eltűnnek a mount alól és "Nothing to migrate" hibát kapnak.

### Kapcsolatok (config/database.php)
| Kapcsolat neve | Szerepe |
|----------------|---------|
| `sqlite` | Főadatbázis (users, tenants, jobs) |
| `tenant` | Tenant adatbázis — futásidőben konfigurálva |

### Tenant migrációk
- Helye: `database/migrations/tenant/`
- A sima `php artisan migrate` csak a főadatbázist migrálja
- Tenant DB létrehozáshoz: `data:import` command (ld. lent), vagy manuálisan:
  ```sh
  php artisan migrate --database=tenant --path=database/migrations/tenant --force
  ```

---

## Adatimport

Az éles adatok importálása JSON exportból történik:

```sh
php artisan data:import
```

- Alapértelmezett forráskönyvtár: `database/export/`
- Struktúra: `export/main/` + `export/tenant_{slug}/`
- A parancs automatikusan létrehozza a tenant SQLite fájlt és lefuttatja a migrációkat

### Importált adatok (induláskori állapot)
| Tenant | Slug |
|--------|------|
| H2o Offices | (h2o-offices) |

---

## Environment Variables (Coolify-ban beállítva)

> A titkos értékeket (APP_KEY, jelszavak) a Coolify Environment Variables felülete tárolja. Soha ne kerüljenek be a git repositoryba.

| Változó | Érték / Megjegyzés |
|---------|-------------------|
| `APP_NAME` | `Kulcs Nyilvántartó` |
| `APP_ENV` | `production` |
| `APP_KEY` | `base64:...` — Coolify-ban tárolva |
| `APP_DEBUG` | `false` |
| `APP_URL` | `http://krhpwagyq2l73lmt029qjztr.178.105.192.10.sslip.io` |
| `APP_LOCALE` | `hu` |
| `DB_CONNECTION` | `sqlite` |
| `SESSION_DRIVER` | `file` |
| `LOG_LEVEL` | `debug` |
| `MAIL_MAILER` | `smtp` |
| `MAIL_HOST` | `smtp.gmail.com` |
| `MAIL_PORT` | `587` |
| `MAIL_USERNAME` | `supportitsecurity@gmail.com` |
| `MAIL_PASSWORD` | Coolify-ban tárolva |
| `SUPER_ADMIN_PASSWORD` | Coolify-ban tárolva |

> **APP_URL és HTTP:** Az `APP_URL` értéke **kötelezően `http://`-vel** kezdődjön, különben az `AppServiceProvider` HTTPS URL-eket generál és a React nem tölt be.

---

## Fontos kódfixek (deployment tanulságok)

### 1. AppServiceProvider — URL scheme
**Fájl:** `app/Providers/AppServiceProvider.php`

Az eredeti kód `URL::forceScheme('https')`-t hívott production-ban, ami felülírta az `APP_URL`-t. Javítás: a scheme-t az `APP_URL`-ből olvassa ki.

```php
$scheme = parse_url(config('app.url'), PHP_URL_SCHEME) ?? 'https';
URL::forceScheme($scheme);
```

### 2. SQLite útvonalak
A `database_path()` helper a `/app/database/` mappára mutat, amit a Docker volume elfed. Minden SQLite elérési út `storage_path('database/...')` formátumot használ:
- `config/database.php`
- `app/Models/Tenant.php`
- `app/Http/Middleware/TenantMiddleware.php`

### 3. Migráció sorrend (tenant)
A `add_sent_by_to_pm_messages_table` migration fájlneve (`2026_06_25_200002`) a `create_pm_messages_table` (`2026_06_25_200001`) után fut — a sorrend timestamp alapján dől el.

### 4. www-data jogosultság
Az artisan parancsok root-ként futnak, PHP-FPM www-data-ként. Ha a `chown` elmarad, a PHP-FPM nem tudja írni a session/log/cache fájlokat → 500-as hiba, üres response body, semmi a logban.

---

## Stack összefoglaló

| Réteg | Technológia |
|-------|-------------|
| Frontend | React 18 + TypeScript + Inertia.js |
| Backend | Laravel 11 (PHP 8.3) |
| Build tool | Vite |
| Routing (JS) | Ziggy |
| Web szerver | Nginx 1.x |
| PHP runtime | PHP-FPM 8.3 |
| Adatbázis | SQLite (multi-tenant) |
| Containerizáció | Docker (multi-stage) |
| PaaS | Coolify v4 |
| VPS | Hetzner Cloud |
| Reverse proxy | Traefik (Coolify beépített) |
| OS (container) | Alpine Linux |
