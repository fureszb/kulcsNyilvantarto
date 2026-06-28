# Kulcs & Kártya Nyilvántartó

Webalapú kulcs- és kártyaellenőrző rendszer Laravel 11 alapokon. Multi-tenant architektúrával, privát üzenetrendszerrel, képzési modullal és valós idejű WebSocket értesítésekkel.

---

## Funkciók

### Kulcs/kártya ellenőrzés
- **Helyszín alapú ellenőrzés** – több helyszín (épület, szoba, raktár stb.) önálló kulcs/kártya készlettel
- **Ellenőrzési form** – tételek bepipálása, ellenőrző személy neve, opcionális megjegyzés és extra email cím
- **Azonnali email értesítés** – befejezéskor a rendszer emailt küld a helyszín felelősének, a globális értesítési email-re és az opcionálisan megadott extra email-re
- **Előzmények** – minden ellenőrzés adatbázisban tárolódik, szűrhető lista nézetben visszakereshető
- **CSV export** – az előzmények letölthetők táblázatkezelőbe

### Admin panel
- Jelszóvédett felület helyszínek és tételek kezeléséhez, email és jelszó beállításokhoz
- Admin security toggle – biztonsági szintű hozzáférés-szabályozás

### Multi-tenant architektúra
- Bérlőnként izolált SQLite adatbázis
- Tenant specifikus migráció (`tenant:migrate-all`)
- Docker container indulásakor automatikus migrálás minden tenant DB-re

### Portal – Inertia.js/React frontend
- **Privát üzenetrendszer (PM)** – üzenetváltás, válasz funkció real-time WebSocket értesítésekkel
- **Képzési modul (Training)** – lépésenként szervezett tartalom, képek és videók feltöltésével
  - Média zoom modal, szélesség-szabályozás
  - 50 MB-os feltöltési limit, kliens- és szerveroldali hibakezelés
- **Műszaknaplók (Shift Notes)** – műszakhoz kötött feljegyzések
- **Tevékenységnapló (Activity Log)** – rendszereseményekek auditálása
- **Biztonsági riportok (Security Reports)**
- **Vizsgák (Exams)**
- **Profilkezelés**
- **Ingatlankezelő (Property Manager)** modul

### Valós idejű funkciók (Laravel Reverb + WebSocket)
- PM értesítések érkezéskor azonnali push
- Válasz érkezésekor router reload, live frissítés
- Laravel Echo integráció React oldalon (`echo.ts`)

---

## Tech stack

| Réteg | Technológia |
|---|---|
| Backend | Laravel 11, PHP 8.2 |
| Frontend | React 18 + Inertia.js, TypeScript, Tailwind CSS v3.4 |
| Asset build | Vite 7 |
| WebSocket | Laravel Reverb |
| Adatbázis | SQLite (tenant DB-k) / MySQL (production) |
| Konténerizáció | Docker |
| Email | SMTP (Gmail vagy más) |

---

## Telepítés

### Követelmények

- PHP 8.2+ (pcntl extension Reverb-hez)
- Composer 2+
- Node.js 18+ (Node 20+ ajánlott)
- SQLite vagy MySQL

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

# 4. Frontend build
npm run build

# 5. Fejlesztői szerver indítása
php artisan serve

# 6. WebSocket szerver (külön terminalban)
php artisan reverb:start
```

Az alkalmazás elérhető: `http://localhost:8000`

---

## Docker

```bash
docker build -t kulcsnyilvantarto .
docker run -p 8000:8000 kulcsnyilvantarto
```

A container indulásakor a `start.sh` automatikusan:
- lefuttatja a migrációkat minden tenant SQLite DB-re
- létrehozza a `storage:link`-et
- elindítja a PHP-FPM és Nginx processeket

---

## Email konfiguráció

A `.env` fájlban kell beállítani az SMTP adatokat:

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

