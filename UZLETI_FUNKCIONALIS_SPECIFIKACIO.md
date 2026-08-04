# KulcsNyilvántartó Platform – Üzleti és Funkcionális Specifikáció

*Multi-tenant biztonsági létesítménygazdálkodási és őrszolgálat-irányítási rendszer, webes (PWA) és natív mobil (Android/iOS) felülettel*

---

## 1. Vezetői Összefoglaló (Executive Summary)

### A rendszer célja

A KulcsNyilvántartó eredetileg egy egyszerű kulcs- és beléptetőkártya-ellenőrző alkalmazásként indult, mára azonban egy **teljes körű, több céget (tenant) egyszerre kiszolgáló biztonsági létesítménygazdálkodási platformmá** nőtte ki magát. A rendszert fizikai biztonsági szolgáltató cégek (vagyonőrző/portaszolgálati vállalkozások) használják, amelyek több irodaházban, több ügyfélnél biztosítanak őrszolgálatot.

A platform egyetlen felületen fogja össze mindazt, amire egy biztonsági szolgáltató cég a napi működéséhez szüksége van:

- **Kulcsok és beléptetőkártyák** napi átadás-átvételi ellenőrzése, elszámoltathatósággal és automatikus e-mail-értesítéssel.
- **Fizikai bejárás-ellenőrzés** NFC-technológiával: az őr a helyszínen elhelyezett matricákat mobiltelefonjával leolvasva igazolja, hogy valóban bejárta a rábízott területet.
- **GPS-alapú helyszín-figyelés** (geofencing): a rendszer riaszt, ha egy szolgálatban lévő őr elhagyja a kijelölt területet.
- **Digitális jegyzőkönyvezés**: 10 különböző, jogilag releváns biztonsági jegyzőkönyv-típus (kárfelvétel, talált tárgy, bombariadó, kiürítés stb.) kitöltése digitális aláírással és automatikus PDF-generálással.
- **Munkaerő-beosztás és pótlás-tervezés** (Vezénylés modul): havi szolgálati rács, 24 órás váltások pótlás-jelölt-ajánlással.
- **Oktatás és vizsgáztatás**: e-learning tréningek és időzített, csalás elleni védelemmel ellátott vizsgák.
- **Vezetői kontrolling**: irodaházankénti/vezetőnkénti teljesítmény-mutatók (oktatottsági szint, fluktuáció), célkitűzés-kezelés, havi riportok.
- **Mesterséges intelligenciás tudásbázis-asszisztens**: a cég belső szabályzatai, utasításai alapján válaszoló, hangvezérelhető chatbot.
- **Progresszív webalkalmazás (PWA) és natív mobilalkalmazás**: telepíthető, push-értesítésekkel és részleges offline-működéssel támogatott felhasználói élmény.

A rendszer **több céget (tenant-ot) szolgál ki egyetlen szoftverpéldányból**, minden cég adatai szigorúan elkülönítve, saját adatbázisban. Egy központi "szuperadmin" felület felel a cégek (tenant-ok) felvételéért és karbantartásáért, míg minden cégen belül egy önálló, ötszintű jogosultsági rendszer (dolgozó, adminisztrátor, ingatlankezelő, biztonsági vezető, területi igazgató) szabályozza, ki mit láthat és módosíthat.

### Fő értékesítési pontok és fő funkciók

- **Egy platform, teljes napi működés** – az őrszolgálat vezénylésétől a jegyzőkönyvezésen át a teljesítménymérésig minden egy helyen.
- **Papírmentes, jogilag megfelelő dokumentáció** – digitális aláírással hitelesített, azonnal letölthető PDF jegyzőkönyvek, 10 előre definiált, iparág-specifikus típusban.
- **Valós idejű átláthatóság** – élő "ki van bent" nézet, NFC-bejárás visszaigazolás, GPS-alapú zóna-riasztás, azonnali push-értesítések minden kritikus eseményről.
- **Szervezeti hierarchia leképezve** – területi igazgató → biztonsági vezető → irodaház → dolgozó lánc, mindenki csak a saját felelősségi körét látja.
- **Mobil-first munkavégzés** – natív Android/iOS alkalmazás NFC-olvasással, GPS-követéssel és internetkapcsolat nélküli működést támogató szinkronizációs sorral.
- **Beépített mesterséges intelligencia** – a cég saját dokumentumai alapján kérdésre azonnal válaszoló, magyarul beszélő és hallgató AI-asszisztens.
- **Skálázható, több céges (multi-tenant) architektúra** – új ügyfél céget percek alatt fel lehet venni, teljesen elkülönített adatokkal.

---

## 2. Felhasználói Szerepkörök és Jogosultságok (RBAC)

A rendszer kétszintű jogosultsági architektúrát alkalmaz: egy **platform-szintű** (a szoftvert üzemeltető fél) és egy **cégen belüli (tenant-szintű)** szerepkör-rendszert.

### 2.1 Platform-szintű szerepkör

| Szerepkör | Leírás |
|---|---|
| **Szuperadmin** | A szoftvert üzemeltető fél munkatársa. Nem lát bele egyik cég napi üzleti adataiba sem a normál felületen keresztül, de technikailag ő hozza létre/kapcsolja ki/törli a cégeket (tenant-okat), és ő tud minden cégnél felhasználói fiókokat (akár admin fiókot is) létrehozni, ha a cég ezt kéri (pl. elfelejtett admin jelszó esetén). |

### 2.2 Cégen belüli (tenant) szerepkörök

| Szerepkör | Kinek szól | Fő jogosultságok |
|---|---|---|
| **Dolgozó / Őr** (`user`) | Vagyonőr, portás, recepciós | Saját ellenőrzések, oktatások, vizsgák elvégzése; napi jelentés és jegyzőkönyv **létrehozása**; saját NFC-bejárás; saját vezénylési sor korlátozott szerkesztése; AI-asszisztens használata forrás-megjelölés nélkül. |
| **Adminisztrátor** (`admin`) | A cég rendszergazdája | Teljes körű hozzáférés minden adathoz és beállításhoz: felhasználó-, helyszín-, tétel-, oktatás-, vizsga-kezelés; minden dokumentum törlése; teljes napló-hozzáférés. |
| **Ingatlankezelő / Property Manager** (`property_manager`) | Az épület üzemeltetője, aki felügyeli az őrszolgálatot, de nem annak alkalmazottja | Csak-olvasás jellegű felügyelet: ellenőrzések, napi jelentések, aktivitásnapló megtekintése; körüzenetek küldése a csapatnak; dokumentumot **nem hozhat létre**; a Vezénylés modulból teljesen ki van zárva. |
| **Biztonsági vezető** (`security_lead`) | A saját felügyelt irodaházai(k) operatív vezetője | "Ingatlankezelői" jogkör, de a **saját felügyelt irodaházaira szűkítve**: csapat (dolgozók, ingatlankezelő) hozzárendelése, leltár (kulcsok/kártyák) kezelése, Vezénylés-adatok szerkesztése a saját területein, vizsga-emlékeztető küldése. Dokumentumot csak megtekinthet. |
| **Területi igazgató** (`area_director`) | Több biztonsági vezetőt felügyelő regionális vezető | "Admin-szintű" jogkör, a felügyelt biztonsági vezetőin és azok irodaházain keresztül: teljesítmény-áttekintés, célkitűzés-beállítás, havi riportok, Vezénylés teljes hozzáférés. |

