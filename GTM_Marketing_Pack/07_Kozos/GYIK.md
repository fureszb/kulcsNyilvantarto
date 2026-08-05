# Gyakori kérdések &ndash; szerepkör-független

Ezek a kérdések bármelyik szerepkörnél felmerülhetnek, ezért nem kerültek be
minden egyes lapba külön-külön. Itt egy helyen, egységes válasszal.

**Ez beléptető (kapu-/ajtó-)rendszer?**
Nem. A platform bejárás-igazoló (checkpoint) rendszer: azt rögzíti, hogy egy
őr a helyszínen elhelyezett NFC-matricát beolvasta-e, nem azt, hogy ki
léphet be egy ajtón. Ezt sosem szabad máshogy kommunikálni.

**Mi történik az adatokkal, ha megszűnik az előfizetés?**
Minden cég adata elkülönített, saját adatbázisban van. Az ellenőrzési
előzmények CSV-be exportálhatók, a jegyzőkönyvek PDF-ként letölthetők. A
kilépési feltételeket a szerződésben kell rögzíteni.

**Mennyi ideig tart a bevezetés?**
Helyszínenként 6&ndash;12 NFC-checkpont kihelyezése, a meglévő beosztás
Excel-importtal egy lépésben betölthető, a kulcs-/kártyaleltár migrálása
szükséges. Egy pilot helyszín tipikusan 45&ndash;60 perc közös beállítással
indítható.

**Mi történik, ha nincs térerő?**
A natív mobilalkalmazás offline-szinkronizációs sorral rendelkezik: az
NFC-bejárás és a GPS-jelentés a telefon belső tárolójában vár, egyedi
azonosítóval (nincs duplikáció), és automatikusan újraküldésre kerül, amint
helyreáll a kapcsolat.

**Hogyan kezeli a rendszer a személyes adatokat (aláírás, GPS)?**
Az aláírásképek fájlként kizárólag a PDF elkészültéig léteznek a szerveren,
utána véglegesen törlődnek &ndash; csak a kész dokumentumba ágyazva maradnak
meg. A GPS-helymeghatározás kizárólag szolgálati időben fut, és zóna-be- és
kilépést rögzít, nem folyamatos útvonalat.

**Van önkiszolgáló regisztráció vagy jelszó-visszaállítás?**
Nincs, ez tudatos döntés. Fiókot kizárólag a cég adminisztrátora vagy a
szoftver üzemeltetője hozhat létre, jelszót ők állíthatnak vissza.

**Hogyan van elkülönítve két cég adata egymástól?**
A rendszer több céget szolgál ki egyetlen szoftverpéldányból, de minden cég
saját, teljesen elkülönített adatbázisban tárolja az adatait. Egy céghez
tartozó felhasználó technikailag nem férhet hozzá másik cég oldalaihoz;
ilyen próbálkozás esetén a rendszer automatikusan kilépteti.

**Mi van, ha a natív push-értesítés (Android/iOS) nem működik?**
A natív mobil push csatorna technikailag elő van készítve, de éles
hitelesítő kulcsok hiányában jelenleg nem küld push-üzenetet. A böngésző
alapú (Web Push) csatorna éles és minden bejelentkezett felhasználónál
működik.

**Mennyibe kerül, ha több helyszínünk van?**
Az elszámolás helyszínenkénti (120 000 Ft/helyszín/hó), sávos kedvezmény
tárgyalható 10+, 25+, 50+ helyszín felett.
