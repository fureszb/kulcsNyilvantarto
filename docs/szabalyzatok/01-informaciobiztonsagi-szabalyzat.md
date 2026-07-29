# Információbiztonsági szabályzat

**Rendszer:** KK Nyilvántartó (Kulcs & Kártya Nyilvántartó) — többbérlős (multi-tenant) webalkalmazás
**Üzemeltető:** [Cégnév], [adószám], [székhely]
**Verzió:** 1.0
**Hatályba lépés:** [dátum]
**Felülvizsgálat:** évente, illetve minden biztonsági incidenst követően

## 1. Cél és hatály

A szabályzat célja, hogy meghatározza a KK Nyilvántartó rendszerben kezelt adatok (ügyfél-cégek dolgozói adatai, beléptetési naplók, GPS-pozíciók, biztonsági jegyzőkönyvek, digitális aláírások) védelmére vonatkozó szervezeti és technikai elveket.

A szabályzat hatálya kiterjed:
- a rendszert üzemeltető mindkét munkatársra;
- a rendszer teljes technikai infrastruktúrájára (alkalmazás, adatbázisok, hosting, build- és deployfolyamat);
- minden bérlő (tenant) adatára, függetlenül azok méretétől.

## 2. Szervezeti felelősség

2 fős csapat esetén formális biztonsági osztály helyett az alábbi felelősségi rend érvényes:

| Szerepkör | Felelősség |
|---|---|
| **Rendszergazda / Biztonsági felelős** | Infrastruktúra, hozzáférés-kezelés, mentések, incidenskezelés koordinálása |
| **Fejlesztő** | Biztonságos kódolási gyakorlat, változáskezelési folyamat betartása, kódszintű sebezhetőségek kezelése |

Kétfős csapatnál a két szerep egy személyben is összevonható, de minden érdemi biztonsági döntést (pl. új alfeldolgozó bevonása, incidens lezárása) mindkét félnek jóvá kell hagynia.

## 3. Alapelvek

- **Bizalmasság:** az adatokhoz kizárólag az arra jogosultak férhetnek hozzá (ld. Jelszó- és hozzáférés-kezelési szabályzat).
- **Sértetlenség:** az adatok jogosulatlan módosítása kizárt vagy naplózott és visszakövethető.
- **Rendelkezésre állás:** a rendszer és az adatok elérhetőségét biztonsági mentés és dokumentált helyreállítási eljárás garantálja (ld. Biztonsági mentési eljárás).
- **Arányosság:** csak a szolgáltatás nyújtásához ténylegesen szükséges adatot kezeljük (különösen igaz a GPS-pozícióra és az NFC-naplóra).

## 4. A rendszer architektúrájából adódó biztonsági tulajdonságok

- **Bérlőnkénti adatbázis-izoláció:** minden ügyfél cég (tenant) saját, önálló adatbázisban tárolja az adatait — nincs megosztott tábla, ahol egy alkalmazáshiba átszivárogtathatná egyik ügyfél adatát a másikhoz.
- **Jelszavak:** kizárólag visszafejthetetlen (hash-elt, bcrypt) formában tárolva, sosem nyílt szövegként.
- **Titkosított kapcsolat:** a produkciós rendszer kizárólag HTTPS-en keresztül érhető el.
- **CSRF-védelem** minden állapotváltoztató műveletnél.
- **Szerepkör-alapú jogosultságkezelés** (ld. 2. szabályzat).
- **Digitális aláírások** ideiglenes tárolása és automatikus törlése — az aláírás-kép nem marad tartósan a szerveren.
- **Naplózás:** a rendszer tevékenységi naplót vezet (ki, mikor, milyen műveletet végzett) a kritikus adatobjektumokon.
- **Kliensoldali gyorsítótárazás:** a PWA szolgáltatásmunkás (service worker) kizárólag statikus, nem-személyes tartalmat cache-el; munkamenet-, hitelesítési- és API-kérésekhez nem nyúl.

## 5. Ismert korlátok és fejlesztési tervek

Az őszinteség és a folyamatos fejlődés elve alapján a szabályzat rögzíti a jelenlegi hiányosságokat is:

| Hiányosság | Tervezett intézkedés |
|---|---|
| Nincs többfaktoros hitelesítés (MFA) az admin fiókokon | Bevezetés ütemezve — ld. fejlesztési backlog |
| Nincs harmadik fél által végzett penetrációs teszt | Első kör tervezése az ügyfélszám növekedésével arányosan |
| Nincs formális, automatizált biztonsági mentés | Ld. Biztonsági mentési eljárás — bevezetés folyamatban |
| Nincs elkülönített staging/teszt környezet | Ld. Változáskezelési folyamat |

## 6. Adatosztályozás

| Osztály | Példa | Elvárt védelem |
|---|---|---|
| **Kiemelt (különleges/érzékeny)** | GPS-pozíció, digitális aláírás | Titkosított tárolás/átvitel, szigorú hozzáférés, minimális megőrzési idő |
| **Bizalmas (személyes adat)** | Név, e-mail, NFC beléptetési napló, biztonsági jegyzőkönyvek | Hozzáférés csak jogosultsági kör szerint, naplózott elérés |
| **Belső** | Rendszerkonfiguráció, tenant-beállítások | Csak admin jogosultsággal |
| **Nyilvános** | Termékleírás, marketinganyag | Nincs korlátozás |

## 7. Harmadik felek (alfeldolgozók)

A rendszer az alábbi külső szolgáltatásokat veszi igénybe — a teljes lista és jogalap a GDPR dokumentációban (6. dokumentum) található:
- SMTP levélküldés (tranzakciós e-mailek: jelszó-visszaállítás, értesítések)
- Böngésző push-értesítési szolgáltatók (a felhasználó által választott böngésző szerint)
- A hosting infrastruktúra üzemeltetője

Az AI-asszisztens funkció **helyben futtatott** nyelvi modellt használ, adatot **nem küld ki** külső AI-szolgáltatóhoz.

## 8. Felülvizsgálat

A szabályzatot évente, illetve minden biztonsági incidenst vagy jelentős architekturális változást követően felül kell vizsgálni. A felülvizsgálatot mindkét munkatársnak jóvá kell hagynia, a jóváhagyás dátumát és a változásokat a dokumentum végén vezetett verziótörténetben kell rögzíteni.

## Verziótörténet

| Verzió | Dátum | Módosítás | Jóváhagyta |
|---|---|---|---|
| 1.0 | [dátum] | Első kiadás | |