### 2.3 Jogosultsági mátrix (fő modulok szerint)

| Funkció | Dolgozó | Admin | Ingatlankezelő | Biztonsági vezető | Terül. igazgató |
|---|:---:|:---:|:---:|:---:|:---:|
| Ellenőrzés (kulcs/kártya) rögzítése | ✔ (saját) | ✔ | – | ✔ | ✔ |
| Ellenőrzési előzmények, CSV-export | – | ✔ | – | – | – |
| Dokumentum/jegyzőkönyv létrehozása | ✔ | ✔ | – | – | – |
| Dokumentum megtekintése | saját | mind | mind | csapata | mind |
| Dokumentum törlése | – | ✔ | – | – | – |
| Napi biztonsági jelentés létrehozása | ✔ | ✔ | – | – | – |
| Napi jelentés jóváhagyása ("review") | – | ✔ | ✔ | ✔ | ✔ |
| Oktatás/vizsga kitöltése | ✔ | ✔ | – | – | – |
| Oktatás/vizsga szerkesztése (admin szerkesztő) | – | ✔ | – | – | – |
| Vezénylés megtekintése | saját terület | ✔ | – (kizárva) | saját irodaházak | ✔ |
| Vezénylés szerkesztése (óraszám) | – | ✔ | – | saját irodaházak | ✔ |
| Felhasználó-kezelés | – | ✔ | – | csapat hozzárendelés | vezető hozzárendelés |
| Helyszín/tétel adminisztráció | – | ✔ | – | saját irodaházak | – |
| NFC-matrica kezelés | – | ✔ | – | – | – |
| "Ki van bent" élő nézet | saját helyszín | ✔ | – | saját irodaházak | ✔ |
| Teljesítmény-dashboard | – | – | – | – | ✔ |
| Célkitűzés beállítása | – | – | – | (célzott) | ✔ |
| Körüzenet küldése csapatnak | – | ✔ | ✔ | ✔ (korlátozott) | ✔ |
| AI-asszisztens – kérdezés | ✔ | ✔ | ✔ | ✔ | ✔ |
| AI-asszisztens – forrás-megjelölés | – | ✔ | – | – | ✔ |
| AI tudásbázis feltöltés/törlés | – | ✔ | – | – | ✔ |
| Aktivitásnapló | – | ✔ | ✔ | – | – |

### 2.4 Szervezeti hierarchia és hozzáférés-öröklés

A rendszer egy egyszerű, egyértelmű felügyeleti láncot valósít meg: **területi igazgató → biztonsági vezető → irodaház → dolgozó**. Minden dolgozó pontosan egy irodaházhoz van rendelve; minden irodaháznak pontosan egy felelős biztonsági vezetője van; minden biztonsági vezető pontosan egy területi igazgatóhoz tartozik. Ez a hozzárendelés az Adminisztráció modulban, a felhasználó-kezelő felületen történik, és minden más modul (Vezénylés, Dokumentumok, Napi jelentés, "Ki van bent" nézet, Teljesítmény-dashboard) ezt a hierarchiát használja a látókör automatikus leszűkítésére.

Ettől függetlenül, **az NFC-alapú beléptetés-ellenőrzési jogosultság egy külön, explicit lista** – egy dolgozó a munkahelyi hovatartozásától függetlenül több irodaházra is kaphat NFC-bejárási jogot (pl. helyettesítés esetén), ezt az admin a felhasználó szerkesztő felületén, jelölőnégyzetes listával állítja be.

---

## 3. PWA (Progressive Web App) és Mobil Képességek

### 3.1 Telepíthetőség és megjelenés

A rendszer webes felülete **telepíthető alkalmazásként (PWA)** működik: a felhasználó a böngészőjéből egyetlen kattintással a telefonja/számítógépe kezdőképernyőjére helyezheti, ahonnan önálló alkalmazásként (böngészősáv nélkül, "standalone" módban) indul. Saját ikonkészlettel, sötét témájú indítóképernyővel és magyar nyelvű megjelenéssel rendelkezik.

Ezen felül a rendszerhez **natív Android és iOS alkalmazás** is tartozik (Kotlin Multiplatform technológiával), amely a webes felülettel funkcionálisan csaknem teljesen azonos, kiegészülve mobil-specifikus hardveres képességekkel (NFC-olvasás, GPS-helymeghatározás).

### 3.2 Offline működés és cache-stratégia

A rendszer service worker-e **tudatosan szűk, "whitelist" elvű** gyorsítótárazást alkalmaz:

- **Gyorsítótárazott (offline is elérhető)**: az alkalmazás statikus erőforrásai (programkód, stílusok), ikonok, betűtípusok.
- **Soha nem gyorsítótárazott**: minden bejelentkezéshez kötött oldal, API-válasz, élő adatfolyam (AI-chat streamelés) és WebSocket-hitelesítés – ez tudatos biztonsági/adatfrissességi döntés, hogy a felhasználó soha ne lásson elavult vagy hibásan gyorsítótárazott adatot.

Emiatt a **webes felület** önmagában nem támogat valódi "offline adatrögzítést" – ahhoz internetkapcsolat szükséges. A **natív mobilalkalmazás** viszont rendelkezik egy dedikált **offline-szinkronizációs sorral**: ha az NFC-bejárás-ellenőrzés vagy a GPS-helyzetjelentés hálózat nélkül történik, a kérés a telefon belső tárolójában várakozik egy egyedi azonosítóval (hogy hálózat visszatérésekor ne duplikálódjon), és automatikusan újraküldésre kerül, amint helyreáll a kapcsolat vagy a felhasználó újra megnyitja az alkalmazást. Munkamenet lejárta esetén a sor leáll és bejelentkezésre kéri a felhasználót; végleges elutasítás (pl. jogosulatlan hozzáférés) esetén a bejegyzés törlődik a sorból.

### 3.3 Push értesítések

A platform kétféle push-csatornát használ:

**Böngésző-alapú (Web Push)** – minden bejelentkezett felhasználó feliratkozhat rá egy kattintással; a rendszer minden oldalon automatikusan felajánlja a feliratkozást. iPhone-on ez csak akkor működik, ha a felhasználó előbb telepítette az alkalmazást a kezdőképernyőre – ilyenkor a rendszer lépésenkénti útmutatót jelenít meg.

**Natív mobil push (Android/iOS)** – a natív alkalmazás telepítésekor a készülék regisztrálja magát; ez a csatorna jelenleg műszakilag elő van készítve, de éles hitelesítő kulcsok (Firebase/Apple) hiányában ténylegesen még nem küld push-üzenetet.

A felhasználók az alábbi eseményekről kapnak azonnali push-értesítést:

