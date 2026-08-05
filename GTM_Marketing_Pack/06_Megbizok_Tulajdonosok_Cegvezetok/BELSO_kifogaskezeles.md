> # BELSŐ ANYAG &ndash; ÜGYFÉLNEK NEM TOVÁBBÍTHATÓ
>
> Ez a fájl a másik fél feltételezett motivációit és félelmeit elemzi. Ha ügyfél
> kezébe kerül, az a kapcsolatot rontja. Az ügyfélnek küldhető tartalom az
> `email_es_outreach.md` fájlban van &ndash; kizárólag azt szabad továbbítani.

## Kifogáskezelési útmutató

| Amit mond | Ami mögötte van | Ahogy érdemes válaszolni |
|---|---|---|
| "120 000 Ft helyszínenként &ndash; ez drága." | Nincs viszonyítási pontja. | Sose az árat védjük, mindig a viszonyt adjuk meg. "Egy 24/7-es poszt havi 730 óra, 2 400 Ft-os óradíjjal 1,75 MFt árbevétel. A díj ennek 6,8%-a. A kérdés nem az, hogy 120 000 sok-e, hanem hogy megéri-e 6,8%-ot arra fordítani, hogy a teljesítés bizonyítható legyen. Ha egy évben egyszer sem kerül szóba a bizonyítás, akkor nem éri meg &ndash; és ezt őszintén megmondom." |
| "Az ügyfél ezt nem fogja kifizetni." | Árérvényesítési kockázat &ndash; a legerősebb valós kifogás. | "Két válaszom van. Az egyik: ne az ügyfélre terhelje, hanem tenderen használja differenciátorként &ndash; ott nem áremelés, hanem versenyelőny. A másik: ha ma az ügyfele az óradíjat alkudja, az azért van, mert a szolgáltatás megkülönböztethetetlen. Egy időbélyeges bejárás-lista pont ezt oldja fel. De ha az ügyfélkörében ez nem működik, mondja meg &ndash; akkor a modell csak a kockázati oldalon áll meg, és azt kell megnéznünk." |
| "Van már diszpécser rendszerünk / járőrellenőrző óránk." | Redundancia. | "A járőróra azt rögzíti, hogy egy eszközt hozzáérintettek egy ponthoz &ndash; utólag, kiolvasás után. Itt a beolvasás valós időben, névhez kötve érkezik, azonnal látja a megbízó is, és ugyanaz a rendszer kezeli a jegyzőkönyvet, a beosztást, a pótlást és a teljesítménymutatót. A kérdés nem az, hogy a járőróra rossz-e, hanem hogy hány külön rendszert akar üzemeltetni ugyanarra a folyamatra." |
| "Fejlesztünk mi is ilyet belsőleg." | Build-vs-buy, gyakran presztízskérdés. | Ne vitatkozzunk a képességgel. "Meg lehet csinálni. Amit érdemes előre végigszámolni: ez tíz jegyzőkönyv-típus jogilag helyes űrlaplogikával, aláírás-kezelés PDF-beágyazással és törlési szabállyal, multi-tenant adatszeparáció, offline szinkronizációs sor idempotenciával, WebSocket-broadcast, geofence-poligon jitter-védelemmel és pótlás-ajánló algoritmus. Nem a felület a munka. Ha a saját fejlesztés mellett dönt, ezt a listát adom át kiindulásnak &ndash; ingyen." |
| "Most nincs rá keret." | Időzítési kifogás, gyakran udvarias nem. | "Értem. Akkor ne éves szerződésről beszéljünk. A 3 helyszínes, 60 napos pilot előre rögzített kilépési ponttal megy &ndash; a 60. napon a mért számok alapján dönt, és ha nemmel, akkor ott véget ér. Ez nem keretkérdés, hanem két hónap." |
| "Az embereim nem fogják használni." | Bevezetési kockázat, jogos. | "Ez a legnagyobb kockázat, és nem tagadom. Ezért csináltunk külön anyagot az őröknek és külön a biztonsági vezetőknek &ndash; mindkettőben az ő nyereségük szerepel, nem az Öné. A pilot sikerkritériumai közé pedig felvesszük a tényleges használati arányt. Ha az nincs meg, a pilot bukott, és ezt a 60. napon kimondjuk." |
| "Mi történik az adatainkkal, ha megszűnik a szolgáltatás?" | Vendor lock-in, jogos. | "Minden cég adata külön, elkülönített adatbázisban van. Az ellenőrzési előzmények CSV-be exportálhatók, a jegyzőkönyvek PDF-ként letölthetők. A kilépési feltételeket a szerződésben rögzítsük &ndash; ezt én is így kérném." |

---

## Beszélgetés-nyitók

- "Az utóbbi két évben volt olyan szerződése, ahol díjkorrekciót kellett elfogadnia, mert nem tudta bizonyítani a teljesítést?"
- "Amikor tenderen indul, mi az a három mondat, amivel az árán felül érvel? És ebből mennyi az, amit a versenytárs is elmond?"
- "Ha holnap egy megbízója kárigénnyel áll elő egy három hete történt eseményre, mennyi idő alatt tud dokumentumot letenni az asztalra, és milyet?"
- "Hány helyszínt felügyel ma egy biztonsági vezetője? Mennyivel többet felügyelhetne, ha a beosztás és a riportgyűjtés nem vinné el a heti nyolc óráját?"

---

## Ajánlati struktúra &ndash; javasolt csomagolás

| Elem | Tartalom | Megjegyzés |
|---|---|---|
| **Pilot (60 nap)** | 3 helyszín, teljes funkcionalitás, beállítás + adatmigráció + oktatás | Előre rögzített sikerkritériumokkal és kilépési ponttal |
| **Listás díj** | 120 000 Ft / helyszín / hó | Az elszámolási egység a helyszín (lépcsőház/épület), nem a felhasználó |
| **Volumen-sáv** | 10+ / 25+ / 50+ helyszín | Sávos kedvezmény &ndash; a helyszínszám a skálázás természetes mértéke |
| **Bevezetés** | Excel-beosztás import, kulcs-/kártyaleltár migráció, NFC-matrica kihelyezés | Helyszínenként 6&ndash;12 checkpont |
| **Adatkiléptetés** | CSV-export (ellenőrzések), PDF-letöltés (jegyzőkönyvek) | Szerződésben rögzítendő &ndash; a lock-in kifogás előre kezelése |
