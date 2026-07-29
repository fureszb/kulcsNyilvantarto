# Prompt — KulcsNyilvántartó mobil UI implementáció (Kotlin, iOS + Android)

> Másold be ezt a promptot egy új AI-session elejére a KKnyilvantartoKOTLIN repóban. Csatold mellé a `figma-mobile-spec.md` fájlt is (vagy másold be a tartalmát a beszélgetésbe).

---

## Szerepkör és kontextus

Kotlin Multiplatform (Compose Multiplatform, iOS + Android közös UI-réteg) mobilalkalmazáson dolgozol: **KulcsNyilvántartó** — NFC-alapú beléptető, jelenlét- és biztonságkezelő app biztonsági őrök, security lead-ek, property managerek és területi igazgatók számára.

Egy design-review munkamenet során a **Figma design system fájlban** (`https://www.figma.com/design/eWb9pLdodZDpZ5xex73yy6/KulcsNyilvantarto-Mobile---Design-System`) számos új képernyőt terveztünk meg és meglévőket módosítottunk. A cél: **ezeket beépíteni a valódi Kotlin kódbázisba**, pixel-hűen követve a Figma designt, de a projekt már meglévő architektúrájába illesztve.

A mellékelt **`figma-mobile-spec.md`** a forrás-igazság (source of truth) minden funkcionális és vizuális részletre: design tokenek, navigációs szabályok, és képernyőnkénti specifikáció.

---

## Első lépés — MINDIG ezzel kezdd (kötelező, ne hagyd ki)

Mielőtt bármilyen UI kódot írnál:

1. **Térképezd fel a meglévő kódbázist**: navigációs gráf (pl. Voyager / Compose Navigation / decompose — nézd meg melyiket használja a projekt), theming/design-token rendszer (van-e már `Color.kt` / `Theme.kt` szerű fájl), meglévő screen-ek felépítése (mappastruktúra, naming convention, state-kezelés — MVI/MVVM/Compose state hoisting), meglévő komponens-könyvtár (van-e már pl. `PrimaryButton`, `Card`, `Badge` composable).
2. **Illeszkedj a meglévő mintákhoz** — ne vezess be új architektúrát, DI-mintát vagy navigációs library-t, ha már van bevett gyakorlat. Ha valami hiányzik (pl. nincs even egy alap design-token fájl), azt hozd létre a meglévő stílushoz igazodva.
3. Ha bizonytalan vagy egy meglévő minta helyességében, **kérdezz vissza**, mielőtt guessed feltevésekre alapozol egy nagy funkciócsomagot.

---

## Figma használata — mikor és hogyan

Van hozzáférésed a Figma MCP szerverhez. **Használd vizuális referenciának és pontos érték-forrásnak**, ne csak a markdown spec alapján dolgozz vakon:

- **`get_screenshot(fileKey, nodeId)`** — ha látnod kell, hogyan néz ki ténylegesen egy képernyő/komponens, mielőtt implementálod.
- **`get_design_context(fileKey, nodeId)`** — ha pontos méret, spacing, szín, font vagy layout-érték kell egy adott node-hoz (ez adja a legmegbízhatóbb, kódra fordítható adatot).
- **`get_metadata(fileKey, nodeId)`** — ha egy képernyő teljes rétegstruktúráját akarod áttekinteni, mielőtt lemész egy konkrét elemre.

**`fileKey`**: `eWb9pLdodZDpZ5xex73yy6`

### Node ID referencia (közvetlenül ugorj ide, ne keresgélj)

| Képernyő / elem | Figma node ID |
|---|---|
| Login | `16:159` |
| Üdvözlő animáció (post-login) | `139:1708` |
| Onboarding — Üdvözlés | `52:844` |
| Onboarding — NFC funkció kártya *(új)* | `147:1738` |
| Onboarding — Élő jelenlét funkció kártya *(új)* | `147:1776` |
| Onboarding — Helymeghatározás engedély | `52:821` |
| Onboarding — NFC engedély | `52:831` |
| Kezdőlap | `22:237` |
| Kezdőlap → `live_widget` ("Élő adatok") | `143:1708` |
| Kezdőlap → `quick_row_3` (NFC + Vészhelyzet) | `145:1708` |
| Kezdőlap coach mark — 1/3 lépés | `149:1976` |
| Kezdőlap coach mark — 2/3 lépés | `152:1808` |
| Kezdőlap coach mark — 3/3 lépés | `153:1900` |
| Director / Áttekintés | `48:702` |
| Security Lead / Csapat | `49:743` |
| Property Manager / Áttekintés | `49:806` |
| Térkép | `37:572` |
| NFC előzmények *(új)* | `131:1705` |
| Mai bejárás — NFC ellenőrzőlista *(új)* | `131:1711` |
| Oktatás lejátszása *(új)* | `134:1705` |
| Vizsga kitöltése *(új)* | `134:1711` |
| Elfelejtett jelszó (módosított) | `45:654` |