| Esemény | Böngésző push | Natív push |
|---|:---:|:---:|
| NFC-bejárás rögzítve / jogosulatlan próbálkozás | ✔ | ✔ (előkészítve) |
| GPS-zóna elhagyása/visszatérése | ✔ | ✔ (előkészítve) |
| Új kritikus jegyzőkönyv (kárfelvétel, talált tárgy, bombariadó stb.) | ✔ | ✔ (előkészítve) |
| Vezetői körüzenet / válasz | ✔ | – |
| Váltóüzenet (műszakátadás) | ✔ | – |
| Vizsga-emlékeztető | ✔ | – |

### 3.4 Adatszinkronizáció

A rendszer élő, azonnali szinkronizációt biztosít WebSocket-technológián (Laravel Reverb) keresztül: NFC-bejárási események, GPS-pozíciók és a "ki van bent" nézet a háttérben, oldal-frissítés nélkül, valós időben frissülnek minden jogosult felhasználó képernyőjén. Az AI-asszisztens válaszai is folyamatos, szó-szintű "élő gépelés" hatással érkeznek (streamelt válasz).

---

## 4. Részletes Funkcionális Modulok

### 4.1. Hitelesítés és tenant-kezelés

**Modul célja:** Biztonságos belépés biztosítása, és annak garantálása, hogy minden cég kizárólag a saját adataihoz férjen hozzá.

**Funkciók listája:**

- **Cégválasztó nyitóoldal:** a rendszer gyökér-címén a felhasználó az aktív (működő) cégek listájából választja ki a sajátját, ahonnan a cég saját bejelentkező oldalára jut.
- **Cégen belüli bejelentkezés:** e-mail cím + jelszó alapú belépés, "emlékezz rám" opcióval. Inaktív (kiléptetett) fiókkal nem lehet belépni – erre a rendszer explicit hibaüzenetet ad. Sikeres belépéskor a rendszer minden esetben rögzíti az eseményt az aktivitásnaplóba.
- **Szerepkör szerinti automatikus továbbirányítás:** bejelentkezés után a rendszer a szerepkörnek megfelelő kezdőoldalra (Portál, Admin irányítópult, Igazgatói irányítópult, Biztonsági vezetői irányítópult, Ingatlankezelői irányítópult) irányítja a felhasználót.
- **Kijelentkezés:** minden kijelentkezés is naplózásra kerül.
- **Több-cég session-elkülönítés:** a rendszer technikailag kizárja, hogy egy felhasználó, aki az A cég felületén jelentkezett be, véletlenül vagy szándékosan hozzáférjen a B cég oldalaihoz – ilyen próbálkozás esetén automatikusan kilépteti és az érintett cég bejelentkező oldalára irányítja.
- **Nincs önkiszolgáló jelszó-visszaállítás és regisztráció** – ez tudatos üzleti döntés: jelszót kizárólag a cég adminisztrátora vagy a szoftver üzemeltetője (szuperadmin) állíthat vissza egy felhasználónak, új fiókot csak adminisztrátor hozhat létre.
- **Szuperadmin – cégek (tenant-ok) kezelése:** új cég felvétele (egyedi, URL-be illeszthető azonosítóval), amely azonnal létrehozza a cég teljesen elkülönített, saját adatbázisát; cég aktiválása/felfüggesztése (felfüggesztett cég egyik felhasználója sem tud belépni); cég végleges törlése (ezzel együtt minden adata is véglegesen törlődik – visszaállítás nincs).
- **Szuperadmin – cégen belüli felhasználó-kezelés:** a szuperadmin bármely cég bármely felhasználói fiókját létrehozhatja, módosíthatja, jelszavát cserélheti, aktiválhatja/inaktiválhatja vagy törölheti – tipikusan support-célra (pl. ha a cégnél elveszett az admin-hozzáférés).

### 4.2. Kulcs- és Kártya-ellenőrzési modul (a rendszer "core" funkciója)

**Modul célja:** Napi szintű, elszámoltatható bizonyíték arra, hogy egy adott irodaházban minden nyilvántartott kulcs és beléptetőkártya a helyén van.

**Funkciók listája:**

- **"Kulcsnyilvántartó" főnézet:** az aktív irodaházak listája, mindegyiknél a nyilvántartott tételek (kulcsok/kártyák) darabszámával.
- **Helyszín-részletező:** egy irodaház korábbi ellenőrzéseinek időrendi listája (lapozva).
- **Ellenőrzés indítása és leadása:** a felhasználó az adott helyszín teljes tétellistáját látja, bérlő/terület szerinti csoportosításban; minden tételt egyenként ki- vagy bepipálhat ("megvan"/"hiányzik"), írhat hozzá szöveges megjegyzést, és opcionálisan megadhat egy plusz e-mail-címzettet. **Minden tétel állapota rögzítésre kerül** – a ki nem pipált tételek nem hiányoznak a rekordból, hanem explicit "hiányzik" státuszt kapnak, ami később is visszakereshető.
- **Automatikus e-mail-értesítés:** minden ellenőrzés leadásakor a rendszer automatikusan e-mailt küld a cég globálisan beállított címzettjének, a helyszínhez rendelt felelős e-mail-címre, és az űrlapon megadott plusz címzettnek – a levél tartalmazza az ellenőrzés helyszínét, dátumát és eredményét. Ha a levélküldés technikai okból meghiúsul, az ellenőrzés rögzítése attól még sikeres marad.
- **Eredmény megtekintése:** az elkészült ellenőrzés részletes, tétel-csoportonként rendezett megjelenítése; ezt az ellenőrzést végző dolgozó, valamint az adminisztrátor és az ingatlankezelő láthatja.
- **Eredmény utólagos szerkesztése:** az adminisztrátor bármely ellenőrzést utólag javíthatja; a sima dolgozó csak a saját ellenőrzését; **az ingatlankezelő ezt a funkciót egyáltalán nem éri el** (csak olvashat).
- **Ellenőrzési előzmények (csak admin):** teljes, lapozható lista, szűrhető helyszínre és az ellenőrzést végző személy nevére.
- **CSV-export (csak admin):** az ellenőrzési előzmények Excel-kompatibilis (UTF-8, magyar elválasztójelekkel formázott) táblázatba exportálhatók, a helyszín-szűrő figyelembevételével.

### 4.3. Adminisztráció

**Modul célja:** A cég teljes törzsadat- és beállítás-kezelése egy helyen, kizárólag adminisztrátori jogosultsággal.

**Funkciók listája:**

