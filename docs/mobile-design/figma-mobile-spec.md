# KulcsNyilvántartó Mobile — UI/UX specifikáció

> Forrás: [Figma – KulcsNyilvántartó Mobile Design System](https://www.figma.com/design/eWb9pLdodZDpZ5xex73yy6/KulcsNyilvantarto-Mobile---Design-System)
> Ez a dokumentum az adott Figma-fájlon végzett módosítások és új képernyők implementációs specifikációja Kotlin Multiplatform (Compose Multiplatform, iOS + Android) fejlesztéshez.

---

## 1. Design tokens

### 1.1 Színek

| Token | Hex | Használat |
|---|---|---|
| `primaryBlue` | `#2563EB` | Elsődleges márkaszín — gombok, fejléc háttér, aktív állapotok |
| `successGreen` | `#059669` | "Sikeres" / "Aktív" / "Kész" állapotok |
| `errorRed` | `#DC2626` | "Elutasítva" / "Vészhelyzet" / hiba állapotok |
| `amber` | `#D97706` | "Esedékes" / figyelmeztető állapotok |
| `directorPurple` | `#6E53E0` | Területi igazgató szerepkör-szín |
| `screenBg` | `#F8FAFC` | Alap háttérszín (screen background) |
| `cardBg` | `#FFFFFF` | Kártya/panel háttér |
| `textPrimary` | `#0F172A` | Fő szövegszín |
| `textMuted` | `#475569` | Másodlagos szöveg (leírások, alcímek) |
| `textPlaceholder` | `#94A3B8` | Placeholder / harmadlagos szöveg |
| `borderLight` | `#E2E8F0` | Kártya keret, elválasztó vonalak |
| `tintBlue` | `#EFF6FF` | Ikon-háttér, info kártya háttér (kék) |
| `tintGreen` | `#ECFCF5` | Badge/ikon háttér (zöld — siker) |
| `tintRed` | `#FEF2F2` | Badge/ikon háttér (piros — hiba) |
| `tintAmber` | `#FFFBEB` | Badge/ikon háttér (borostyán — várakozó) |

A paletta gyakorlatilag Tailwind slate/blue/emerald/red/amber skálára illeszkedik — Kotlin oldalon érdemes egy hasonló, lépcsőzetes (50/100/500/600/900) tokenkészletet létrehozni.

### 1.2 Sugarak (corner radius)

| Elem | Radius |
|---|---|
| Fejléc (`top_app_bar` / `header` konténer) | **felül 0, alul 23** (csak lent lekerekített) |
| Bottom Navigation (lebegő pill) | **32** (teljesen lekerekített "buborék") |
| Kártyák (card, badge-container) | 12–18 (kontextustól függően) |
| Badge / pill / gomb | 999 (teljesen kerek) vagy 12 (gomb) |
| Input mező | 8 |

### 1.3 Tipográfia

Inter betűtípus, súlyok: Regular / Medium / Semi Bold / Bold.
- Képernyőcím (fejléc): 30px Bold, fehér
- Szekciócím: 14px Medium, `textPlaceholder` szín, csupa nagybetű ajánlott
- Kártya cím: 14–16px Medium/Semi Bold
- Törzsszöveg: 12–14px Regular

---

## 2. Globális navigációs és layout szabályok

### 2.1 Bottom Navigation

- **Minden fő tab-képernyőn** (Kezdőlap, Helyszínek, Jelenlét, Menü, Profil, és a belőlük drillelt admin dashboardok) **egységesen** a lekerekített, lebegő "buborék" `Bottom Navigation` komponenst kell használni.
- Stílus: `cornerRadius 32`, fehér háttér 78% opacitással, két rétegű drop shadow (lebegő hatás), 16px margó minden oldalon, **abszolút pozícionált** a képernyő alján (a tartalom fölött lebeg, nem a normál flow része).
- **Pozíció hosszabb (scrollozható) képernyőkön**: a nav mindig a **teljes képernyő aljához** van rögzítve (`y = frameHeight - navHeight - 16`), **nem** az első 844px-es "fold"-hoz — pontosan úgy, ahogy egy natív app-ban a bottom bar mindig a fizikai viewport alján marad, függetlenül a tartalom görgetésétől.
- 5 elem: Kezdőlap · Helyszínek · Jelenlét · Menü · Profil. Az aktív elem kék, a többi szürke.
- Admin/drill-in nézeteknél (pl. Térkép) a "Helyszínek" tab marad aktívan kiemelve, jelezve a szülő-szekciót.

### 2.2 Fejléc-konténer szabály

Két fajta fejléc-konténer létezik a fájlban — implementációkor **mindkettőre** ugyanazt a lekerekítés-szabályt kell alkalmazni:
- `top_app_bar` — a legtöbb almenü/lista képernyőn
- `header` — a Kezdőlap, Director/Áttekintés, Security Lead/Csapat, Property Manager/Áttekintés dashboard-jellegű képernyőin

**Szabály:** mindkettő `topLeftRadius: 0, topRightRadius: 0, bottomLeftRadius: 23, bottomRightRadius: 23` — a fejléc éles sarkokkal simul a képernyő tetejéhez, alul lekerekített.

### 2.3 "Vissza" gomb szabály

- Minden **almenü / drill-in / részlet** képernyőnek van `compact_row` (‹ Vissza pill gomb + cím) a fejlécében — **beleértve** a hozzá tartozó Loading / Empty / Error állapot-variánsokat is (konzisztencia-szabály: ha a fő állapot rendelkezik vissza gombbal, minden állapot-variánsnak is kell).
- A **fő tab-gyökér** képernyők (Kezdőlap, Helyszínek, Jelenlét, Profil, Menü) **nem** kapnak vissza gombot — csak nagy (30px) címet.
- Padding: `left/right 20, top 52, bottom 16`; `primaryAxisAlignItems: MIN`, `counterAxisAlignItems: MIN`.

---

## 3. Bejelentkezés & Onboarding

### 3.1 Login

**Mezők sorrendje (fentről lefelé):**
1. **Cég azonosító** (tenant/multi-tenant azonosító) — *placeholder: "pl. varga-biztonsag"* — **ÚJ mező**, az e-mail elé kerül
2. E-mail cím
3. Jelszó
4. "Elfelejtett jelszó?" link
5. "Bejelentkezés" gomb (primary)

**Működés:** a Cég azonosító mező alapján tölti be a kliens, hogy melyik tenant/subdomain adatbázisához csatlakozzon (multi-tenant architektúra — lásd Laravel backend tenant-routing).

### 3.2 Üdvözlő animáció (post-login welcome)

Új, teljes képernyős, **automatikusan eltűnő** átmeneti képernyő, ami sikeres bejelentkezés után jelenik meg, mielőtt a Kezdőlapra navigálna.

- Háttér: `primaryBlue`
- Tartalom (függőlegesen középre igazítva): fehér kör avatar (monogram, pl. "VK") → **"Szia, {felhasználó neve}!"** (26px Bold, fehér) → "Sikeres bejelentkezés" alcím → szerepkör badge (pl. "TERÜLETI IGAZGATÓ", félig áttetsző fehér pill)
- Alul: vékony (80×4px) auto-dismiss progress csík, ami a képernyő élettartama alatt balról jobbra kitöltődik

**Animáció-spec:**
| Fázis | Időzítés | Leírás |
|---|---|---|
| Belépés | 0–250ms | avatar + szöveg fade-in + scale (0.9→1.0) |
| Megtartás | 250–1450ms | statikus, eközben a progress csík 0%→100%-ig tölt |
| Kilépés | 1450–1700ms | teljes tartalom fade-out |
| Navigáció | 1700ms | átirányítás a Kezdőlapra (nincs vissza-gomb, nem lehet manuálisan visszalépni erre a képernyőre) |

### 3.3 Onboarding flow (5 lépés)

Lapozható, page-dot indikátoros kártyasorozat, **csak az első bejelentkezéskor** jelenik meg (perzisztens flag alapján, pl. `hasSeenOnboarding: Boolean` a helyi storage-ban).

| # | Képernyő | Típus | Tartalom |
|---|---|---|---|
| 1 | Üdvözlés | Hero illusztráció | "Üdvözlünk!" + rövid app-leírás |
| 2 | **NFC-alapú gyors beléptetés** *(ÚJ)* | Hero illusztráció | "Koppints a beléptető matricához, és már bent is vagy — nincs több kártya vagy PIN kód." |
| 3 | **Élő jelenlét és vészhelyzet** *(ÚJ)* | Hero illusztráció | "Egy pillantással látod, ki van bent, és vészhelyzetben egy koppintással riaszthatod a csapatot." |
| 4 | Helymeghatározás engedély | Permission prompt | Rendszer helymeghatározás engedélykérés (geofence + térkép funkcióhoz) |
| 5 | NFC engedély | Permission prompt | NFC bekapcsolás ellenőrzés/kérés |

- Minden képernyőn `page_dots` indikátor (5 pötty, az aktív szélesebb pill alakú és kék, a többi szürke).
- 1–3. kártya: teljes szélességű illusztráció-panel felül (világoskék háttér, középen nagy ikon), cím + leírás alatta, "Tovább" gomb.
- 4–5. kártya: kompakt ikon felül, cím + leírás, **két gomb** (elsődleges "engedélyezem" + másodlagos "Most nem" / kihagyás).
- A flow végén (5. lépés után) navigáció a Login vagy — ha már be van jelentkezve — a Kezdőlapra.

---

## 4. Kezdőlap (Home)

### 4.1 Tartalmi sorrend (fentről lefelé)

1. `header` — avatar + "Szia, {név}!" + dátum + értesítés-harang (badge-dzsel)
2. `presence_status_card` — a **saját** aktuális check-in állapot ("Bent — {helyszín}", "Belépve: ma {idő} óta — {időtartam}", "NFC beolvasás" gomb) — **meglévő elem**
3. **`live_widget` — "Élő adatok" widget *(ÚJ)*** — lásd 4.2
4. `stats_row` — 3 stat kártya (Mai ellenőrzés, Ledolgozva ma, Olvasatlan üzenet)
5. `schedule_card` — mai beosztás
6. Location Card — következő ellenőrzés helyszíne
7. `Gyors elérés` — shortcut grid, **3 sor**:
   - Sor 1: Vezénylés · Műszaknapló · Oktatások
   - Sor 2: Vizsgák · Üzenetek · Dokumentumok
   - **Sor 3 (ÚJ): NFC beolvasás · Vészhelyzet**
8. Üzenetek lista (előnézet)
9. Legutóbbi aktivitás lista

### 4.2 "Élő adatok" widget — részletes spec

Fehér kártya (radius 18, 1px szegély), zöld pulzáló "ÉLŐ ADATOK" jelzéssel a tetején, **két oszlopos** elrendezés függőleges elválasztóval:

```
● ÉLŐ ADATOK

Műszak vége          |  Bent a helyszínen
1ó 48p                |  18/22
múlva — 16:00-kor     |  Nyugati Irodaház
```

- **Bal oszlop**: a bejelentkezett felhasználó aktuális műszakjának hátralévő ideje (számítva a `schedule_card` időpontjaiból, real-time frissítve, pl. percenként).
- **Jobb oszlop**: élő "bent van" számláló a felhasználó telephelyén (WebSocket/polling alapú, ugyanaz az adatforrás, mint a Director dashboard "Bent van" stat-ja).
- **Backend igény**: real-time push (pl. Laravel Reverb / websocket csatorna) vagy min. 30–60s-os polling a jelenlét-számlálóhoz.

### 4.3 Coach mark tour (spotlight overlay)

**Csak az első bejelentkezéskor**, az onboarding UTÁN, a Kezdőlapon jelenik meg (szintén perzisztens flag: `hasSeenHomeCoachMarks`). 3 lépéses, szekvenciális túra:

| Lépés | Cél elem | Tooltip szöveg |
|---|---|---|
| 1/3 | `live_widget` | "Napi állapotod egyben" — "Itt látod a műszakod hátralévő idejét és az élő jelenlét-számlálót valós időben." |
| 2/3 | Gyors elérés → NFC beolvasás tile | "Gyors NFC beolvasás" — "Itt tudsz bármikor egy koppintással NFC-t beolvasni, kártya vagy PIN kód nélkül." |
| 3/3 | Bottom Navigation | "Mindig egy koppintásnyira" — "Innen éred el a helyszíneket, a jelenlétet, a menüt és a profilodat — bárhol is jársz az appban." |

**Vizuális implementáció:**
- Sötétített háttér (`#090F17`, 62% opacitás) a teljes képernyőn.
- A cél elem körül **valódi kivágás** (nem csak dimmelt + keret) — a cél elem 100%-os fényerővel/kontraszttal látszik, minden más dimmelt.
- Fehér, lekerekített (radius a cél elemnek megfelelően, pl. widget=18, nav=32) `2px` keret + finom glow (fehér, 16px blur) a kivágás körül.
- Fehér tooltip-buborék (radius 14, drop shadow) a cél alatt vagy felett: lépésszámláló ("1 / 3"), cím (Semi Bold 15px), leírás (Regular 13px), és egy sor gomb: "Kihagyás" (szürke szöveg-link, bal) + "Következő" / utolsó lépésnél "Kész" (primary gomb, jobb).
- **Auto-scroll**: mivel a Kezdőlap tartalma hosszabb az 1 viewport-nál, a 2. lépésnél a képernyőnek a cél elem pozíciójára kell automatikusan görgetnie, mielőtt a spotlight megjelenik.
- Koppintás a "Kihagyás"-ra bármelyik lépésnél azonnal bezárja a teljes túrát és beállítja a `hasSeenHomeCoachMarks = true` flaget.

---

## 5. Admin dashboardok (Director / Security Lead / Property Manager)

### 5.1 Szerepkör badge színkódolás

A fejlécben megjelenő fehér pill badge (pl. "TERÜLETI IGAZGATÓ") szövegszíne **szerepkörönként eltérő**, hogy egy pillantásra megkülönböztethető legyen, melyik dashboardon vagyunk:

| Szerepkör | Badge szövegszín |
|---|---|
| Területi igazgató (Director) | `directorPurple` `#6E53E0` |
| Biztonsági vezető (Security Lead) | `primaryBlue` `#2563EB` |
| Property Manager | `amber` `#D97706` |

A badge maga mindig fehér hátterű pill (`cornerRadius 999`), csak a szövegszín változik szerepkör szerint.

### 5.2 Heti trend sparkline widget

Minden admin dashboard `stats_row`-ja után egy kompakt trend-kártya:

```
Heti incidens trend          -25% a múlt héthez képest

▁ ▁ ▂ ▁ ▁ ▁ ▃    (7 napos mini oszlopdiagram, az aktuális nap kiemelve kékkel)
H  K  Sze Cs  P  Szo V
```

- 7 oszlop, magasság arányos a napi értékkel, a **legutolsó (mai) oszlop** kék (`primaryBlue`), a többi halványkék (`#D2E0FA` kb.).
- Trend badge (jobb felül): zöld (javulás) vagy piros (romlás) pill, %-os változással.
- **Director**: "Heti incidens trend" (nyitott jelentések száma naponta).
- **Security Lead**: "Heti jelenlét trend" (csapat jelenléti %-a naponta).
- **Adatforrás**: heti aggregált statisztika endpoint, napi bontásban (7 elemű tömb + előző heti összehasonlító érték).

### 5.3 Fejléc header konténer

Ezeken a képernyőkön a fejléc `header` nevű (nem `top_app_bar`) konténer — funkcionálisan azonos, ugyanaz a 2.2-es lekerekítés-szabály vonatkozik rá.

---

## 6. Térkép (Map)

Teljes redesign — natív iOS Maps / Find My megjelenés. **A meglévő pin-stílus, geofence-kör és "Te vagy itt" jelző változatlan marad.**

### 6.1 Fejléc

- Kompakt `top_app_bar`, "‹ Vissza" gomb + "Térkép" cím.
- A korábbi jobb-felső lista/térkép-váltó ikon **eltávolítva** (redundánssá vált a mindig látható bottom sheet miatt).

### 6.2 Térkép terület (basemap)

- Alapszín: meleg krém tónus (`#F3F1EE` kb.), nem hideg szürkéskék.
- **City block textúra**: 5–6 szórt, lekerekített (radius 6) épület-téglalap halvány tannbarna színben (`#E8E6E0` kb.) a látómezőben, az utak/park/pinek/tag ütközése nélkül.
- Utak: közel fehér (`#FCFCFA`), a meglévő rács-elrendezésben.
- Park: organikus, nagy sugarú lekerekítéssel (radius 48) lezöldített folt (nem szögletes doboz).
- Víz-akcent: halványkék, lekerekített folt egy sarokban (részben "levágva" a képernyő szélén, realisztikus hatásért).
- **Lebegő "Helyzetem" gomb**: fehér kör (44×44, drop shadow), kék céljel-ikon (gyűrű + középpont), jobb alsó sarok, 16px margóval.

### 6.3 Bottom sheet — "X helyszín a közelben"

Állandóan látható (nem összecsukható a jelen designban), lekerekített felül (24/24/0/0), fehér, felfelé mutató drop shadow-val a térképtől való elválasztáshoz.

**Felépítés (fentről lefelé):**
1. Drag handle (36×4, szürke, középre igazítva) — jelzi a húzhatóságot
2. **Keresősáv** — nagyítóüveg ikon + "Keresés helyszínek között" placeholder, világosszürke pill (radius 12)
3. "{N} helyszín a közelben" cím (18px Bold)
4. Helyszín-kártyák listája (`Location Card` komponens, ugyanaz mint a Helyszínek listánál), **térkép-kontextusú alszöveggel** (távolság + idő, pl. "80 m — a geofence zónán belül", "1,4 km — kb. 4 perc autóval"), és a valós Aktív/Inaktív badge-dzsel

### 6.4 Interakció (implementációs jegyzet)

- A sheet a valóságban **húzható/kihúzható** komponens legyen (bottom sheet minimum/maximum magassággal) — a Figma statikus mockup a kihúzott állapotot mutatja.
- A lista tételre koppintás a megfelelő pin-re fókuszál a térképen + kiemeli azt.
- A "Helyzetem" gomb koppintásra a térképet a felhasználó aktuális pozíciójára középre igazítja/zoomolja.

---

## 7. NFC modul (új képernyők)

Mindkét képernyő **drill-in nézet** (csak "‹ Vissza" fejléc, nincs Bottom Navigation) — Profilból vagy egy NFC scan-eredményből nyílnak meg.

### 7.1 "NFC előzmények" — saját scan-történet

- Dátum szerint csoportosított lista: **MA**, **KORÁBBI NAPOK** (vagy éles implementációban: Ma / Tegnap / ez a hét / korábbi).
- Minden bejegyzés (`History Card`): ikon-avatar (körkörös, státusz-színnel), helyszín neve, "{Belépés/Kilépés} — {idő}" alszöveg, jobbra igazított státusz badge.
- **Státusz-színek**: zöld = "Sikeres", piros = "Elutasítva" (ugyanaz a paletta, mint az NFC scan eredmény-képernyőkön).
- **Adatforrás**: a felhasználóhoz kötött NFC beléptetési napló, lapozható/végtelen görgetéssel (backend: már létező "NFC beléptetési napló" endpoint szűrve a bejelentkezett userre).

### 7.2 "Mai bejárás" — NFC ellenőrzőlista (checklist)

Egy adott helyszín NFC-pontjainak napi bejárás-állapota — **explicit döntés: nincs térképes navigáció**, mert egy helyszínen belül a pontok túl közel vannak egymáshoz ahhoz, hogy geopozicionálás értelmes legyen. Helyette **terület szerint csoportosított lista**.

**Felépítés:**
1. Kontextus-sor: "{Helyszín neve} · {dátum}"
2. **Progress kártya**: nagy szám ("5/8 pont beolvasva ma") + kék progress bar
3. Csoportok (pl. **FÖLDSZINT**, **EMELETEK**, **KÜLSŐ TERÜLET**), mindegyikben `Status List Item` sorok:
   - Beolvasott pont: zöld ikon-kör + "Beolvasva — {idő}" alszöveg + zöld "Kész" badge
   - Még nem beolvasott pont: szürke ikon-kör (számozott) + "Még nincs beolvasva ma" alszöveg + szürke "Hátravan" badge

**Adatforrás**: a helyszínhez rendelt NFC-pontok listája + a mai napi scan-log join-olva (melyik pontot mikor olvasták be aznap). A progress szám = beolvasott pontok / összes pont aznapra.

---

## 8. Oktatás & Vizsga lejátszó felületek

Mindkét képernyő **drill-in nézet** (csak "‹ Vissza"), az Oktatások/Vizsgák listaelemre koppintva nyílik meg.

### 8.1 "Oktatás lejátszása" — videós lecke-lejátszó

1. **Videó player** (16:9 arány, 358×201): sötét placeholder háttér, középen 64×64 fehér lejátszás-gomb (kék háromszög glyph), jobb alsó sarokban idő-badge ("02:48 / 12:34" félig áttetsző fekete pill-en).
2. **Scrubber** — vékony progress-sáv a videó alatt.
3. Kurzus cím (20px Bold) + "Esedékes"/"Teljesítve" badge + határidő + leírás.
4. **"LECKÉK" szekció** — leckelista, 3 állapottal:
   - `done`: zöld ikon-kör pipával, teljesített, időtartam felirat
   - `current`: kék kiemelt sor, lejátszás-ikon, "Most játszva — {idő}" felirat
   - `locked`: szürke, számozott ikon-kör (még nem elérhető / a videó után jön, pl. záró teszt)
5. "Következő lecke" primary gomb (alul, teljes szélességű).

**Implementációs jegyzet**: valódi videó lejátszás (ExoPlayer Androidon / AVPlayer iOS-en, vagy KMP video library), a scrubber és lejátszás-gomb funkcionális vezérlőkké válnak. A leckelista tételre koppintva ugrik az adott időbélyegre.

### 8.2 "Vizsga kitöltése" — kvíz felület

1. Kontextus-sor: vizsga neve (pl. "Vagyonőri alapvizsga").
2. **Progress sor**: "{n}. kérdés / {összes}" (bal) + "Hátralévő idő: {mm:ss}" (jobb, kék).
3. **Progress bar** — kék, arányos a kérdésszámmal.
4. **Kérdéskártya**: kategória badge (pl. "TŰZVÉDELEM", halványkék pill) + a kérdés szövege (Semi Bold 17px).
5. **4 válaszopció**, rádiógomb-stílusú sorok:
   - Nem kiválasztott: fehér háttér, szürke keret, üres gyűrű
   - Kiválasztott: halványkék háttér, kék keret (1.5px), kitöltött kék gyűrű fehér középponttal, kék szöveg
6. "Következő kérdés" primary gomb.

**Implementációs jegyzet**: a válaszopciók egy-választós (`RadioGroup` / single-select) komponensként, a timer valós visszaszámláló (a vizsga automatikusan beküldésre kerül, ha lejár az idő). A "Következő kérdés" gomb az utolsó kérdésnél "Beküldés"-re változik és az eredmény-képernyőre navigál (ez utóbbi még nincs megtervezve).

---

## 9. Egyéb módosított képernyő

### 9.1 "Elfelejtett jelszó" — modernizált elrendezés

A form (ikon + cím + leírás + e-mail mező + "Küldés" gomb) és egy új **footer szekció** most **vertikálisan középre igazítva** oszlik el a teljes tartalmi területen (nem a tetejére tömörítve, alatta üres hellyel).

**Új footer elemek** (a form alatt):
1. **"Biztonsági tipp" info kártya** — halványkék háttér (radius 16), kis ikon + "Ha 5 percen belül nem érkezik meg az e-mail, nézd meg a spam mappát is, vagy kérj új linket." szöveg.
2. **"Vissza a bejelentkezéshez" másodlagos gomb** — a meglévő `Style=Secondary` gombkomponens (fehér háttér, szürke keret, kék szöveg).

---

## 10. Konzisztencia-javítások (bugfixek — implementációkor figyelembe veendő szabályok)

Ezeket **nem funkcióként**, hanem **kódolási szabályként** érdemes rögzíteni, mert a Figma-fájlban is emberi hiba miatt tértek el eredetileg:

1. **Minden** fő tab-képernyő és admin dashboard a lekerekített pill Bottom Navigation-t használja — nincs egyedi/eltérő nav-implementáció egyik szerepkörre sem.
2. **Minden** fejléc-konténer (`top_app_bar` és `header` is) 0/0/23/23 sugarú.
3. Ha egy képernyőnek van vissza gombja, **az összes state-variánsának** (Loading/Empty/Error) is legyen.
4. Hosszú, görgethető képernyőkön a Bottom Navigation mindig a **fizikai képernyő aljához** van rögzítve, nem a tartalom végéhez.
5. Szín-tokenek mindig konkrét, feloldott értékkel kerüljenek be a kódba (ne hagyatkozzunk automatikus téma-változó feloldásra, ha egyszer már hibásan feketére oldódott fel — inkább explicit hex/Color konstansok a design tokenekből, lásd 1.1).

---

## 11. Képernyők — gyors referencia táblázat

| Képernyő | Típus | Vissza gomb | Bottom Nav | Új / Módosított |
|---|---|---|---|---|
| Login | Auth | – | – | Módosított (tenant mező) |
| Üdvözlő animáció | Transient | – | – | Új |
| Onboarding (5 kártya) | Onboarding | – | – | 2 új kártya + dots frissítve |
| Kezdőlap | Tab-gyökér | – | ✓ | Módosított (widget, quick actions) |
| Kezdőlap coach mark (3 lépés) | Overlay | – | ✓ (dimmelt) | Új |
| Director / Áttekintés | Dashboard | – | ✓ | Módosított (badge szín, sparkline, header radius) |
| Security Lead / Csapat | Dashboard | – | ✓ | Módosított (badge szín, sparkline, header radius) |
| Property Manager / Áttekintés | Dashboard | – | ✓ | Módosított (badge szín, header radius) |
| Térkép | Drill-in (Helyszínek) | ✓ | ✓ | Teljes redesign |
| NFC előzmények | Drill-in | ✓ | – | Új |
| Mai bejárás (NFC checklist) | Drill-in | ✓ | – | Új |
| Oktatás lejátszása | Drill-in | ✓ | – | Új |
| Vizsga kitöltése | Drill-in | ✓ | – | Új |
| Elfelejtett jelszó | Auth sub-page | ✓ | – | Módosított (footer szekció) |

---

*Dokumentum generálva a Figma-fájlon végzett tervezési munka alapján. Kérdés esetén a fenti Figma-linken az adott node-ok megtekinthetők (screen-name alapján kereshetők a fájlban).*