Ha egy node ID érvénytelenné válna (a Figma fájl azóta módosult), keress rá névre a `get_metadata` hívással a szülő page-en (`App Screens`), mielőtt feladod.

---

## Implementációs sorrend (javasolt fázisok)

Ne egyszerre próbáld az egészet — haladj fázisokban, **minden fázis után fordítható, futtatható állapotot hagyj magad után**, és jelezz vissza, mielőtt a következőre lépnél.

1. **Fázis 0 — Alapok**: design tokenek (`figma-mobile-spec.md` 1. fejezet) beépítése a projekt téma-rendszerébe, ha még nincsenek benne. A globális navigációs/fejléc-szabályok (2. fejezet) beépítése egy megosztott komponensbe (pl. `AppTopBar`, `BottomNavBar`), ha ilyen még nem létezik, vagy a meglévő frissítése a szabályoknak megfelelően.
2. **Fázis 1 — Auth & Onboarding**: Login (tenant mező), Üdvözlő animáció, Onboarding 5 kártyás flow (3–5. fejezet).
3. **Fázis 2 — Kezdőlap**: meglévő Kezdőlap screen bővítése az "Élő adatok" widget-tel, az új quick action sorral, és a coach mark overlay-jal (5–6. fejezet).
4. **Fázis 3 — Admin dashboardok**: szerepkör-badge színkódolás + sparkline widget a 3 admin dashboardra (7. fejezet).
5. **Fázis 4 — Térkép**: teljes redesign (8. fejezet) — ez a legnagyobb egyedi darab, érdemes külön PR-ban.
6. **Fázis 5 — NFC modul**: NFC előzmények + Mai bejárás checklist (9. fejezet) — ÚJ képernyők, új navigációs route-ok kellenek.
7. **Fázis 6 — Oktatás & Vizsga**: video lejátszó + kvíz felület (10. fejezet) — ezekhez valós videó lejátszás / timer logika is kell, nem csak statikus UI.
8. **Fázis 7 — Elfelejtett jelszó módosítás** (11. fejezet) — kis terjedelmű, bármikor beszúrható.

---

## Amit figyelembe kell venned funkcionálisan (nem csak vizuálisan)

A spec `.md` fájl minden szekciójában van egy **"Adatforrás" / "Implementációs jegyzet"** rész — ezek jelzik, hogy egy adott UI-elem mögé milyen valós adatnak/API-hívásnak/state-nek kell kerülnie (pl. real-time jelenlét-számláló, heti aggregált trend endpoint, videó lejátszás state, kvíz timer, NFC napló szűrés a bejelentkezett userre). **Ne építs csak statikus mock UI-t** — ha egy szükséges backend endpoint még nem létezik a Laravel oldalon, jelezd vissza explicit módon, és ne találj ki API-szerződést guess alapján.

A "Konzisztencia-javítások" szekció (12. fejezet) **kódolási szabályokat** rögzít (pl. Bottom Nav mindig a fizikai képernyő aljához rögzítve, minden fejléc-variánsnak legyen vissza gombja) — ezeket globális komponens-szinten kell érvényesíteni, nem képernyőnként külön-külön újraírva.

---

## Amit KERÜLJ

- Ne vezess be új third-party library-t (pl. új image-loading, animáció vagy charting library) anélkül, hogy megkérdeznéd — nézd meg, mi van már a `build.gradle.kts`-ben, és abból gazdálkodj.
- Ne módosíts olyan meglévő screen-t, ami nincs a spec-ben említve.
- Ne generálj végleges business logic-ot (pl. tenant-validáció, NFC driver-integráció) találgatásból — jelezd, ha ehhez backend-kontraktus vagy natív platform API kell, amit előbb tisztázni kell.
- A coach mark és onboarding **csak első bejelentkezéskor** jelenjen meg — perzisztens flag-gel (helyi storage / DataStore / UserDefaults-KMP), ne minden indításkor.

---

## Deliverable minden fázis végén

1. Rövid összefoglaló, mely fájlok jöttek létre/módosultak.
2. Amennyiben van emulator/simulator elérés, egy futtatott screenshot-tal igazolt bizonyíték, hogy a képernyő ténylegesen megjelenik és megegyezik a Figma design-dzsal (hasonlítsd össze a `get_screenshot` eredményével).
3. Nyílt kérdések / feltételezések listája, amit vissza kell igazoltatni, mielőtt a következő fázisra lépsz.