- **Irányítópult:** összesítő statisztikák (helyszínek száma, napi és összesített ellenőrzés-szám) és a legutóbbi 5 ellenőrzés gyorsnézete.
- **Helyszínek (irodaházak) kezelése:** teljes körű létrehozás/szerkesztés/törlés – név, leírás, ikon vagy feltöltött logókép (a kettő kölcsönösen kizárja egymást), felelős személy, e-mail-cím, aktív/inaktív státusz, maximális befogadóképesség (a "Ki van bent" nézethez), valamint a helyszín térképi lehatárolása (geofence-poligon, minimum 3 GPS-koordinátás pont) a GPS-alapú zóna-figyeléshez. **Törlésvédelem**: ha egy helyszínhez már tartozik ellenőrzési előzmény, a törlés visszautasításra kerül.
- **Tételek (kulcsok/kártyák) kezelése:** helyszínenként tétel felvétele/szerkesztése/törlése/inaktiválása, típus (kulcs vagy kártya) és megjelenítési sorrend megadásával.
- **Tétel-csoportok kezelése:** a kulcsok/kártyák bérlő vagy terület szerinti csoportosítása; egy csoport törlésekor a benne lévő tételek nem törlődnek, csak csoport nélkülivé válnak.
- **NFC-matricák kezelése:** a fizikai NFC-matricák (checkpontok) nyilvántartása – egyedi azonosító, hozzárendelt helyszín, emberi nevű címke (pl. "Hátsó bejárat"), aktív/inaktív státusz.
- **Felhasználó-kezelés:** teljes körű felhasználó-CRUD – név, e-mail, jelszó, szerepkör, munkaviszony kezdete/vége. Szerepkörtől függően eltérő hozzárendelési mezők jelennek meg: dolgozónak/ingatlankezelőnek egy irodaházat kell megadni; biztonsági vezetőnek a felügyelendő irodaházakat; területi igazgatónak a felügyelendő biztonsági vezetőket. Ezen felül, szerepkörtől függetlenül, jelölőnégyzetes listával állítható be, mely helyszínekre kap a felhasználó NFC-bejárási jogosultságot. Adminisztrátor a saját fiókját nem törölheti.
- **Vizsga-kivétel beállítása felhasználónként:** egy adott dolgozóra egyedi próbálkozás-szám-korlát állítható be, felülírva a vizsga alapértelmezett limitjét.
- **Profil:** saját név/e-mail módosítása, jelszócsere jelenlegi jelszó megadásával.
- **Beállítások:** cégszintű kulcs-érték konfigurációk – globális e-mail-értesítési cím, oktatási/biztonsági értesítési e-mail-címek, a "biztonsági modul" megjelenítésének be-/kikapcsolása.
- **Vészhelyzeti kapcsolattartók:** kategorizált (pl. tűzoltóság, rendőrség, épületfelügyelet) telefonszám-lista karbantartása, amely a dolgozói Portál kezdőoldalán jelenik meg.
- **Oktatások kezelése:** oktatási anyagok (cím, leírás, aktív/inaktív, sorrend, "helyismereti oktatás" jelölő) és az azokhoz tartozó lépésenkénti kérdések szerkesztése – kérdéstípus (egyválasztós/többválasztós/szöveges), kép/videó melléklet feltöltéssel vagy külső URL-lel, "felfedő" kiegészítő média a helyes válasz után, drag-and-drop sorrendezés.
- **Vizsgák kezelése:** önálló, oktatástól függetlenül is létrehozható vizsgák – cím, leírás, próbálkozás-szám-limit, újrapróbálkozási várakozási idő, időkorlát, kérdés-/válaszsorrend véletlenszerűsítése. Vizsgaeredmények listázása/részletezése (pontszám, böngésző-fókuszváltás-számláló csalásgyanú-jelzésként, IP-cím, kitöltési idő). Egy meglévő oktatás kérdései egy kattintással átmásolhatók egy vizsgába.

### 4.4. Oktatás és Vizsga modul (dolgozói oldal)

**Modul célja:** A dolgozók betanítása és tudásuk ellenőrzése, nyomon követhető eredményekkel.

**Funkciók listája:**

- **Oktatás-lista és -megtekintés:** a dolgozó számára elérhető oktatási anyagok listája, lépésenkénti végigvezetéssel.
- **Oktatás eredményének beküldése:** a válaszok rögzítése, majd – ha az oktatáshoz vizsga is tartozik – automatikus továbblépési lehetőség a vizsgára.
- **Önálló vizsga-lista, kitöltés, eredmény-megtekintés:** időzített (ha van időkorlát), csalás-védett (fülváltás-figyelés) vizsgakitöltés, azonnali eredménnyel.
- **Próbálkozás-korlátozás:** a rendszer betartatja a max. próbálkozás-számot és az újrapróbálkozási várakozási időt (kivéve, ha az adminisztrátor egyedi kivételt állított be).

### 4.5. NFC Beléptetés-ellenőrzés és élő jelenlét

**Modul célja:** Fontos pontosítás: ez **nem** kapu-/ajtóbeléptető rendszer, hanem **bejárás-igazoló ("checkpoint") rendszer** – azt igazolja vissza, hogy az őr valóban bejárta a rábízott terület kijelölt pontjait.

**Funkciók listája:**

- **NFC-checkpoint beolvasás (mobil/natív):** az őr a telefonja NFC-olvasójával beolvassa a helyszínen elhelyezett matricát. A rendszer ellenőrzi, hogy a dolgozónak van-e explicit jogosultsága az adott helyszínre; ha nincs, elutasítja a scannelést és rögzíti a jogosulatlan próbálkozást is.
- **Duplikáció-védelem:** ha ugyanaz a beolvasás hálózati hiba miatt kétszer érkezik be (pl. offline sorból), a rendszer felismeri és nem generál kétszeres riasztást.
- **Azonnali, mindenkinek szóló értesítés:** minden sikeres és minden elutasított beolvasásról **a cég összes aktív felhasználója** azonnali értesítést kap (élő felületfrissítés + push-üzenet) – ez tudatos átláthatósági funkció, ezért túlterhelés-védelemként korlátozva van (percenkénti beolvasás-szám-limit).
- **"Mai bejárás" ellenőrzőlista:** a dolgozó látja, mely engedélyezett helyszínein mely checkpontokat olvasta már be aznap, és melyeket nem.
- **NFC-előzmények:** a saját utolsó 100 beolvasási esemény listája.
- **Értesítési "harang":** a beérkezett NFC-értesítések listája, olvasatlan-számláló, egy kattintással mind olvasottá jelölés.
- **"Ki van bent" élő nézet:** a jelenlegi szolgálatban lévők listája – **fontos**, hogy ennek forrása nem az NFC-önbejelentés, hanem a **Vezénylés modul aznapi beosztása** (ez megbízhatóbb, mert nem függ attól, hogy valaki ténylegesen scannelt-e). A nézet élő GPS-pozíciókat és zóna-státuszt is mutat, ha az adott dolgozóhoz van rögzített helyzet. Látóköre szerepkör szerint automatikusan szűkül (admin/igazgató: minden helyszín; biztonsági vezető: saját irodaházai; egyéb: saját helyszín).
- **NFC-beléptetési napló:** szűrhető (dátumtartomány, helyszín) esemény-előzmény, szintén szerepkör szerint automatikusan szűkített látókörrel – egy sima dolgozó kizárólag a saját eseményeit láthatja, még szűréssel sem érhet el másokét.

### 4.6. Geofencing (GPS-alapú zóna-figyelés)

**Modul célja:** Annak automatikus észlelése, ha egy szolgálatban lévő őr elhagyja a rábízott terület határait.

**Funkciók listája:**

