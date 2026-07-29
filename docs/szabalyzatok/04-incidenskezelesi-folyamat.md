# Incidenskezelési folyamat

**Rendszer:** KK Nyilvántartó
**Verzió:** 1.0 | **Hatályba lépés:** [dátum] | **Felülvizsgálat:** évente, illetve minden incidens után

## 1. Cél

Meghatározza, hogyan kell észlelni, osztályozni, kezelni és lezárni a KK Nyilvántartó rendszert érintő biztonsági és üzemeltetési incidenseket — beleértve az adatvédelmi (GDPR) incidenseket is.

## 2. Incidens fogalma

Incidensnek minősül minden esemény, amely ténylegesen vagy potenciálisan sérti az adatok bizalmasságát, sértetlenségét vagy a rendszer rendelkezésre állását. Ide tartozik például:
- jogosulatlan hozzáférés vagy annak gyanúja (fiókfeltörés, szokatlan bejelentkezési minta);
- adatvédelmi incidens (személyes adat — pl. GPS-pozíció, NFC-napló, aláírás — jogosulatlan nyilvánosságra kerülése, elvesztése, sérülése);
- szolgáltatáskimaradás (a rendszer nem elérhető);
- adatvesztés vagy adatsérülés;
- rosszindulatú kód vagy behatolási kísérlet észlelése;
- hibás deploy, amely éles adatot veszélyeztet.

## 3. Bejelentés

Kétfős csapatnál nincs külön ügyeleti diszpécser — az alábbi egyszerű szabály érvényes:
- Bármelyik munkatárs vagy a bérlő cég bármely admin jogosultságú felhasználója **azonnal** jelzi a másik munkatársnak (telefon/azonnali üzenet — e-mail nem elég sürgős csatorna kritikus esetben).
- A bejelentést rögzíteni kell (időpont, bejelentő, rövid leírás) az incidensnaplóban.

## 4. Osztályozás és reakcióidő

| Súlyosság | Példa | Első reakció | Cél: elhárítás |
|---|---|---|---|
| **Kritikus** | Adatvédelmi incidens, teljes szolgáltatáskiesés, aktív jogosulatlan hozzáférés | 1 órán belül | 24 órán belül |
| **Magas** | Egy bérlő szolgáltatása nem elérhető, gyanús, de meg nem erősített hozzáférés | 4 órán belül | 48 órán belül |
| **Közepes** | Részleges funkciózavar, nem kritikus hiba | 1 munkanapon belül | 5 munkanapon belül |
| **Alacsony** | Kozmetikai hiba, nem biztonsági jellegű | következő release | — |

## 5. Kezelési folyamat

1. **Észlelés** — automatikus riasztás, felhasználói jelzés vagy belső ellenőrzés.
2. **Elszigetelés** — a további kár megelőzése (pl. érintett fiók letiltása, sebezhető funkció ideiglenes kikapcsolása).
3. **Kivizsgálás** — mi történt, mely bérlő(ke)t, mely adatokat érint, mi az elsődleges ok.
4. **Elhárítás** — a technikai probléma megoldása (javítás, patch, konfigurációs korrekció).
5. **Helyreállítás** — érintett adat/szolgáltatás visszaállítása (ld. Biztonsági mentési eljárás, ha adatvesztésről van szó).
6. **Utólagos elemzés (post-mortem)** — mi történt, miért, mit kell változtatni a folyamaton/kódon/szabályzaton, hogy ne ismétlődjön.
7. **Lezárás és dokumentálás** — az incidensnapló lezárása, tanulságok beépítése a szabályzatokba.

## 6. GDPR-specifikus teendők adatvédelmi incidens esetén

Ha az incidens személyes adatot érint (pl. GPS-pozíció, NFC-napló, dolgozói adat, aláírás):

1. **72 órás bejelentési kötelezettség** a Nemzeti Adatvédelmi és Információszabadság Hatóság (NAIH) felé, a tudomásszerzéstől számítva — kivéve, ha az incidens valószínűsíthetően nem jár kockázattal az érintettek jogaira nézve.
2. Az **adatkezelő** (az érintett bérlő/ügyfél cég) haladéktalan tájékoztatása — az üzemeltető mint adatfeldolgozó köteles indokolatlan késedelem nélkül jelezni az adatkezelő felé (ld. Adatfeldolgozási szerződésminta, 11. pont).
3. Ha az incidens valószínűsíthetően magas kockázatot jelent az érintett természetes személyekre (pl. dolgozók GPS-mozgásának kiszivárgása), az **érintetteket is** tájékoztatni kell, indokolatlan késedelem nélkül.
4. Minden adatvédelmi incidenst — a be nem jelentetteket is — nyilván kell tartani (mikor történt, mi történt, milyen döntés született a bejelentésről és miért).

## 7. Ügyfél-kommunikáció

- Kritikus/magas súlyosságú incidens esetén az érintett bérlő cég adminját a lehető leghamarabb, de legkésőbb az észleléstől számított 24 órán belül tájékoztatni kell: mi történt, mely adatokat érinti, milyen intézkedés történt/történik.
- A kommunikációnak ténybelinek és világosnak kell lennie — nem szabad elbagatellizálni vagy elhallgatni a tényeket.

## 8. Incidensnapló (minimális tartalom)

| Mező | Leírás |
|---|---|
| Azonosító, dátum/idő | Bejelentés időpontja |
| Bejelentő | Ki jelezte |
| Súlyosság | Kritikus/Magas/Közepes/Alacsony |
| Érintett bérlő(k) | Melyik ügyfél(ek) adatai érintettek |
| Leírás | Mi történt |
| Megtett intézkedések | Elszigetelés, elhárítás lépései |
| Lezárás dátuma | |
| Utólagos elemzés | Ok, tanulság, megelőző intézkedés |
| GDPR-bejelentés szükséges volt-e | Igen/Nem + indoklás |

## Verziótörténet

| Verzió | Dátum | Módosítás | Jóváhagyta |
|---|---|---|---|
| 1.0 | [dátum] | Első kiadás | |
