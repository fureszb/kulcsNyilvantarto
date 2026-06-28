# Kulcs & Kártya Nyilvántartó

Webalapú kulcs- és kártyaellenőrző rendszer Laravel 12 alapokon. Multi-tenant architektúrával, privát üzenetrendszerrel, képzési és vizsgamodullal, valós idejű WebSocket értesítésekkel.

---

## Funkciók

### Kulcs/kártya ellenőrzés
- **Helyszín alapú ellenőrzés** – több helyszín (épület, szoba, raktár stb.) önálló kulcs/kártya készlettel
- **Ellenőrzési form** – tételek bepipálása, ellenőrző személy neve, opcionális megjegyzés és extra email cím
- **Azonnali email értesítés** – befejezéskor emailt küld a felelősnek, globális értesítési email-re és opcionális extra email-re
- **Előzmények** – minden ellenőrzés adatbázisban tárolódik, szűrhető listában visszakereshető
- **CSV export** – az előzmények letölthetők táblázatkezelőbe

### Képzési modul (Training)
- Lépésenként szervezett tartalom képek és videók feltöltésével
- Egyedi `VideoPlayer` komponens: saját vezérlők, progress bar, hangerő, teljesképernyő
- Média zoom modal, szélesség-szabályozás
- 50 MB-os feltöltési limit, kliens- és szerveroldali hibakezelés

### Vizsga modul (Exam)
- Kérdéstípusok: radio (egy helyes), checkbox (több helyes), szöveges válasz
- **Anti-cheat rendszer**: tab/ablakváltás detektálás (`visibilitychange` + `blur`), blokkolási küszöb konfigurálható
- Időkorlát, automatikus beküldés lejáratkor
- Helyes/helytelen kiértékelés szerveroldalon, kísérletszám-limit
- **Admin override**: felhasználónként felülírható kísérletszám
- **Eredményelőzmények**: elvégzett vizsgák visszanézhetők kérdés-szintű bontással (melyik választ jelölte meg), admin mindenkiét látja

### Admin panel
- Felhasználók, helyszínek, tételek, képzések, vizsgák teljes CRUD kezelése
- Vizsga kitöltések listája (szűrhető vizsgára), részletes eredménymegjelenítő
- Tenant-szintű beállítások

### Multi-tenant architektúra
- Bérlőnként izolált SQLite adatbázis
- Tenant specifikus migráció: `php artisan tenant:migrate-all`
- Docker container indulásakor automatikus migrálás minden tenant DB-re

### Egyéb
- **Privát üzenetrendszer (PM)** – üzenetváltás valós idejű WebSocket értesítésekkel
- **Műszaknaplók (Shift Notes)**
- **Tevékenységnapló (Activity Log)** – rendszeresemények auditálása
- **Biztonsági riportok (Security Reports)**
- **Ingatlankezelő (Property Manager)** modul
- **Profilkezelés**

---

## Tech stack

| Réteg | Technológia |
|---|---|
| Backend | Laravel 12, PHP 8.3 |
| Frontend | React 19 + Inertia.js v2, TypeScript, Tailwind CSS v3.4 |
| Asset build | Vite 7 |
| WebSocket | Laravel Reverb |
| Adatbázis | SQLite (tenant DB-k per-tenant) |
| Konténerizáció | Docker (multi-stage build) |
| Reverse proxy | Nginx (konténeren belül) + Traefik (Coolify) + Cloudflare |
| Deploy | Coolify (GitHub auto-deploy) |
| Email | SMTP (Gmail vagy más) |

---

## Telepítés

### Követelmények

- PHP 8.3+ (pcntl extension Reverb-hez)
- Composer 2+
- Node.js 20+
- SQLite

### Lépések

```bash
# 1. Függőségek telepítése
composer install
npm install

# 2. Környezeti konfiguráció
cp .env.example .env
php artisan key:generate

# 3. Adatbázis létrehozása
php artisan migrate

# 4. Storage symlink
php artisan storage:link

# 5. Frontend build
npm run build

# 6. Fejlesztői szerver indítása
php artisan serve

# 7. WebSocket szerver (külön terminalban)
php artisan reverb:start
```

Az alkalmazás elérhető: `http://localhost:8000`

---

## Docker

```bash
docker build -t kulcsnyilvantarto .
docker run -p 80:80 kulcsnyilvantarto
```