- **Helyzetjelentés (mobil, háttérben):** a natív alkalmazás rendszeres időközönként GPS-pozíciót küld a szerverre.
- **Zóna-számítás jitter-védelemmel:** a rendszer a helyszín adminisztrátor által rögzített térképi lehatárolása (poligon) alapján dönti el, hogy a dolgozó a zónán belül vagy kívül tartózkodik-e; a véletlenszerű GPS-pontatlanság kiszűrésére csak 3 egymást követő "kívüli" jelzés után jelenti be ténylegesen a zóna elhagyását.
- **Automatikus riasztás:** zóna-elhagyáskor/visszatéréskor a helyszín felelősei (biztonsági vezető, ingatlankezelő) azonnali élő és push-értesítést kapnak.
- **Élő térkép-nézet:** "ki hol van" áttekintés a jogosult vezetőknek.

### 4.7. Vezénylés / Beosztás modul

**Modul célja:** Havi munkaerő-beosztás tervezése és a 24 órás szolgálatok kiesése esetén szükséges pótlás gyors megszervezése.

**Funkciók listája:**

- **Terület-kezelés:** a beosztási rács szervezési egységei, opcionálisan egy irodaházhoz köthetők.
- **Dolgozó-kezelés (hibrid modell):** a beosztási sorok opcionálisan köthetők egy valódi bejelentkezős fiókhoz, de attól függetlenül is léteznek – ez lehetővé teszi, hogy olyan (pl. külsős, alkalmi) munkaerőt is be lehessen osztani, akinek nincs bejelentkezési fiókja a rendszerbe.
- **Havi beosztási rács:** naptári nézet, ahol minden dolgozó minden napjához egy jelölés tartozik: **szám** = ténylegesen ledolgozott óraszám (jellemzően 24 = teljes szolgálat), **"X"** = nem elérhető, **"?"** = bizonytalan (egyeztetés szükséges), **"+"** = túlórát vállal, **üres** = szabad. A sima dolgozó csak a saját sorát szerkesztheti, és csak "X"/"+"/törlés jelöléssel – tényleges óraszámot csak vezetői jogkörrel rendelkező felhasználó írhat be.
- **Automatikus pótlás-jelölt-ajánlás 24 órás szolgálat kiesésére:** ha egy dolgozó 24 órás szolgálata kiesik, a rendszer két 12 órás blokkra (éjszakai és nappali) bontva ajánl helyettesítőt. "Természetes" jelöltnek számít éjszakára az, aki előző nap már 24 órás szolgálatban volt (logikusan folytatja), nappalra az, aki két nappal korábban dolgozott 24 órát, de előző nap már nem (kipihente magát) – emellett bármely aznap szabad ("+", "?" vagy üres jelölésű, és aznap még sehol nem dolgozó) munkatárs is felkínálásra kerül, alacsonyabb prioritással.
- **Pótlás kijelölése/visszavonása:** egy kattintással hozzárendelhető a kiválasztott jelölt a hiányzó szolgálathoz, illetve a hozzárendelés visszavonható; minden ilyen művelet naplózásra kerül (ki, mikor, kit jelölt ki vagy vont vissza).
- **Változásnapló:** az utóbbi 200 pótlás-esemény emberi nyelven olvasható előzménye.
- **Excel-import:** meglévő, táblázatkezelőben vezetett beosztás egy lépésben betölthető a rendszerbe (terület és dolgozó automatikusan létrejön, ha még nem létezik).
- **Hozzáférés:** admin és területi igazgató mindent lát/szerkeszt; biztonsági vezető csak a saját felügyelt irodaházainak területeit (plusz mindig látja a saját sorát, ha be van kötve fiókhoz); **az ingatlankezelő teljesen ki van zárva** ebből a modulból; sima dolgozó csak a saját munkahelye szerinti területeket és a saját sorát látja/szerkesztheti korlátozottan.

### 4.8. Dokumentumok / Jegyzőkönyvek modul

**Modul célja:** Jogilag releváns biztonsági események és átadás-átvételek digitális, aláírással hitelesített, azonnal PDF-be exportálható dokumentálása.

**Közös működési szabályok minden típusra:**
- **Létrehozás**: kizárólag dolgozó és adminisztrátor jogosult (a vezetői szerepkörök – ingatlankezelő, biztonsági vezető, területi igazgató – csak megtekinthetik és jóváhagyhatják, nem hozhatnak létre újat).
- **Megtekintés**: dolgozó csak a sajátjait; biztonsági vezető a sajátjait és a felügyelt irodaházak dolgozóiéit; admin/ingatlankezelő/területi igazgató mindent lát.
- **Digitális aláírás**: a dokumentumhoz tartozó minden aláíró fél (ügyfél, tanú, biztonsági szolgálat képviselője stb., típusonként eltérő szerepkörökben) egy érintőképernyős aláírásmezőn írja alá a nevét; az aláírás a végleges PDF-dokumentumba kerül beágyazásra.
- **Biztonsági törlési szabály**: az aláírás-kép fájlként **kizárólag a PDF sikeres elkészültéig** létezik a szerveren – utána azonnal, véglegesen törlődik a lemezről, kizárólag a PDF-be beágyazva marad meg. Ez adatvédelmi célú, tudatos tervezési döntés.
- **Jóváhagyás ("review")**: bármelyik vezetői szerepkör "átnézve" pecséttel láthatja el a dokumentumot.
- **Törlés**: kizárólag adminisztrátor jogosultsága.
- **Előnézet és letöltés**: a kész PDF közvetlenül böngészőben megtekinthető és letölthető.

**A 10 dokumentumtípus:**

1. **Feljegyzéses jegyzőkönyv** – általános biztonsági esemény rögzítése: helyszín, időpont, eseményleírás, jelenlévő vagyonőrök megjelölése. Aláírók: jegyzőkönyvvezető, tanú, képviselő.
2. **Gépjármű beléptető nyilvántartás** – telephelyre belépő/kilépő járművek naplózása: rendszám, cég/személy neve, be- és kilépés időpontja, megjegyzés. (Aláírás nélküli, egyszerű naplózási típus.)
3. **Eszközök átadás-átvétele** – biztonsági/technikai eszköz kiadásának és visszavételének követése: eszköznév, kiadás/visszavétel ideje, átadó és átvevő adatai. (Aláírás nélküli típus.)
4. **Kárfelvételi jegyzőkönyv** – károkozási esemény hivatalos rögzítése: esemény időintervalluma, helyszín, tárgy, a károkozó teljes személyes adatlapja (név, igazolvány, születési adatok, anyja neve, lakcím, elérhetőségek), tanú/őr megjelölése, esemény leírása, "beismerte-e" jelölő. Aláírók: károkozó, biztonsági szolgálat, képviselő.
5. **Kiürítési jegyzőkönyv** – épületkiürítés (pl. tűzriadó) részletes, elágazó logikájú dokumentálása: riasztás típusa/oka, tényleges tűz esetén a tűz jellemzői, életveszély, oltás módja, tűzoltóparancsnok érkezési ideje, visszaengedés protokollja; ha nem volt valós tűz, a korai figyelmeztetés és az esetleges késés körülményei. Kiegészíthető akár 3 db csatolt fájllal (hatósági/tűzmarsall jegyzőkönyv, kiürítési nyilvántartás).
6. **Kiürítési nyilvántartás** – egy adott bérlő/cég kiürítéskori jelenlétének rögzítése: bérlő neve, bent maradt-e valaki, tűzvédelmi felelős neve. Aláíró: tűzvédelmi felelős.
7. **Kulcs/Kártya átadás-átvétele** – egyedi kulcs vagy kártya kiadásának/visszavételének dokumentálása: azonosító, cég/munkahely, kiadás/visszavétel ideje, felvevő igazolványszáma. Aláírók: felvevő, leadó, visszavevő.
8. **Talált tárgy jegyzőkönyv** – elveszett és megtalált tárgyak nyilvántartása és kiadása: tárgy leírása, észlelés helye/ideje, átvevő teljes személyes adatlapja. Aláíró: átvevő.
9. **Robbantással fenyegetés jegyzőkönyve** – telefonos bombariadó-fenyegetés kriminalisztikai célú, strukturált rögzítése: a hívás szó szerinti átirata, valamint a hívó fél jellemzőinek részletes, előre definiált kategóriákból választható leírása (nem, korcsoport, beszédstílus, hangnem, érzelmi állapot, háttérzaj, helyismeret), illetve a hívást fogadó adatai. Aláíró: hívást fogadó.
10. **Tűzkulcs és tűzkazetta kiadás** – tűzoltósági kulcs/plombás kazetta kiadásának és visszazárásának dokumentálása: plombaszám, plomba állapota, kiadás oka, lezárás időpontja. Két aláírás: felvevő (kiadáskor kötelező), leadó (csak akkor kötelező, ha a lezárás ténylegesen megtörtént).

