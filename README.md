# Kulcs & Kártya Nyilvántartó

Webalapú kulcs- és kártyaellenőrző rendszer Laravel 11 alapokon. Fizikai helyszínekhez rendelt kulcsok és kártyák állapotát lehet rögzíteni, emailben értesítést küldeni, és az előzményeket nyilvántartani.

---

## Funkciók

- **Helyszín alapú ellenőrzés** – több helyszín (épület, szoba, raktár stb.) önálló kulcs/kártya készlettel
- **Ellenőrzési form** – tételek bepipálása, ellenőrző személy neve, opcionális megjegyzés és extra email cím megadása
- **Azonnali email értesítés** – befejezéskor a rendszer emailt küld a helyszín felelősének, a globális értesítési email-re és az opcionálisan megadott extra email-re
- **Előzmények** – minden ellenőrzés adatbázisban tárolódik, szűrhető lista nézetben visszakereshető
- **CSV export** – az előzmények letölthetők táblázatkezelőbe
- **Admin panel** – jelszóvédett felület helyszínek és tételek kezeléséhez, email és jelszó beállításokhoz

---

## Tech stack

| Réteg | Technológia |
|---|---|
| Backend | Laravel 11, PHP 8.2 |
| Adatbázis | SQLite (fejlesztés) / MySQL (production) |
| Frontend | Tailwind CSS v3.4, Alpine.js |
| Asset build | Vite 7 |
| Email | SMTP (Gmail vagy más) |

---

## Telepítés

### Követelmények

- PHP 8.2+
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
```

Az alkalmazás elérhető: `http://localhost:8000`

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

Gmail esetén Google fiókban be kell kapcsolni a 2FA-t, majd generálni egy **app-specific password**-öt.

---

## MySQL váltás (production)

A `.env` fájlban kommenteld ki az SQLite sort és add meg a MySQL adatokat:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=kulcsnyilvantarto
DB_USERNAME=root
DB_PASSWORD=jelszo
```

Majd futtasd újra: `php artisan migrate`

---

## Admin panel

Első belépés: `http://localhost:8000/admin/login`

Az első bejelentkezéskor bármilyen jelszót megadsz, azt rögzíti a rendszer. Jelszót és globális email-t utána az **Admin → Beállítások** menüben lehet módosítani.

### Admin funkciók

- **Helyszínek** – felvétel, szerkesztés, törlés, aktív/inaktív állapot
- **Tételek** – helyszínenként kulcsok és kártyák kezelése (név, típus, sorrend)
- **Beállítások** – globális értesítési email cím, admin jelszó csere

---

## Adatbázis struktúra

```
locations       → helyszínek (név, felelős, email, aktív)
items           → tételek (location_id, név, típus: key/card, sorrend)
checks          → ellenőrzések (location_id, ellenőrző neve, extra email, megjegyzés)
check_items     → ellenőrzés sorok (check_id, item_id, pipált-e)
settings        → rendszerbeállítások (kulcs-érték párok)
```

---

## Projekt struktúra

```
app/
├── Http/Controllers/
│   ├── HomeController.php          # főoldal – helyszín választó
│   ├── CheckController.php         # ellenőrzési form + email küldés
│   ├── HistoryController.php       # előzmények + CSV export
│   ├── AdminController.php         # admin login/logout/dashboard
│   └── Admin/
│       ├── LocationController.php  # helyszín CRUD
│       ├── ItemController.php      # tétel CRUD
│       └── SettingController.php   # email + jelszó beállítások
├── Http/Middleware/
│   └── AdminMiddleware.php         # session alapú admin védelem
├── Mail/
│   └── CheckCompletedMail.php      # email értesítő
└── Models/
    ├── Location.php
    ├── Item.php
    ├── Check.php
    ├── CheckItem.php
    └── Setting.php                 # kulcs-érték tároló helper metodusokkal

resources/views/
├── layouts/
│   ├── app.blade.php               # publikus layout (nav + footer)
│   └── admin.blade.php             # admin layout (sidebar)
├── home.blade.php                  # helyszín kártya nézet
├── check/show.blade.php            # ellenőrzési form
├── history/index.blade.php         # előzmények táblázat
├── admin/
│   ├── login.blade.php
│   ├── dashboard.blade.php
│   ├── settings.blade.php
│   └── locations/                  # CRUD nézetek
└── emails/check_completed.blade.php  # HTML email sablon
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
```

---

## Licenc

MIT