A container indulásakor a `start.sh` automatikusan:
- létrehozza a szükséges könyvtárakat (`storage/app/public`, `storage/database/tenants`)
- lefuttatja a migrációkat (`migrate --force`)
- lefuttatja a tenant migrációkat minden SQLite DB-re (`tenant:migrate-all`)
- létrehozza a `storage:link`-et
- cache-eli a konfigurációt, route-okat és view-kat
- elindítja a PHP-FPM és Nginx processeket (supervisord-on keresztül)

### Coolify storage konfigurálása

Coolify-ban 3 persistent storage szükséges:

| Típus | Source / Mount | Destination | Mit tárol |
|---|---|---|---|
| Volume | `laravel-uploads-data` | `/app/storage/app` | Feltöltött fájlok (képek, videók) |
| Volume | `bejelentkezve-marad` | `/app/storage/framework/sessions` | Session fájlok |
| Directory | `/laravel-sqlite-data` | `/app/storage/database` | SQLite adatbázisok |

---

## Email konfiguráció

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=te@gmail.com
MAIL_PASSWORD=gmail_app_specific_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=te@gmail.com
MAIL_FROM_NAME="Kulcs Nyilvántartó"
```

Gmail esetén 2FA szükséges, majd generálj egy **app-specific password**-öt.

---

## Admin panel

Első belépés: `http://localhost:8000/{tenant}/admin/login`

Az első bejelentkezéskor bármilyen jelszót megadsz, azt rögzíti a rendszer. Jelszót és globális email-t utána az **Admin → Beállítások** menüben lehet módosítani.

---

## Fejlesztés

```bash
# Hot reload módban
npm run dev

# Production build
npm run build

# Route lista
php artisan route:list

# Tenant migrációk
php artisan tenant:migrate-all

# WebSocket szerver debug módban
php artisan reverb:start --debug
```

---

## Ismert infrastruktúra-problémák és megoldásaik

### Videó nem játszik le Safari/iOS/Mac eszközökön

**Tünet:** Videolejátszó örökös loading spinnert mutat iPhone-on és Mac Safariban, de Windows/Android Chrome-on működik.

**Gyökér ok:** A Safari/WebKit **kötelezően byte-range (`Range: bytes=X-Y`) kéréseket** küld videókhoz, és `206 Partial Content` választ vár (`Accept-Ranges: bytes` headerrel). Chrome (Blink) toleránsabb, a teljes fájlt is le tudja tölteni és lejátszani. A probléma láncolata:

1. Az Nginx statikus fájloknál automatikusan hozzáadja az `Accept-Ranges: bytes` headert
2. A **Coolify Traefik reverse proxy** azonban levágja ezt a headert a válaszból
3. A **Cloudflare CDN** ezért `Accept-Ranges` nélkül cache-eli a fájlt
4. Safari byte-range kérésre `200 OK` (teljes fájl) érkezik `206 Partial Content` helyett → lejátszás megtagadva

**Megoldás:** A `/storage/` URL-ek helyett egy dedikált `/stream/{path}` PHP route szolgálja ki a videófájlokat. A Symfony `BinaryFileResponse` (amit Laravel `response()->file()` használ) natívan kezeli a `Range` headert és mindig helyes `206` választ ad — Nginx/Traefik/Cloudflare konfigurációtól függetlenül.

```php
// routes/web.php
Route::get('/stream/{path}', function (string $path) {
    $storageRoot = realpath(storage_path('app/public'));
    $fullPath    = realpath(storage_path('app/public/' . ltrim($path, '/')));

    if (!$fullPath || !$storageRoot || !str_starts_with($fullPath, $storageRoot . DIRECTORY_SEPARATOR)) {
        abort(404);
    }

    return response()->file($fullPath, ['Cache-Control' => 'public, max-age=86400']);
})->where('path', '.*');
```

A `VideoPlayer` komponens automatikusan transzformálja az URL-t:
```ts
// /storage/trainings/... → /stream/trainings/...
const src = rawSrc.replace(/\/storage\//, '/stream/');
```

**Diagnózis lépések** ha hasonló probléma merül fel:
```bash
# 1. Ellenőrizd a response headereket
curl -I https://your-domain.com/storage/path/to/video.mp4

# 2. Teszteld a range request támogatást (206-ot kell kapni)
curl -I -H "Range: bytes=0-1023" https://your-domain.com/storage/path/to/video.mp4

# 3. Ha Cloudflare van előtte, bypass-old a cache-t query stringgel
curl -I https://your-domain.com/storage/path/to/video.mp4?cb=1
```

### WebSocket channel auth nem működik Docker/production környezetben

**Tünet:** A WebSocket kapcsolat (101 Switching Protocols) felépül, de a privát csatorna authorization kérése (`POST /broadcasting/auth`) hibával tér vissza, az üzenetek csak az 5 másodperces polling miatt frissülnek.