### 4.9. Napi Biztonsági Jelentés

**Modul célja:** A szolgálat napi, összefoglaló írásos átadása a következő váltásnak és a vezetőségnek.

**Funkciók listája:**

- **Létrehozás/szerkesztés** (dolgozó, admin): jelentés dátuma, szolgálatban lévő és előző váltás tagjai, átadó neve, átadás időpontja, felszerelés-állapot, ellenőrök/őrjáratok, incidensek, események, tűzriasztások, liftek állapota, karbantartási bejegyzések – mindegyik szabadon bővíthető listaként.
- **Megosztás-kezelés:** a jelentés a szerepkör-alapú láthatóságon felül egyedileg is megosztható konkrét személyekkel.
- **Vezetői jóváhagyás:** bármely vezetői szerepkör "átnézettnek" jelölheti.
- **Több helyszínhez társítás:** egy jelentés több irodaházra is vonatkozhat.

### 4.10. Kommunikáció (Váltóüzenetek és Vezetői körüzenetek)

**Modul célja:** Belső, munkavégzéshez kötött kommunikáció a dolgozók és a vezetőség között.

**Funkciók listája:**

- **Váltóüzenetek (műszakátadó jegyzetek):** dolgozók közötti, helyszínhez és dátumhoz kötött rövid üzenetek létrehozása, szerkesztése, törlése – **az ingatlankezelő ezt nem éri el**.
- **Vezetői körüzenetek:** bármely vezetői szerepkör (admin, ingatlankezelő, biztonsági vezető, területi igazgató) küldhet üzenetet vagy az összes dolgozónak, vagy célzottan kiválasztott személyeknek. A biztonsági vezető ezt csak a saját csapatára korlátozva teheti meg, "mindenkinek" küldést nem használhat.
- **Válaszolás:** a címzettek (és a küldő) válaszolhatnak a szálban; saját válaszukat szerkeszthetik/törölhetik, adminisztrátor bármelyiket.
- **Azonnali értesítés:** minden új üzenet és válasz élő felületfrissítéssel és push-értesítéssel jár.

### 4.11. Teljesítmény / Vezetői (Director) modul

**Modul célja:** Objektív, számszerűsített kép a vezetőség számára az egyes irodaházak és biztonsági vezetők teljesítményéről.

**Funkciók listája:**

- **Teljesítmény-pontszám számítása** irodaházanként: az aktív dolgozók átlagos "készültségi szintje" (a rendszerben elvégzett kötelező oktatások és vizsgák arányából) mínusz a "fluktuációs büntetés" (az adott hónapban kilépett dolgozók aránya az aktív állományhoz képest). A végeredmény akár negatív is lehet.
- **Vezetői (biztonsági vezetői) összesítő:** a felügyelt irodaházak létszámmal súlyozott átlaga.
- **Igazgatói irányítópult:** minden felügyelt biztonsági vezető névjegykártya-szerű összesítője, lenyitható irodaházankénti bontással, valamint (mobil nézetben) élő jelenlét-számláló, nyitott (még nem jóváhagyott) kritikus jegyzőkönyvek listája és heti incidens-trend.
- **Célkitűzés-beállítás:** a területi igazgató havi célértéket (elvárt oktatottsági % és maximális fluktuációs %) állíthat be egy adott biztonsági vezetőre – akár cégszinten, akár egy konkrét irodaházra vonatkoztatva.
- **Havi riport oldal:** az elmúlt (alapértelmezetten 6) hónap visszamenőleges alakulása, hónapról hónapra számított javulással/romlással.

### 4.12. AI Tudásbázis-asszisztens

**Modul célja:** A cég belső szabályzatai, utasításai, ügyrendjei alapján azonnal, természetes nyelven válaszoló virtuális asszisztens, amely csökkenti a "hol találom ezt a szabályt" jellegű időveszteséget.

**Funkciók listája:**

- **Dokumentum-feltöltés a tudásbázisba** (admin/területi igazgató): PDF, Word, Excel vagy szöveges fájl feltöltése (max. 20 MB); a rendszer a háttérben automatikusan feldolgozza és beindexeli, élőben mutatva a feldolgozás állapotát (várakozik → feldolgozás alatt → kész/hiba).
- **Kérdés-válasz chat** (bárki): a felhasználó szabad szöveggel kérdezhet, a válasz szó-szintű "élő gépeléssel" jelenik meg, Markdown-formázással (kiemelések, listák, táblázatok). A rendszer **kizárólag a feltöltött cégdokumentumok tartalma alapján válaszol** – ha nincs releváns találat, ezt egyértelműen jelzi, nem "találgat".
- **Forrás-megjelölés** (csak admin/területi igazgató): a válasz alatt látható, mely feltöltött dokumentum(ok)ból származik az állítás; egyszerű dolgozói nézetben ez nem jelenik meg, és a feltöltött dokumentumok listája sem érhető el – tudatos belső információvédelmi döntés.
- **Beszélgetés-előzmények:** minden korábbi párbeszéd elmenthető, visszakereshető, visszatölthető vagy törölhető.
- **Hangvezérelt mód:** mikrofongombbal indítható folyamatos hangalapú párbeszéd – a rendszer magyarul köszönti a felhasználót, felismeri a beszédet, majd a választ hangosan felolvassa, és automatikusan visszatér hallgatózó állapotba. Külön kapcsoló csak a gépelt válaszok felolvasására.
- **Dokumentum törlése** (admin/területi igazgató): a fájl, az adatbázis-bejegyzés és a hozzá tartozó indexelt tartalom egyszerre, véglegesen törlődik.

### 4.13. Mobil-natív kiegészítő képességek

A natív Android/iOS alkalmazás a fentieken felül az alábbi, kizárólag mobil eszközön elérhető funkciókat kínálja:

