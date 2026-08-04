# Vagyonőr / Portás &ndash; belső bevezetési kommunikáció

> **Fontos megkülönböztetés:** ez a szerepkör nem vásárlói döntéshozó. Nem meggyőzni kell,
> hanem **elfogadtatni** &ndash; a bevezetés legnagyobb kockázata az operatív ellenállás.
> Az alábbi levél a megbízó/szolgáltató cég belső csatornáján megy ki (csoportvezető,
> objektumvezető vagy diszpécser aláírásával), nem értékesítői e-mailként.

---

## Tárgymező-variációk

1. `Változás a szolgálati adminisztrációban &ndash; ami neked kevesebb papírt jelent`
2. `A jövő héttől: átadás-átvétel, jegyzőkönyv és beosztás egy helyen, telefonon`
3. `Bejárás-igazolás NFC-vel &ndash; mit jelent ez a napi munkádban?`

---

## E-mail &ndash; fő változat

**Tárgy:** Változás a szolgálati adminisztrációban &ndash; ami neked kevesebb papírt jelent

Kedves Kollégák!

A következő hetekben bevezetünk egy rendszert, amivel az eddigi papíralapú
adminisztráció nagy része a telefonotokon fog elkészülni. Mielőtt bárki azt gondolná,
hogy ez plusz feladat: **pont az ellenkezője a cél.**

**Ahogy most megy.** Az átadás-átvételi füzetet kézzel vezetitek. Egy kárfelvételi
jegyzőkönyv 20&ndash;30 perc kézírás, aláírásokkal, másolással. A beosztást telefonon
egyeztetitek. És ha valaki utólag megkérdőjelezi, hogy a bejárás megtörtént-e,
nincs mit felmutatni.

**Ahogy ezután megy.** A kulcsellenőrzésnél a teljes tétellistát látjátok bérlő szerinti
csoportban, egyenként pipálva &ndash; a hiányzó tétel nem "kimarad", hanem megjegyzéssel
rögzül, és az értesítő e-mail automatikusan kimegy. A bejárást a checkpontra tett
NFC-matricához érintett telefonnal igazoljátok: három másodperc. A jegyzőkönyvet
űrlapon töltitek ki, az aláírásokat a képernyőn gyűjtitek be, a PDF magától elkészül.
A beosztásban a saját sorotokba beírhatjátok, hogy nem értek rá, hogy bizonytalan,
vagy hogy vállaltok túlórát.

**Amit előre tisztázni akarok, mert tudom, hogy felmerül:**

- A **GPS csak szolgálat alatt** fut, és a zóna elhagyását/visszatérését jelzi &ndash;
  nem az útvonalatokat követi. A GPS-pontatlanság miatti téves riasztás ellen a rendszer
  csak három egymást követő jelzés után lép.
- Az **aláírásképetek** a szerveren kizárólag a PDF elkészültéig létezik, utána
  véglegesen törlődik. Csak a kész dokumentumba ágyazva marad meg.
- **Térerő nélkül is működik:** a beolvasás eltárolódik és magától elmegy, amikor
  visszajön a kapcsolat &ndash; duplikáció nélkül.

A lényeg, amiért ezt csináljuk: **minden elvégzett munkátok névvel és időbélyeggel
rögzül.** Ha egy vitatott ügyben rátok mutatnak, ez a rendszer mellettetek szól.

A bevezetés első hetében a papírfüzetet párhuzamosan vezetjük, hogy senki ne maradjon
adat nélkül. Betanulás: egy kb. 20 perces oktatási modul a rendszerben.

Kérdéseket a szolgálatvezetőnek, vagy közvetlenül a beépített AI-asszisztensnek
tehettek fel &ndash; az a cég saját szabályzataiból válaszol.

Üdvözlettel,
[Név] &ndash; [Beosztás]

---

## Követő üzenet (+7 nap, bevezetés után)

**Tárgy:** Első hét a rendszerrel &ndash; mi az, ami nem működik jól?

Kedves Kollégák!

Egy hete megy az új adminisztráció. Két konkrét kérdésem van, és mindkettőre
egymondatos választ kérek:

1. Melyik művelet tart még mindig hosszabb ideig, mint papíron?
2. Van olyan helyszín vagy checkpont, ahol a beolvasás rendszeresen nem megy?

Az elsőt beállítás-kérdésként kezeljük, a másodikat matrica-cserével javítjuk.
Nem kell hosszan indokolni, elég egy mondat válaszban.

[Név]

---

## Kifogáskezelési útmutató (belső &ndash; szolgálatvezetőnek)

| Amit mondanak | Ami mögötte van | Ahogy érdemes válaszolni |
|---|---|---|
| "Ez megfigyelés, követnek minket." | Bizalmatlanság, félelem a fegyelmi következményektől. | "A rendszer nem útvonalat rögzít, hanem zóna-be- és kilépést, csak szolgálat alatt. Amit rögzít, az ugyanaz, amit eddig is le kellett írnod a füzetbe &ndash; csak most nem lehet elveszíteni és nem lehet rád fogni." |
| "Nem értek a telefonhoz." | Valós kompetencia-szorongás, gyakran idősebb kollégáknál. | Ne érveljünk: mutassuk meg. Egy NFC-scan és egy kulcsellenőrzés élőben, a saját telefonján, két perc alatt. Ez a kifogás demóval szűnik meg, magyarázattal nem. |
| "Több munka lesz, nem kevesebb." | Korábbi rossz tapasztalat bevezetett rendszerekkel. | Konkrét összehasonlítás: kárfelvételi jegyzőkönyv kézzel 20&ndash;30 perc + iktatás, űrlapon 6&ndash;8 perc + azonnali PDF. Ajánljuk fel, hogy az első héten párhuzamosan megy a papír &ndash; így maga méri le. |
| "Nincs térerő a garázsszinten / a lépcsőházban." | Jogos üzemeltetési aggály. | "Az offline sor pontosan erre készült: a beolvasás a telefonon vár, és magától elmegy, amikor visszajön a jel. Kétszer nem küldi el." |
| "Ha elromlik a telefon / lemerül, akkor mi van?" | Felelősségi kérdés. | Tisztázzuk előre az eljárásrendet: kiesés esetén a papíralapú vészforgatókönyv él, és a bejegyzés utólag pótolható. Ezt a szolgálati utasításban is rögzítsük. |
| "Miért kell nekem vizsgázni?" | Az oktatási modult ellenőrzésként éli meg. | "A vizsgaeredmény a te oldaladon is bizonyíték: dokumentálja, hogy megkaptad a felkészítést. Egy incidens utáni kivizsgálásnál ez téged véd." |

---

## Beszélgetés-nyitók (műszakértekezletre)

- "Volt olyan, hogy utólag kellett igazolnod, hogy megcsináltál valamit &ndash; és nem tudtad?"
- "Mennyi időt viszel el egy hónapban a papírmunka? Nem azt kérdezem, hány jegyzőkönyv, hanem hogy hány óra."
- "Ha holnap eltűnik egy kulcs, kinél kezdenék a keresést &ndash; és ki tudná bizonyítani, hogy nem nála van?"
