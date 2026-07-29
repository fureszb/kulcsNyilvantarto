# GDPR dokumentáció — Adatkezelési nyilvántartás és tájékoztató-váz

**Rendszer:** KK Nyilvántartó
**Verzió:** 1.0 | **Hatályba lépés:** [dátum] | **Felülvizsgálat:** évente, illetve minden új adatkategória bevezetésekor

## 1. Szereposztás

- **Adatkezelő:** minden bérlő cég (az ügyfél, aki a KK Nyilvántartó rendszert használja a saját dolgozói/telephelyei adatainak kezelésére) — **ő** dönt a cél és eszköz felől.
- **Adatfeldolgozó:** [Cégnév] (a rendszer üzemeltetője) — a bérlő cég utasítása alapján, technikai szolgáltatóként kezeli az adatot. A pontos feltételeket az Adatfeldolgozási szerződésminta (7. dokumentum) rögzíti.

Ez a dokumentum az adatfeldolgozói szerepkörből fakadó nyilvántartási kötelezettséget (GDPR 30. cikk) teljesíti, és sablonként szolgál az adatkezelő (bérlő cég) saját tájékoztatójához.

## 2. Adatkezelési nyilvántartás (GDPR 30. cikk szerinti tevékenységek)

| Adatkategória | Forrás (modell) | Cél | Jogalap (adatkezelő oldalán, javasolt) | Megőrzési idő (javasolt, testreszabandó) |
|---|---|---|---|---|
| Regisztrációs/profiladat (név, e-mail, szerepkör) | Felhasználói fiók | Bejelentkezés, jogosultságkezelés | Szerződés/munkaviszony teljesítése | A munkaviszony/megbízás megszűnése + [x] év |
| NFC-beléptetési napló (ki, mikor, hol lépett be) | NFC beléptetési napló | Beléptetés-ellenőrzés, "ki van bent" nyilvántartás | Munkáltatói jogos érdek (biztonság) — **arányossági teszt szükséges** | Javasolt: 30–90 nap, majd anonimizálás/törlés |
| **GPS-pozíció** (őrjárat-geofencing) | Őr pozíció-napló | Zóna-riasztás, munkavégzés ellenőrzése | Munkáltatói jogos érdek — **fokozottan arányossági teszt szükséges, munkajogi tájékoztatás kötelező** | Javasolt: rövid (pl. 7–30 nap), csak a legutóbbi pozíció tárolása javasolt hosszabb távon |
| Digitális aláírás | Dokumentum-aláírás | Jegyzőkönyv hitelesítése | Szerződés/jogi kötelezettség teljesítése | Az aláírás-**kép** ideiglenes, automatikusan törlődik; a jegyzőkönyv szövege a jogszabályi megőrzési időig marad |
| Biztonsági jegyzőkönyvek tartalma (esemény, kár, incidens leírása) | Dokumentumok | Jogi/biztosítási/üzemeltetési dokumentálás | Jogi kötelezettség / jogos érdek | Jogszabályi/biztosítási megőrzési idő szerint |
| Push-értesítési feliratkozás | Push subscription | Értesítés küldése (pl. váltóüzenet) | Hozzájárulás (a feliratkozás önkéntes) | A leiratkozásig / fiók törléséig |
| Rendszertevékenység-napló | Tevékenységnapló | Biztonság, visszakövethetőség | Jogos érdek | Javasolt: 1 év |
| Vészhelyzeti kapcsolattartói adat | Értesítési lista | Vészhelyzeti kommunikáció | Jogos érdek / hozzájárulás | A kapcsolat frissítéséig |

> **Kiemelt figyelmeztetés a GPS-adatra:** a folyamatos helymeghatározás munkavállalóknál Magyarországon szigorú megítélés alá esik. Javasolt jogi konzultáció arról, hogy a jelenlegi geofencing-funkció mértéke arányos-e, és szükséges-e adatvédelmi hatásvizsgálat (DPIA) készítése a GDPR 35. cikke alapján, tekintettel a "nagymértékű, szisztematikus megfigyelés" küszöbére.

## 3. Alfeldolgozók (a rendszer által igénybe vett külső szolgáltatók)

| Szolgáltató | Szerep | Adat, amit lát |
|---|---|---|
| SMTP levélküldő szolgáltató | Tranzakciós e-mail (jelszó-visszaállítás, értesítés) | Címzett e-mail-cím, üzenet tartalma |
| Böngésző push-szolgáltatók (a felhasználó böngészőjétől függően) | Push-értesítés kézbesítése | Push-végpont azonosító, értesítés szövege |
| Hosting-szolgáltató | Infrastruktúra | Az összes tárolt adathoz technikai hozzáférés (üzemeltetési szinten) |

**AI-asszisztens funkció:** a rendszerben elérhető AI-chat **helyben (a saját infrastruktúrán) futtatott** nyelvi modellt használ — **nem** küld adatot külső AI-szolgáltatóhoz (pl. OpenAI, Anthropic). Ez adatvédelmi szempontból kedvező, mert nincs harmadik országbeli adattovábbítás ezen a csatornán.

Új alfeldolgozó bevonása előtt az adatkezelőt (bérlő céget) a szerződésben (7. dokumentum) foglaltak szerint tájékoztatni kell.

## 4. Adattovábbítás harmadik országba

A rendszer jelenlegi felállásban **nem** továbbít adatot az Európai Gazdasági Térségen (EGT) kívülre — ezt minden új alfeldolgozó bevonásakor felül kell vizsgálni.

## 5. Érintetti jogok

Az érintett (pl. a bérlő cég dolgozója) az alábbi jogokkal élhet, amelyeket az adatkezelő (bérlő cég) felé kell gyakorolnia — az adatfeldolgozó (üzemeltető) az adatkezelő utasítására technikailag segíti ezek teljesítését:

- **Hozzáférés** — másolat kérése a róla tárolt adatokról;
- **Helyesbítés** — pontatlan adat javítása;
- **Törlés** ("elfeledtetéshez való jog") — ha nincs jogszabályi megőrzési kötelezettség, amely felülírja;
- **Adatkezelés korlátozása**;
- **Adathordozhatóság** — géppel olvasható formátumban való kiadás;
- **Tiltakozás** — különösen a jogos érdeken alapuló adatkezelés (pl. GPS-nyomkövetés) ellen.

## 6. Adatvédelmi incidens

Ld. Incidenskezelési folyamat (4. dokumentum), 6. pont — a 72 órás NAIH-bejelentési kötelezettség és az érintetti tájékoztatás szabályai ott részletesek.

## 7. Adatkezelési tájékoztató — vázlat a bérlő cégek számára

Ez a rész sablonként szolgál, amelyet **minden bérlő cégnek saját magára szabva** kell közzétennie a saját dolgozói felé (az adatkezelő a bérlő cég, nem az üzemeltető):

1. Az adatkezelő (bérlő cég) neve, elérhetősége.
2. Az adatfeldolgozó (jelen rendszer üzemeltetője, [Cégnév]) megnevezése.
3. A 2. pontban felsorolt adatkategóriák, célok, jogalapok, megőrzési idők — a bérlő cég saját gyakorlatára szabva.
4. Az 5. pontban felsorolt érintetti jogok és gyakorlásuk módja (kihez kell fordulni).
5. Panasz benyújtásának joga a NAIH-nál.

## Verziótörténet

| Verzió | Dátum | Módosítás | Jóváhagyta |
|---|---|---|---|
| 1.0 | [dátum] | Első kiadás | |