- **NFC-checkpoint beolvasás** a telefon beépített NFC-olvasójával (lásd 4.5).
- **Háttérben futó GPS-helymeghatározás** a geofencing funkcióhoz (lásd 4.6).
- **Offline-működési sor**: hálózat nélküli NFC-beolvasás vagy GPS-jelentés esetén automatikus, idempotens újraküldés a kapcsolat helyreállásakor (lásd 3.2).
- **Natív push-feliratkozás** (device-token regisztráció).

---

## 5. Automatizációk, Háttérfolyamatok és Integrációk

### 5.1 Automatikus háttérfolyamatok

- **E-mail-küldés ellenőrzés leadásakor** – minden kulcs/kártya-ellenőrzés automatikusan e-mailt generál az érintett címzetteknek (4.2. pont), hibatűrő módon (a levélküldés sikertelensége nem akadályozza az ellenőrzés mentését).
- **AI-dokumentum háttérfeldolgozás** – a feltöltött tudásbázis-dokumentumok feldolgozása (szövegkinyerés, darabolás, vektoros indexelés) aszinkron háttérfolyamatban zajlik, a felhasználói felület ezalatt élő státuszfrissítést mutat.
- **Push-értesítés-küldés** – minden releváns eseményhez (NFC, geofence, kritikus dokumentum, üzenet) automatikus, azonnali push-üzenet generálódik és kerül kézbesítésre mind böngésző-, mind (előkészítve) natív mobil csatornán.
- **Élő WebSocket-broadcast** – NFC-események, GPS-pozíciók, vezetői üzenetek és a "ki van bent" nézet frissítése valós időben, oldalfrissítés nélkül jut el az érintett felhasználókhoz.
- **Auditnapló (aktivitásnapló)** – a rendszer minden üzletileg releváns eseményt (be-/kilépés, ellenőrzés leadása, NFC-bejárás, dokumentum-műveletek, üzenetváltás, geofence-esemény) automatikusan, időbélyeggel és a végrehajtó nevével naplóz, adminisztrátor és ingatlankezelő számára visszakereshető formában.
- **Idempotens duplikáció-védelem** – az offline-sorból érkező, esetlegesen duplán beküldött NFC- és geofence-események a rendszer automatikusan felismeri és nem dolgozza fel kétszer.
- Ütemezett (cron alapú) automatikus feladat a vizsgált időpontban nincs a rendszerben – minden fenti automatizmus eseményvezérelt (egy felhasználói művelet váltja ki), nem időzített háttérjob.

### 5.2 Külső rendszerek és integrációk

- **E-mail (SMTP)** – az ellenőrzési értesítések kiküldésének csatornája, konfigurálható levelezőszolgáltatóval (pl. Gmail).
- **Mesterséges intelligencia szolgáltatás** – önálló, a fő rendszerhez szorosan kapcsolt, de technikailag elkülönített AI-motor (nagy nyelvi modell + vektoros keresőmotor) szolgálja ki a tudásbázis-asszisztenst, kizárólag belső, védett hálózaton keresztül érhető el.
- **Szöveg-hang átalakítás (TTS)** – a hangalapú AI-asszisztens felolvasási funkciójához.
- **Valós idejű üzenetküző infrastruktúra (WebSocket)** – az élő értesítések, NFC-broadcastok és presence-frissítések technikai háttere.
- **Böngésző push-értesítési szolgáltatás** – szabványos, böngésző-független push-technológia (VAPID-alapú).
- **Mobil platform push-szolgáltatások (Google/Apple)** – natív push-értesítés csatornája; jelenleg technikailag előkészítve, éles hitelesítő adatok nélkül.

---

## 6. Teljes Funkció-Leltár (Coverage Verification Matrix)

