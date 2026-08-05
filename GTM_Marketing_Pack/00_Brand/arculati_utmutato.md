# Arculati és hangnem-útmutató &ndash; GTM Marketing Pack

Ez a dokumentum a hat szerepkör-csomag közös alapja. Új anyag írásakor ide kell
visszanyúlni, ne az egyes szerepkör-fájlokból másolgatva &ndash; azok gyakran
egyedi kompromisszumot tartalmaznak, ez a dokumentum a szabályt.

## 1. Színpaletta

A forrás a projekt kódja (`tailwind.config.js`, `resources/css/app.css`), nem
szabadon választott B2B-paletta.

### Alap (minden lapon)

| Szerep | Hex | Forrás |
|---|---|---|
| Sötét héj (fejléc, lábléc, kiemelt számsáv) | `#0f172a` | `--brand-chrome`, `bg-slate-900` |
| Alap kék akcent | `#3b82f6` | `--brand-accent` |
| Világos kék akcent | `#60a5fa` | `--brand-accent-light` |
| Mély kék (hover, link) | `#1d4ed8` | app.css |
| Főszöveg | `#0f172a` | |
| Törzsszöveg | `#334155` | |
| Másodlagos szöveg | `#64748b` | |
| Szegély | `#e2e8f0` | |
| Háttér-mosás | `#f8fafc` / `#f1f5f9` | |
| Pozitív jelzés | `#059669` | Tailwind emerald, safelist |
| Figyelmeztetés | `#b45309` | Tailwind amber, safelist |
| Negatív jelzés | `#dc2626` | Tailwind red, safelist |

### Szerepkörönkénti akcentszín

Minden szerepkör saját akcentszínt kap, hogy a hat lap egy csomagban is
megkülönböztethető legyen, de a fenti alapréteg (sötét héj, szövegszínek)
mindegyiken azonos marad.

| Szerepkör | Akcent | Miért ez |
|---|---|---|
| Vagyonőr / portás | `#0d9488` (teal) | Operatív, emberközeli &ndash; nem pénzügyi szín |
| Ingatlankezelő | `#2563eb` (kék) | Bizalom, átláthatóság, semleges felügyelet |
| Biztonsági vezető | `#4f46e5` (indigo) | Kontroll, döntési súly |
| Területi igazgató | `#b45309` (amber) | Figyelmeztető/pénzügyi regiszter &ndash; kontrolling |
| Irodaházi bérlő | `#059669` (emerald) | Nyugalom, biztonságérzet |
| Megbízó / tulajdonos | `#3b82f6` (alap kék) | Visszatér az alaphoz &ndash; ő a márka "hivatalos" nézőpontja |

Új szerepkör felvételekor ne ismételjünk már használt akcentet, és kerüljük
a pirosat/`#dc2626`-ot akcentként &ndash; az a rendszerben negatív jelzés.

## 2. Tipográfia

- Képernyőn és nyomtatásban: **Inter**, nyomtatási fallback `system-ui,
  -apple-system, Segoe UI, Helvetica, Arial, sans-serif`.
- Alap törzsbetű A4 lapon: **9.2pt**. Kivétel: operatív, nem irodai olvasóknak
  szánt lap (pl. vagyonőr) **10.2pt** &ndash; ő nem monitor előtt, hanem
  faliújságon vagy telefonon olvassa.
- Sorköz: 1.45&ndash;1.5.
- Emberi olvasásra szánt gondolatjel: mindig `&ndash;` (en-dash), sosem `--`
  vagy egyszerű kötőjel szóközzel.
- Idézőjel: magyar &bdquo;&hellip;&rdquo;, sosem egyenes `"&hellip;"`.

## 3. Hangnem-szabályok

Ezek a szabályok több felülvizsgálati körből származnak, konkrét hibákra
visszavezetve &ndash; ne térjünk el tőlük érv nélkül.

1. **Ne másolj angol mondatszerkezetet.** A `gondolatjel + kötőszó` (&bdquo;X
   &ndash; és Y&rdquo;) magyarul mindig vessző vagy önálló mondat. Az
   elliptikus szembeállítás (&bdquo;Nem A &ndash; B&rdquo;) helyett mindig
   &bdquo;nem A-t jelent, hanem B-t&rdquo;.
2. **Minden mondatnak legyen igei állítmánya.** Angolban egy gondolatjel
   után természetes a töredékmondat, magyarban nem.
3. **A fő e-mail 150&ndash;250 szó.** Ha hosszabb, húzd &ndash; a B2B olvasó
   nem olvassa végig a harmadik bekezdést.
4. **Nincs öndicséret és alátámaszthatatlan felsőfok.** Töröld az olyan
   fordulatokat, mint &bdquo;a legerősebb funkció&rdquo; vagy &bdquo;amit
   senki nem kap meg&rdquo;. A vevő dönti el, mi erős neki.
5. **Nincs hamis pontosság.** Modellszámításnál kerekíts (&bdquo;kb. +40 e
   Ft&rdquo;, ne &bdquo;+41 600 Ft&rdquo;), és mindig tüntesd fel a
   számítási alapot.
6. **A rendszer még nincs bevezetve sehol.** A csomag célja az előfizetés
   eladása, nem a bevezetés kommunikálása. A nem-vevő szereplőknek (pl.
   dolgozó, bérlő) szánt szöveg feltételes módban fogalmaz, és
   visszajelzést kér, nem tájékoztat. Ha egy szereplő úgy érzi, hogy a
   döntés nélküle született meg, ellenérdekeltté válik.
7. **Ne ígérj olyat, amit a termék nem tud.** Például: ez **nem**
   kapu-/ajtóbeléptető rendszer, hanem bejárás-igazoló. A bérlőnek szánt
   &bdquo;kényelmes beléptetés&rdquo; ígérete hazugság lenne.
8. **A belső és az ügyfélnek küldhető tartalom szigorúan elválik.** A
   kifogáskezelés és a beszélgetés-nyitók a másik fél feltételezett
   motivációit elemzik &ndash; ez soha nem kerülhet ügyfél kezébe. A
   generátor ezt automatikusan szétválasztja a
   `## Kifogáskezelési útmutató` címsornál.

## 4. CTA-stílus

A CTA mindig konkrét, mérhető, időben behatárolt következő lépés, sosem
&bdquo;vegye fel velünk a kapcsolatot&rdquo;. Példa a helyes mintára: &bdquo;3
helyszín, 60 nap, előre rögzített sikerkritériumokkal.&rdquo; A CTA a
dokumentumban mindig a számszerű levezetés (ROI-tábla) **előtt** áll, nem
az utolsó oldal alján, adatsorok mögött.

## 5. Dokumentumszerkezet (A4 adatlap)

Minden szerepkör-adatlap ugyanazt a sorrendet követi: fejléc (kicker, cím,
alcím) &rarr; meta-sáv (3 kulcsadat) &rarr; fájdalompontok &rarr; megoldások
&rarr; számok &rarr; korlátok/GYIK &rarr; kiemelt idézet &rarr; CTA &rarr;
ROI-tábla (ha releváns) &rarr; lábléc. Ezt a `render_flyer()` függvény
kényszeríti ki a generátorban &ndash; szerkezeti eltérést csak ott, kódban
érdemes bevezetni, nem egyedi HTML-szerkesztéssel.
