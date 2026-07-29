# Változáskezelési (release) folyamat

**Rendszer:** KK Nyilvántartó
**Verzió:** 1.0 | **Hatályba lépés:** [dátum] | **Felülvizsgálat:** évente

## 1. Cél

A szoftverbe kerülő módosítások (funkció, hibajavítás, konfigurációváltozás) kontrollált, visszakövethető és a lehető legkisebb kockázattal járó bevezetése, elkerülve a nem szándékolt regressziókat és az éles adatot érintő véletlen károkat.

## 2. Verziókezelési (git) rend

- A forráskód Git-tel verziózott, a **`main` ág védett**: közvetlen push `main`-re nem megengedett, minden módosítás **feature branch-en** készül.
- A branch elnevezése tükrözi a jellegét, pl. `feature/...`, `fix/...`.
- A `main`-be kerülés előtt a módosítást legalább az egyik munkatársnak át kell néznie (kétfős csapatnál keresztellenőrzés, ha az időbeosztás engedi; ha nem, önellenőrzés az alábbi checklist alapján — 4. pont).
- Commit üzenetek röviden, érdemben írják le a **miértet**, nem csak a mit.

## 3. Frontend build kötelezettsége

Minden `.tsx`/`.ts`/CSS-módosítás után **kötelező** `npm run build` futtatása, mielőtt a változás deployra kerül — a Vite hash-alapú fájlnevezése miatt egy el nem futtatott build stale (elavult) JavaScript-bundle-t hagy éles környezetben, ami a felhasználóknak régi, hibás viselkedést mutat annak ellenére, hogy a forráskód már javítva van.

## 4. Kiadás előtti ellenőrzőlista (checklist)

- [ ] A módosítás lokálisan tesztelve (érintett funkció manuálisan kipróbálva)
- [ ] Frontend esetén: `npm run build` lefutott, hibamentes
- [ ] Backend migráció esetén: a migráció **landlord** és/vagy **tenant** kontextusban is helyesen lefut-e (ld. 5. pont)
- [ ] Ha a módosítás éles adatbázist érint (adatmigráció, tömeges módosító script): **előtte kötelező biztonsági mentés** (ld. Biztonsági mentési eljárás)
- [ ] Nincs a commitban kikerülő titkos adat (jelszó, API-kulcs, `.env` tartalom)
- [ ] A változás rövid leírása bekerül a változásnaplóba (5. pont)

## 5. Adatbázis-migrációk (landlord + tenant)

A rendszer két migrációs kört kezel:
- **landlord migrációk** — a fő adatbázisra (bérlők listája, üzemeltetői fiókok) vonatkoznak, egyszer futnak le;
- **tenant migrációk** — **minden egyes bérlő** saját, önálló adatbázisára külön-külön le kell, hogy fussanak (a rendszer erre dedikált parancsot biztosít, amely végigmegy az összes aktív béreln).

Új tenant-migráció bevezetésekor ellenőrizni kell, hogy az **összes** éles bérlő adatbázisán sikeresen lefutott-e — egy kimaradt bérlő eltérő séma-állapotban maradhat, ami futásidejű hibához vezet.

## 6. Deploy folyamat

1. A `main` ágra kerülő módosítás automatikusan build- és deploy-folyamatot indít a hosting platformon (GitHub-integráción keresztül).
2. Deploy után **kötelező** egy rövid füstteszt (smoke test): bejelentkezés, a módosítással érintett funkció manuális kipróbálása éles környezetben.
3. Ha a füstteszt hibát mutat: azonnali rollback (7. pont).

## 7. Rollback (visszaállási) terv

- **Kódszintű probléma:** a hibás commit visszavonása (`git revert`) és új deploy — nem a git history felülírása.
- **Adatbázis-szintű probléma:** helyreállítás a legutóbbi biztonsági mentésből, a Biztonsági mentési eljárásban leírt módon.
- Minden rollback esetet az incidensnaplóban is rögzíteni kell, ha a hiba éles felhasználót érintett.

## 8. Ismert korlát: nincs elkülönített staging környezet

> **Őszinte státusz:** jelenleg nincs a produkciótól elkülönített teszt/staging környezet — a fejlesztés lokálisan, majd közvetlenül éles (`main` → production) módon történik. Ez a kockázat a checklist-tel (4. pont) és a kötelező kiadás előtti manuális teszteléssel van jelenleg mérsékelve. **Fejlesztési terv:** külön staging környezet bevezetése, amint a csapat/erőforrás lehetővé teszi.

## 9. Változásnapló

Minden érdemi kiadást (funkció, jelentősebb javítás) rögzíteni kell egy változásnaplóban: dátum, rövid leírás, érintett komponens. A git commit-history ennek technikai alapja, de ügyfél felé kommunikálható, tömör összefoglaló is ajánlott jelentősebb változásoknál.

## Verziótörténet

| Verzió | Dátum | Módosítás | Jóváhagyta |
|---|---|---|---|
| 1.0 | [dátum] | Első kiadás | |
