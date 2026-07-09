# További fejlesztések

Ide kerülnek azok a tudatosan elhalasztott/kihagyott ötletek, amikről nem akarjuk, hogy elfelejtődjenek, de jelenleg nem indokolt megcsinálni.

## CSS container-query (@container) bevezetése

**Státusz:** Kihagyva (2026-07-08, `feature/ui-ux-2026-redesign` branch, UI/UX redesign #3 feladat).

**Miért maradt ki:** Tailwind v3 natívan nem támogatja a `@container` utility-osztályokat, ehhez a `@tailwindcss/container-queries` plugin telepítése kellene (új npm dependency). Emellett a jelenlegi layout-ok (AppLayout/AdminLayout/DirectorLayout/PmLayout/SecurityLeadLayout/SuperAdminLayout) mind fix sidebar + `max-w-7xl` konténerben futnak — nincs olyan felület, ami saját konténer-szélessége alapján, a viewport-tól függetlenül kellene hogy reflow-oljon. A meglévő `sm:`/`md:`/`lg:` viewport-breakpointok jelenleg ugyanazt a vizuális célt szolgálják, plusz komplexitás/dependency nélkül.

**Mikor érdemes újra elővenni:** ha lesz olyan komponens, ami több helyen, eltérő szélességű konténerben (pl. dashboard widget, ami néha félszélességű panelben, néha teljes szélességben jelenik meg) kell hogy másképp törjön sorba — akkor a viewport-alapú breakpoint már nem elég, és a `@tailwindcss/container-queries` plugin (vagy Tailwind v4-re migrálás, ami natívan tudja) indokolttá válik.

**Kapcsolódó:** a `tailwind.config.js`-ben és a projekt memóriában (`project_kulcsnyilvantarto.md`) is rögzítve van, hogy a Node verzió (v22) már nem akadálya egy esetleges Tailwind v4 migrációnak — az a container-query kérdést is natívan megoldaná, ha egyszer sorra kerül.

## Központi Ziggy `route()` típusdeklaráció hiánya

**Státusz:** Feltárva (2026-07-09, `feature/ui-ux-2026-redesign` branch), nincs megoldva.

**Miért probléma:** a `route()` függvényt a Laravel Ziggy csomagja injektálja globálisan futásidőben (`app.blade.php` `@routes` direktívája írja ki a `window.route(...)`-ot) — ez futásidőben mindenhol hibátlanul működik. TypeScript viszont fordítási időben nem ismeri ezt a globális függvényt, hacsak egy fájl nem deklarálja explicit a tetején: `declare function route(name: string, params?: unknown): string;`. Nincs egy központi, projekt-szintű `.d.ts` típusdeklaráció erre — a projekt 89 `.tsx` fájljából 55-ben megvan ez a fájlonkénti, ad-hoc sor, 34-ben (pl. `AppLayout.tsx`, `AdminLayout.tsx`, `PmLayout.tsx`, `SecurityLeadLayout.tsx`, `DirectorLayout.tsx`, `SuperAdminLayout.tsx`, `Portal.tsx`) hiányzik, ezért az `npx tsc --noEmit` ezekben rendszeresen `TS2304: Cannot find name 'route'` hibákat dob.

**Miért nem gond most:** a `npm run build` (Vite/esbuild) nem végez típusellenőrzést, csak transzpilál, ezért minden érintett oldal hibátlanul lefordul és fut — ez pusztán zajt jelent, ha valaki `tsc`-t futtat valódi típusellenőrzésre.

**Megoldás, ha egyszer sorra kerül:** egy központi `resources/js/types/ziggy.d.ts` fájl létrehozása, ami globálisan deklarálja a `route()`-ot (`declare global { function route(name: string, params?: unknown): string; }`), majd a 34 fájlból a redundáns, fájlonkénti `declare function route` sorok eltávolítása. Kis, önmagában biztonságos technikai adósság-takarítás, nem sürgős.