| Modul | Funkció neve | Érintett szerepkör(ök) | PWA / Offline támogatott? |
|---|---|---|---|
| Hitelesítés | Cégválasztó nyitóoldal | Mindenki (nyilvános) | Igen |
| Hitelesítés | Bejelentkezés / kijelentkezés | Minden tenant-szerepkör | Igen |
| Hitelesítés | Szerepkör szerinti automatikus átirányítás | Minden tenant-szerepkör | Igen |
| Hitelesítés | Több-cég session-elkülönítés védelem | Minden tenant-szerepkör | Igen |
| Hitelesítés | Cégek (tenant) kezelése | Szuperadmin | Igen |
| Hitelesítés | Cégen belüli felhasználók support-kezelése | Szuperadmin | Igen |
| Portál | Kezdőoldal összesítő kártyák | Minden tenant-szerepkör | Igen |
| Portál | Vészhelyzeti kapcsolattartók megjelenítése | Minden tenant-szerepkör | Igen |
| Portál | "Jelenlegi állapotod" (szolgálat/bejárás) kártya | Minden tenant-szerepkör | Igen |
| Ellenőrzés | Ellenőrzés indítása és leadása | Dolgozó, admin, biztonsági vezető | Igen (net kell) |
| Ellenőrzés | Automatikus e-mail-értesítés | Rendszer (automatikus) | – |
| Ellenőrzés | Eredmény megtekintése | Dolgozó (saját), admin, ingatlankezelő | Igen |
| Ellenőrzés | Eredmény utólagos szerkesztése | Dolgozó (saját), admin | Igen |
| Ellenőrzés | Előzmények, szűrés | Admin | Igen |
| Ellenőrzés | CSV-export | Admin | Igen |
| Admin | Irányítópult statisztikák | Admin | Igen |
| Admin | Helyszínek CRUD + logó + geofence-poligon | Admin | Igen |
| Admin | Tételek (kulcs/kártya) CRUD | Admin, biztonsági vezető (saját) | Igen |
| Admin | Tétel-csoportok CRUD | Admin, biztonsági vezető (saját) | Igen |
| Admin | NFC-matricák CRUD | Admin | Igen |
| Admin | Felhasználó-kezelés + hierarchia-hozzárendelés | Admin | Igen |
| Admin | NFC-jogosultság-lista szerkesztése | Admin | Igen |
| Admin | Vizsga-kivétel felhasználónként | Admin | Igen |
| Admin | Profil-szerkesztés, jelszócsere | Minden tenant-szerepkör | Igen |
| Admin | Cégszintű beállítások | Admin | Igen |
| Admin | Vészhelyzeti kapcsolattartók CRUD | Admin | Igen |
| Oktatás | Oktatások kezelése (admin szerkesztő) | Admin | Igen |
| Oktatás | Oktatás megtekintése és kitöltése | Dolgozó, admin | Igen |
| Vizsga | Vizsgák kezelése (admin szerkesztő) | Admin | Igen |
| Vizsga | Vizsga kitöltése (időzített, csalásvédett) | Dolgozó, admin | Igen |
| Vizsga | Vizsgaeredmények áttekintése | Admin | Igen |
| Vizsga | Vizsga-emlékeztető küldése | Biztonsági vezető | Igen |
| NFC | Checkpoint-beolvasás | Dolgozó (mobil) | Igen (offline-sor) |
| NFC | Jogosulatlan kísérlet elutasítása + naplózás | Rendszer (automatikus) | – |
| NFC | Mindenkinek szóló azonnali értesítés | Rendszer (automatikus) | Igen (push) |
| NFC | "Mai bejárás" ellenőrzőlista | Dolgozó | Igen |
| NFC | NFC-előzmények | Dolgozó | Igen |
| NFC | Értesítési harang | Minden tenant-szerepkör | Igen |
| NFC | Beléptetési napló, szűrés | Admin, biztonsági vezető, dolgozó (saját) | Igen |
| Presence | "Ki van bent" élő nézet | Admin, biztonsági vezető, terül. igazgató | Igen (élő) |
| Geofencing | GPS-helyzetjelentés | Dolgozó (mobil, háttér) | Igen (offline-sor) |
| Geofencing | Zóna-elhagyás/visszatérés riasztás | Biztonsági vezető, ingatlankezelő | Igen (push) |
| Geofencing | Élő térkép-nézet | Admin, biztonsági vezető, terül. igazgató | Igen |
| Vezénylés | Terület- és dolgozó-kezelés | Admin, terül. igazgató, biztonsági vezető | Igen |
| Vezénylés | Havi beosztási rács megtekintése | Minden (kivéve ingatlankezelő) | Igen |
| Vezénylés | Beosztás-cella szerkesztése (óraszám) | Admin, terül. igazgató, biztonsági vezető | Igen |
| Vezénylés | Saját sor korlátozott szerkesztése | Dolgozó | Igen |
| Vezénylés | Automatikus pótlás-jelölt-ajánlás | Rendszer (automatikus) | Igen |
| Vezénylés | Pótlás kijelölése/visszavonása | Admin, terül. igazgató, biztonsági vezető | Igen |
| Vezénylés | Változásnapló | Admin, terül. igazgató, biztonsági vezető | Igen |
| Vezénylés | Excel-import | Admin, terül. igazgató | Igen |
| Dokumentumok | Feljegyzéses jegyzőkönyv | Dolgozó, admin (létrehozás) | Igen |
| Dokumentumok | Gépjármű beléptető nyilvántartás | Dolgozó, admin (létrehozás) | Igen |
| Dokumentumok | Eszközök átadás-átvétele | Dolgozó, admin (létrehozás) | Igen |
| Dokumentumok | Kárfelvételi jegyzőkönyv | Dolgozó, admin (létrehozás) | Igen |
| Dokumentumok | Kiürítési jegyzőkönyv (+ mellékletek) | Dolgozó, admin (létrehozás) | Igen |
| Dokumentumok | Kiürítési nyilvántartás | Dolgozó, admin (létrehozás) | Igen |
| Dokumentumok | Kulcs/Kártya átadás-átvétel | Dolgozó, admin (létrehozás) | Igen |
| Dokumentumok | Talált tárgy jegyzőkönyv | Dolgozó, admin (létrehozás) | Igen |
| Dokumentumok | Robbantással fenyegetés jegyzőkönyve | Dolgozó, admin (létrehozás) | Igen |
| Dokumentumok | Tűzkulcs és tűzkazetta kiadás | Dolgozó, admin (létrehozás) | Igen |
| Dokumentumok | Digitális aláírás-gyűjtés + PDF-generálás | Rendszer (automatikus) | Igen |
| Dokumentumok | Megtekintés/előnézet/letöltés | Dolgozó (saját), admin, ingatlankezelő, biztonsági vezető (csapata), terül. igazgató | Igen |
| Dokumentumok | Jóváhagyás ("review") | Admin, ingatlankezelő, biztonsági vezető, terül. igazgató | Igen |
| Dokumentumok | Törlés | Admin | Igen |
| Napi jelentés | Létrehozás/szerkesztés | Dolgozó, admin | Igen |
| Napi jelentés | Megosztás-kezelés | Dolgozó, admin | Igen |
| Napi jelentés | Jóváhagyás | Admin, ingatlankezelő, biztonsági vezető, terül. igazgató | Igen |
| Kommunikáció | Váltóüzenetek (műszakátadás) | Dolgozó, admin, biztonsági vezető, terül. igazgató | Igen |
| Kommunikáció | Vezetői körüzenet küldése | Admin, ingatlankezelő, biztonsági vezető, terül. igazgató | Igen |
| Kommunikáció | Válaszolás/szerkesztés/törlés | Címzettek, admin | Igen |
| Teljesítmény | Irodaházankénti pontszám-számítás | Rendszer (automatikus) | Igen |
| Teljesítmény | Igazgatói irányítópult | Terül. igazgató | Igen |
| Teljesítmény | Célkitűzés-beállítás | Terül. igazgató | Igen |
| Teljesítmény | Havi riport | Terül. igazgató | Igen |
| Csapat | Dolgozó/PM hozzárendelése irodaházhoz | Biztonsági vezető | Igen |
| Aktivitásnapló | Napló böngészése, szűrés | Admin, ingatlankezelő | Igen |
| AI-asszisztens | Dokumentum feltöltése tudásbázisba | Admin, terül. igazgató | Igen |
| AI-asszisztens | Kérdés-válasz chat (streamelt) | Minden tenant-szerepkör | Igen (net kell) |
| AI-asszisztens | Forrás-megjelölés a válaszban | Admin, terül. igazgató | Igen |
| AI-asszisztens | Beszélgetés-előzmények kezelése | Minden tenant-szerepkör | Igen |
| AI-asszisztens | Hangvezérelt kérdezés + felolvasás | Minden tenant-szerepkör | Igen |
| AI-asszisztens | Dokumentum törlése tudásbázisból | Admin, terül. igazgató | Igen |
| Mobil-natív | NFC-checkpoint beolvasás (hardveres) | Dolgozó | Igen (offline-sor) |
| Mobil-natív | GPS-helymeghatározás (háttér) | Dolgozó | Igen (offline-sor) |
| Mobil-natív | Offline-szinkronizációs sor | Rendszer (automatikus) | Igen |
| PWA | Telepíthetőség (kezdőképernyőre) | Minden tenant-szerepkör | Igen |
| PWA | Statikus tartalom offline-elérése | Minden tenant-szerepkör | Igen |
| PWA | Böngésző push-feliratkozás | Minden tenant-szerepkör | Igen |
| PWA | iOS telepítési útmutató push-hoz | Minden tenant-szerepkör | Igen |
| Push | NFC-esemény értesítés | Rendszer (automatikus) | Igen |
| Push | Geofence-esemény értesítés | Rendszer (automatikus) | Igen |
| Push | Kritikus dokumentum értesítés | Rendszer (automatikus) | Igen |
| Push | Üzenet/válasz értesítés | Rendszer (automatikus) | Igen (csak web) |
| Push | Natív mobil push (FCM/APNs) | Rendszer (előkészítve, nem éles) | Igen (előkészítve) |

---

*A dokumentum a KulcsNyilvántartó platform teljes forráskód-bázisának (route-definíciók, adatbázis-séma, controller- és validációs logika, frontend-oldalak, PWA-konfiguráció) rendszeres átvizsgálása alapján készült, kizárólag a ténylegesen implementált és a kódban megtalálható funkciókra támaszkodva.*
