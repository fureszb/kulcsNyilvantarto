# Biztonsági vezető (security_lead) &ndash; értékesítési csomag

> **Pozicionálás:** ő a bevezetés operatív sikerének kulcsa. Nem költségvetési döntéshozó,
> de **vétójoga van a gyakorlatban**: ha ő nem használja, a rendszer halott. Az érv nem
> stratégiai, hanem nagyon konkrét: az éjszakai pótlás-keresés és a hónapvégi adatgyűjtés.

---

## Tárgymező-variációk

1. `Hajnali kettőkor kiesik egy 24 órás &ndash; a rendszer megnevezi, kit hívjon`
2. `A múlt havi beosztásod Excelből &ndash; 1 importtal, hogy valós adaton lásd`
3. `Demó utáni pontosítás: mit lát pontosan a biztonsági vezetői jogkör`

---

## E-mail &ndash; fő változat

**Tárgy:** Hajnali kettőkor kiesik egy 24 órás &ndash; a rendszer megnevezi, kit hívjon

Szia [Név]!

A demón sok modul szóba került, de utólag azt gondolom, hogy a te pozíciódból két
dolog számít igazán. Ezt a kettőt írom le, a többit hagyjuk.

**1. A pótlás-keresés.** Ma ez így megy: kiesik egy 24 órás szolgálat, kinyitod az
Excelt, végiggondolod, ki pihent eleget, és jön 8&ndash;15 telefon &ndash; jellemzően
éjszaka, a saját szabadidődben.

A rendszer ugyanezt a logikát futtatja le, csak azonnal. A kieső 24 órát két 12 órás
blokkra bontja, és megnevezi a természetes jelöltet: **éjszakára** azt, aki előző nap
már 24 órás szolgálatban volt (logikusan folytatja), **nappalra** azt, aki két nappal
korábban dolgozott 24 órát, de előző nap már nem (kipihente magát). Mellettük felkínálja
az aznap szabad kollégákat is, alacsonyabb prioritással. A kijelölés egy kattintás,
és minden művelet naplózódik &ndash; ki, mikor, kit jelölt ki vagy vont vissza.
Ez a napló nem adminisztráció: ez a védelmed, amikor később valaki megkérdőjelezi a döntést.

**2. A "ki van bent" kérdés.** Ez ma két telefonból és egy Excel-nézésből áll össze, és
még akkor sem biztos. A rendszer élő nézete azért megbízható, mert **nem az NFC-önbejelentésből
dolgozik, hanem a Vezénylés aznapi beosztásából** &ndash; tehát akkor is helyes, ha valaki
történetesen nem scannelt. Emellé odateszi az élő GPS-pozíciót és a zóna-státuszt.
A nézet automatikusan a te irodaházaidra szűkül, nem kell szűrögetni.

**Amit még érdemes tudni a jogkörödről:** a saját irodaházaidban kezelheted a
kulcs-/kártyatételeket és a tétel-csoportokat, hozzárendelheted a dolgozókat és az
ingatlankezelőt, szerkesztheted a beosztást óraszámmal együtt, és kiküldheted a
vizsga-emlékeztetőket. Jegyzőkönyvet nem hozol létre (az dolgozói jogkör), de a
csapatodét látod és jóváhagyhatod.

**A javaslatom nem demó.** Küldd át a múlt havi beosztási táblázatodat &ndash; egy
lépésben beimportáljuk, a területek és a dolgozók automatikusan létrejönnek. Utána a
következő valós kiesésnél megnézzük egyszerre, kit ajánl a rendszer, és kit hívtál volna te.
**Ha nem egyezik, az nekem fontosabb információ, mint ha egyezik** &ndash; mert akkor
van mit igazítani a logikán.

45 perc közös beállítás, és a múlt havi Excel. Ennyi kell hozzá. Mikor jó?

Üdv,
[Név]

---

## Követő e-mail (+4 nap)