A hiba három egymástól független okból állt fenn, amelyek sorban jelentkeztek:

---

#### 1. `VITE_*` env változók undefined a bundleben

**Hiba:** `wss://undefined` – az Echo nem tud csatlakozni.

**Gyökér ok:** A `VITE_REVERB_*` változókat a Vite build-időben süti bele a bundleba. Docker multi-stage buildnél az első stage-ben nincs `ARG` deklaráció → a változók `undefined`-ként kerülnek a JS bundlebe, még ha a konténer futásakor be is vannak állítva.

**Megoldás:** Runtime injektálás Blade template-ből, `config()` hívással (nem `env()`, mert `config:cache` után az `env()` Blade-ből null-t ad vissza):

```blade
{{-- resources/views/app.blade.php --}}
<script>
window.__REVERB_CONFIG__ = {
    key:     '{{ config("broadcasting.connections.reverb.key") }}',
    wsHost:  '{{ config("reverb.servers.reverb.hostname") }}',
    wsPort:   {{ (int) config("reverb.apps.apps.0.options.port", 443) }},
    forceTLS: {{ config("reverb.apps.apps.0.options.scheme", "https") === "https" ? "true" : "false" }}
};
</script>
```

```ts
// resources/js/echo.ts
const cfg = window.__REVERB_CONFIG__ ?? {};
instance = new Echo({
    broadcaster: 'reverb',
    key: cfg.key,
    wsHost: cfg.wsHost,
    // ...
});
```

---

#### 2. `config/broadcasting.php` rossz kulcsneveket használt → 500

**Hiba:** `POST /broadcasting/auth` → 500 Internal Server Error.

**Gyökér ok:** A `BroadcastManager::createPusherDriver()` a `$config['key']` és `$config['secret']` kulcsokat olvassa. A `config/broadcasting.php`-ban viszont `app_key` és `app_secret` volt. PHP 8.1-ben a `hash_hmac($algo, $data, null)` `TypeError`-t dob (strict null handling), ezért 500-as hiba keletkezett.

**Megoldás:** A `config/broadcasting.php` reverb blokkjában a kulcsneveket átírni:

```php
'reverb' => [
    'driver'  => 'reverb',
    'app_id'  => env('REVERB_APP_ID'),
    'key'     => env('REVERB_APP_KEY'),    // volt: app_key
    'secret'  => env('REVERB_APP_SECRET'), // volt: app_secret
    // ...
],
```

---

#### 3. `routes/channels.php` soha nem töltődött be → 403

**Hiba:** `POST /broadcasting/auth` → 403 Forbidden.

**Gyökér ok:** Laravel 11-ben a `bootstrap/app.php` `withRouting()` metódusa explicit `channels:` paramétert igényel a `routes/channels.php` betöltéséhez. Enélkül a `Broadcast::channel()` bejegyzések soha nem regisztrálódnak. Amikor `Broadcast::auth()` hívódik, a belső `verifyUserCanAccessChannel()` az üres csatornalistán nem talál egyező mintát, és `AccessDeniedHttpException`-t dob → 403.

**Megoldás:**

```php
// bootstrap/app.php
->withRouting(
    web:      __DIR__.'/../routes/web.php',
    channels: __DIR__.'/../routes/channels.php', // ez hiányzott
    commands: __DIR__.'/../routes/console.php',
    health:   '/up',
)
```

---

#### Kiegészítő: PM felhasználók 302-t kaptak az auth endpointon

**Tünet:** Property Manager userként a WebSocket auth 302 redirect-et kapott.

**Gyökér ok:** A `/broadcasting/auth` route korábban a `tenant-user` middleware csoporton belül volt. A `TenantUserMiddleware` PM usereket a `pm.dashboard` route-ra irányít át → az auth kérés 302-t kapott JSON helyett → a csatorna auth csendesen meghiúsult.

**Megoldás:** Az auth route-ot ki kellett emelni a `tenant-user` csoportból, és közvetlenül `tenant` middleware szintre tenni egyedi guard ellenőrzéssel:

```php
// routes/web.php – tenant middleware szinten, tenant-user csoporton kívül
Route::post('/broadcasting/auth', function (Request $request) {
    if (!Auth::guard('tenant')->check()) {
        abort(403);
    }
    $request->setUserResolver(fn() => Auth::guard('tenant')->user());
    return Broadcast::auth($request);
})->name('broadcasting.auth');
```

---

## Licenc

MIT
