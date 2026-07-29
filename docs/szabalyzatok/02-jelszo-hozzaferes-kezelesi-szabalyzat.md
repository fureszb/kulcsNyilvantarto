# Jelszó- és hozzáférés-kezelési szabályzat

**Rendszer:** KK Nyilvántartó
**Verzió:** 1.0 | **Hatályba lépés:** [dátum] | **Felülvizsgálat:** évente

## 1. Hatály

A szabályzat az alábbi fiók- és hozzáférés-típusokra vonatkozik:
- **Landlord admin fiókok** (a rendszer üzemeltetőinek saját belépése — a legmagasabb jogosultsági szint, az összes bérlő adatához hozzáférést biztosít a felügyeleti felületen keresztül);
- **Bérlői (tenant) felhasználói fiókok** — az ügyfél cégek dolgozóinak, vezetőinek belépései;
- **API-hozzáférési tokenek** (Sanctum) — a mobilalkalmazás hitelesítéséhez.

## 2. Jogosultsági szintek (szerepkörök)

| Szerepkör | Jogosultság |
|---|---|
| `admin` | Teljes hozzáférés az adott bérlő minden adatához és beállításához |
| `area_director` (területi igazgató) | Admin-szintű jog, több telephely felügyelete |
| `security_lead` (biztonsági vezető) | PM-szintű felügyeleti jog, kijelölt telephelyekre |
| `property_manager` | Adott telephely felügyelete, dokumentumok megtekintése |
| `user` (dolgozó) | Napi működéshez szükséges funkciók, saját dokumentumok rögzítése |

**Elv:** legkevesebb szükséges jogosultság (*least privilege*) — minden fiók a feladatköréhez ténylegesen szükséges legalacsonyabb szerepkört kapja.

## 3. Jelszó-követelmények

| Elvárás | Érték |
|---|---|
| Minimális hossz | 8 karakter |
| Ajánlott összetettség | kis- és nagybetű, szám, lehetőleg speciális karakter keveréke |
| Tiltott gyakorlat | születési dátum, név, e-mail-cím részlete, "jelszo123" típusú minta |
| Csere gyakorisága | nem kötelező időszakosan, de **azonnal kötelező** gyanús esemény vagy incidens után |
| Fiókonkénti egyediség | tilos ugyanazt a jelszót több fiókon (pl. landlord admin és saját e-mail) újrahasználni |

> **Technikai megjegyzés:** jelenleg a bejelentkezési jelszómezőn nincs technikailag kikényszerített minimumhossz-ellenőrzés (csak a profil-jelszócserénél van `min:8` szabály). Ez a szabályzat előírja a hiányzó technikai validáció pótlását a regisztrációs/jelszó-visszaállítási folyamatokban is.

## 4. Fiók életciklus

### 4.1 Létrehozás
Új felhasználói fiókot kizárólag admin jogosultságú személy hozhat létre, a ténylegesen szükséges szerepkörrel. A rendszer rögzíti a `employed_since` (munkaviszony kezdete) mezőt.

### 4.2 Módosítás
Szerepkör-emelést (pl. `user` → `security_lead`) csak a bérlő cég admin jogosultságú képviselőjének kérésére, dokumentáltan szabad végrehajtani.

### 4.3 Deaktiválás / kilépés
Amint egy dolgozó munkaviszonya megszűnik:
1. A fiókot **azonnal** inaktívvá kell tenni (`is_active = false`, `left_at` mező kitöltése) — legkésőbb a kilépés napján.
2. Az érintett NFC-hozzáféréseket vissza kell vonni.
3. Az esetleges API-tokeneket (mobilalkalmazás) vissza kell vonni.

A felelősség a bérlő cég adminjáé a jelzésért, az üzemeltetőé a technikai végrehajtás lehetőségének biztosításáért.

## 5. Landlord admin fiókok fokozott védelme

A landlord admin fiókok (üzemeltetői szuperfelhasználók) kompromittálódása az **összes** ügyfél adatát veszélyezteti, ezért ezekre szigorúbb szabály vonatkozik:
- Kizárólag a 2 üzemeltető munkatárs rendelkezhet ilyen fiókkal.
- Jelszavuk egyedi, máshol nem használt, legalább 12 karakteres.
- **Fejlesztési terv:** többfaktoros hitelesítés (MFA) bevezetése ezekre a fiókokra — amíg ez nincs implementálva, ez a szabályzat rögzíti mint kockázatot, és előírja a jelszó legalább félévenkénti cseréjét.
- Landlord admin fiókkal napi munkavégzés (pl. tenant-szintű feladatok) helyett lehetőség szerint a saját tenant-fiókot kell használni.

## 6. API-tokenek (Sanctum, mobilalkalmazás)

- A token kizárólag sikeres bejelentkezés után generálódik, a felhasználó jelszavának ellenőrzését követően.
- Eszközcsere vagy -elvesztés esetén a régi token visszavonása kötelező.
- A tokeneket nem szabad naplóba vagy hibajelentésbe kiírni.

## 7. Jelszó-visszaállítás

A jelszó-visszaállítás e-mailben kiküldött, egyszer használatos linken keresztül történik. A linknek időkorláttal kell rendelkeznie, és felhasználás után érvénytelenítendő.

## 8. Ellenőrzés

A hozzáférési jogosultságokat évente, illetve minden nagyobb szervezeti változás (pl. új security_lead kinevezése) után felül kell vizsgálni: van-e felesleges/elavult jogosultság, inaktív, de törlésre váró fiók.

## Verziótörténet

| Verzió | Dátum | Módosítás | Jóváhagyta |
|---|---|---|---|
| 1.0 | [dátum] | Első kiadás | |