**Tárgy:** Re: a pótlás-keresés &ndash; egy kérdés, nem újabb anyag

Szia [Név]!

Nem küldök több anyagot. Egy kérdésem van:

**Az elmúlt hónapban hányszor hívtak fel munkaidőn kívül egy kiesés miatt?**

Ha kettőnél többször, akkor pontosan tudod, mennyit ér az, hogy a rendszer megnevezi
a jelöltet és egy kattintással kijelölöd. Ha nulla, akkor nálad ez nem probléma,
és nem erről kellene beszélnünk &ndash; mondd meg, mi az, ami helyette elviszi a heted.

Üdv,
[Név]

---

## Kifogáskezelési útmutató

| Amit mond | Ami mögötte van | Ahogy érdemes válaszolni |
|---|---|---|
| "Nekem az Excel jó, ismerem." | Kontroll-elvesztéstől való félelem, nem az Excel szeretete. | "Nem is akarom elvenni. Az Excel-importtal a jelenlegi táblázatod egy lépésben bekerül, ugyanúgy nézel rá, ugyanúgy szerkeszted. A különbség csak annyi, hogy a kiesésnél nem neked kell fejben tartani, ki pihent eleget &ndash; és hogy a dolgozó a saját sorába maga írja be, hogy nem ér rá." |
| "Az embereim nem fogják használni." | Valós bevezetési tapasztalat, gyakran jogos. | "A legtöbb funkció náluk rövidebb műveletet jelent, nem hosszabbat: NFC-scan 3 másodperc a bejárási lap helyett. De ne higgy nekem: az első hétben párhuzamosan megy a papír, és utána te döntesz. Ha nem használják, ez a bevezetés megbukott, és ezt vállalom." |
| "Nem akarok még egy rendszert, amit karban kell tartani." | Adminisztratív terheltség. | "A karbantartás nagy része az adminisztrátoré. Neked annyi jut, hogy a saját irodaházaidban felveszed az új kulcsot bérlőváltáskor &ndash; amit ma úgyis megcsinálsz, csak papíron, és utána még szólnod is kell valakinek." |
| "A GPS-től az embereim be fognak parázni." | Emberkezelési probléma, nem technikai. | "Jogos, és ezt nekik előre el kell mondani: a rendszer zóna-be- és kilépést rögzít, nem útvonalat, csak szolgálati időben, és 3 egymást követő jelzés után riaszt, hogy ne legyen téves riasztás. Adok hozzá egy kész munkatársi tájékoztatót, amit kiküldhetsz &ndash; ne neked kelljen megfogalmazni." |
| "Ez nekem nem hoz semmit, a cégnek hoz." | Motivációs hiány &ndash; a legveszélyesebb kifogás. | "Két dolgot hoz neked konkrétan. Az egyik: nem hívnak fel éjjel. A másik: a teljesítmény-pontszámodat ma a felettesed benyomása alakítja, ezután pedig az oktatottsági szint és a fluktuáció &ndash; olyan mutatók, amiket te tudsz javítani, és amiket a rendszer melletted dokumentál." |
| "Mikor van erre időm?" | Kapacitáshiány, valós. | "45 perc a beállítás, és a múlt havi Excel. Nem kérek mást. Ha egy hónap múlva nem spórolt annyi időt, mint amennyit elvitt, kiszállunk." |

---

## Beszélgetés-nyitók

- "Az elmúlt hónapban hány kiesés volt, és összesen mennyi telefont jelentett?"
- "Ha az ügyfeled most felhív, hogy ki van bent a 3-as épületben &ndash; mennyi idő alatt tudsz biztosat mondani?"
- "Hónap végén hány órát viszel el azzal, hogy a jelentéseket összeszeded a helyszínekről?"
- "Volt már olyan, hogy egy pótlás-döntést utólag megkérdőjeleztek, és nem tudtad rekonstruálni, mi alapján döntöttél?"
