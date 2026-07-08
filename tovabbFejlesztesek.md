# További fejlesztések

Ide kerülnek azok a tudatosan elhalasztott/kihagyott ötletek, amikről nem akarjuk, hogy elfelejtődjenek, de jelenleg nem indokolt megcsinálni.

## CSS container-query (@container) bevezetése

**Státusz:** Kihagyva (2026-07-08, `feature/ui-ux-2026-redesign` branch, UI/UX redesign #3 feladat).

**Miért maradt ki:** Tailwind v3 natívan nem támogatja a `@container` utility-osztályokat, ehhez a `@tailwindcss/container-queries` plugin telepítése kellene (új npm dependency). Emellett a jelenlegi layout-ok (AppLayout/AdminLayout/DirectorLayout/PmLayout/SecurityLeadLayout/SuperAdminLayout) mind fix sidebar + `max-w-7xl` konténerben futnak — nincs olyan felület, ami saját konténer-szélessége alapján, a viewport-tól függetlenül kellene hogy reflow-oljon. A meglévő `sm:`/`md:`/`lg:` viewport-breakpointok jelenleg ugyanazt a vizuális célt szolgálják, plusz komplexitás/dependency nélkül.

**Mikor érdemes újra elővenni:** ha lesz olyan komponens, ami több helyen, eltérő szélességű konténerben (pl. dashboard widget, ami néha félszélességű panelben, néha teljes szélességben jelenik meg) kell hogy másképp törjön sorba — akkor a viewport-alapú breakpoint már nem elég, és a `@tailwindcss/container-queries` plugin (vagy Tailwind v4-re migrálás, ami natívan tudja) indokolttá válik.

**Kapcsolódó:** a `tailwind.config.js`-ben és a projekt memóriában (`project_kulcsnyilvantarto.md`) is rögzítve van, hogy a Node verzió (v22) már nem akadálya egy esetleges Tailwind v4 migrációnak — az a container-query kérdést is natívan megoldaná, ha egyszer sorra kerül.