## MySQL váltás (production)

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=kulcsnyilvantarto
DB_USERNAME=root
DB_PASSWORD=jelszo
```

Majd: `php artisan migrate`

---

## Admin panel

Első belépés: `http://localhost:8000/admin/login`

Az első bejelentkezéskor bármilyen jelszót megadsz, azt rögzíti a rendszer. Jelszót és globális email-t utána az **Admin → Beállítások** menüben lehet módosítani.

### Admin funkciók

- **Helyszínek** – felvétel, szerkesztés, törlés, aktív/inaktív állapot
- **Tételek** – helyszínenként kulcsok és kártyák kezelése (név, típus, sorrend)
- **Beállítások** – globális értesítési email cím, admin jelszó csere, biztonsági szint

---

## Adatbázis struktúra

```
locations       → helyszínek (név, felelős, email, aktív)
items           → tételek (location_id, név, típus: key/card, sorrend)
checks          → ellenőrzések (location_id, ellenőrző neve, extra email, megjegyzés)
check_items     → ellenőrzés sorok (check_id, item_id, pipált-e)
settings        → rendszerbeállítások (kulcs-érték párok)
pm_messages     → privát üzenetek (feladó, címzett, tartalom, válasz hivatkozás)
training_steps  → képzési lépések (cím, leírás, média)
shift_notes     → műszaknaplók
activity_logs   → rendszer tevékenységnapló
```

---

## Projekt struktúra

```
app/
├── Http/Controllers/
│   ├── HomeController.php              # főoldal – helyszín választó
│   ├── CheckController.php             # ellenőrzési form + email küldés
│   ├── HistoryController.php           # előzmények + CSV export
│   ├── AdminController.php             # admin login/logout/dashboard
│   ├── PmMessageController.php         # privát üzenetrendszer
│   ├── TrainingController.php          # képzési modul
│   ├── ShiftNoteController.php         # műszaknaplók
│   ├── ActivityLogController.php       # tevékenységnapló
│   ├── SecurityReportController.php    # biztonsági riportok
│   ├── ExamController.php              # vizsgák
│   ├── ProfileController.php           # profil kezelés
│   ├── PropertyManagerController.php   # ingatlankezelő
│   ├── LandingController.php           # landing oldal
│   ├── TenantUserAuthController.php    # tenant autentikáció
│   └── Admin/
│       ├── LocationController.php      # helyszín CRUD
│       ├── ItemController.php          # tétel CRUD
│       └── SettingController.php       # email + jelszó beállítások
│   └── SuperAdmin/
├── Http/Middleware/
│   └── AdminMiddleware.php             # session alapú admin védelem
├── Mail/
│   └── CheckCompletedMail.php          # email értesítő
└── Models/
    ├── Location.php
    ├── Item.php
    ├── Check.php
    ├── CheckItem.php
    ├── Setting.php
    └── PmMessage.php

resources/
├── js/
│   ├── Pages/                          # Inertia.js React oldalak
│   ├── Components/                     # újrahasználható React komponensek
│   ├── Layouts/                        # layout komponensek
│   ├── hooks/                          # custom React hook-ok
│   ├── utils/                          # segédfüggvények
│   ├── types/                          # TypeScript típusdefiníciók
│   ├── echo.ts                         # Laravel Echo WebSocket konfiguráció
│   └── app.tsx                         # alkalmazás belépési pont
└── views/
    ├── layouts/
    │   ├── app.blade.php               # publikus layout
    │   └── admin.blade.php             # admin layout
    ├── home.blade.php
    ├── check/show.blade.php
    ├── history/index.blade.php
    ├── admin/
    └── emails/check_completed.blade.php
```

---

## Fejlesztés

```bash
# Hot reload módban
npm run dev

# Production build
npm run build

# Route lista
php artisan route:list

# Adatbázis reset
php artisan migrate:fresh

# Tenant migrációk
php artisan tenant:migrate-all

# WebSocket szerver
php artisan reverb:start --debug
```

---

## Licenc

MIT
