# Biztonsági mentési eljárás

**Rendszer:** KK Nyilvántartó
**Verzió:** 1.0 | **Hatályba lépés:** [dátum] | **Felülvizsgálat:** évente

## 1. Cél és hatály

Az eljárás célja, hogy adatvesztés (hardverhiba, emberi hiba, támadás, hibás migráció vagy hibás adatmódosítás) esetén a rendszer és az ügyfelek adatai visszaállíthatók legyenek, meghatározott, elfogadható adatvesztési és helyreállítási időn belül.

**Mentés tárgya:**
- minden bérlő (tenant) önálló adatbázisa (kulcs/kártya nyilvántartás, NFC-naplók, GPS-pozíciók, dokumentumok, vezénylés stb.);
- a fő (landlord) adatbázis (bérlők listája, üzemeltetői fiókok);
- a feltöltött állományok (dokumentum-mellékletek, telephely-logók) — **kivéve** a digitális aláírás ideiglenes állományait, amelyek szándékosan, biztonsági okból nem kerülnek tartós mentésre.

## 2. Jelenlegi állapot és célállapot

> **Fontos, őszinte státusz:** a mentési eljárás bevezetése e dokumentum hatálybalépésével **most történik meg** — korábban nem volt automatizált, rendszeres biztonsági mentés. A dokumentum egyúttal a bevezetendő rend specifikációja is.

| | Jelenlegi | Célállapot |
|---|---|---|
| Mentés módja | eseti, kézi (fájlmásolat kritikus műveletek előtt) | automatizált, ütemezett |
| Gyakoriság | ad-hoc | napi |
| Tárolási hely | ugyanazon a gépen/szerveren | a produkciós szervertől **fizikailag/logikailag különálló** tárhely |
| Visszaállítási teszt | nem dokumentált | negyedéves, dokumentált |

## 3. Mentési célok (RPO / RTO)

| Mutató | Cél |
|---|---|
| **RPO** (Recovery Point Objective — max. elfogadható adatvesztés) | 24 óra |
| **RTO** (Recovery Time Objective — max. helyreállítási idő) | 8 munkaóra |

## 4. Mentési rend

1. **Gyakoriság:** minden bérlő adatbázisáról és a landlord adatbázisról **naponta egy** automatikus mentés készül (ütemezett feladatként).
2. **Kritikus művelet előtti eseti mentés:** minden éles adatbázist érintő manuális beavatkozás (migráció, tömeges adatmódosítás, adatimport) előtt **kötelező** egy azonnali, eseti mentés készítése — a beavatkozást végző felelőssége.
3. **Tárolás helye:** a mentések a produkciós szervertől elkülönült tárhelyen (pl. külön tárolási szolgáltatás vagy külön gép) tárolandók, hogy egy szerverszintű meghibásodás (lemezhiba, tűz, jogosulatlan hozzáférés) ne semmisítse meg egyszerre az éles adatot és a mentést is.
4. **Megőrzési idő (retenció):**
   - napi mentések: 30 napig;
   - havi mentések (minden hónap első napi mentése kiemelve): 12 hónapig.
5. **Hozzáférés a mentésekhez:** kizárólag a rendszergazda/biztonsági felelős munkatárs férhet hozzá.
6. **Titkosítás:** a mentési állományok tárolás közben titkosítva tartandók, mivel személyes és helyadatokat (GPS-pozíció) is tartalmaznak.

## 5. Visszaállítási teszt

- **Gyakoriság:** negyedévente egy próba-visszaállítás egy elkülönített (nem éles) környezetben.
- **Dokumentálás:** minden teszt dátuma, eredménye (sikeres/sikertelen, mennyi idő alatt) és az esetleges hibák rögzítendők egy visszaállítási naplóban.
- Sikertelen teszt esetén az eljárást soron kívül felül kell vizsgálni.

## 6. Vészhelyzeti helyreállítás menete

1. Az incidens észlelése és besorolása (ld. Incidenskezelési folyamat).
2. A legutóbbi érvényes mentés azonosítása.
3. Visszaállítás elkülönített környezetben, integritás-ellenőrzés.
4. Csak sikeres ellenőrzés után kerül éles környezetbe.
5. Az érintett ügyfél(ek) tájékoztatása a kiesés jellegéről és a visszaállított állapot időpontjáról (meddig mehet vissza az adat).
6. Utólagos elemzés és a jelen eljárás szükség szerinti finomítása.

## Verziótörténet

| Verzió | Dátum | Módosítás | Jóváhagyta |
|---|---|---|---|
| 1.0 | [dátum] | Első kiadás — automatizált mentés bevezetése | |
