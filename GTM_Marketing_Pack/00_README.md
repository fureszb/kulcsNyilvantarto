# GTM Marketing Pack &ndash; KulcsNyilvántartó Platform

Szerepkörönkénti értékesítési csomag. Minden mappa három fájlt tartalmaz:

- `email_es_outreach.md` &ndash; **ügyfélnek küldhető**: 3 tárgymező-variáció,
  fő e-mail (150&ndash;250 szó), követő e-mail.
- `BELSO_kifogaskezeles.md` &ndash; **ügyfélnek NEM továbbítható**: kifogáskezelési
  útmutató és beszélgetés-nyitók. A másik fél feltételezett motivációit elemzi;
  ha ügyfél kezébe kerül, a kapcsolatot rontja.
- `adatlap_szorolap.html` &ndash; A4-es, nyomdakész adatlap (CSS Paged Media, 12 mm margó).

A két markdown fájl szétválasztása a generátorban automatikus (`split_outreach`),
a `## Kifogáskezelési útmutató` címsornál vág. Új szerepkör felvételekor ezt a
címsort kell használni, különben a belső rész az ügyfélnek küldhető fájlban marad.

## Mappák

| Mappa | Szerepkör | Döntési pozíció |
|---|---|---|
| `00_Brand` | &ndash; | Arculati útmutató: színek, tipográfia, hangnem-szabályok |
| `01_Vagyonor_Portas` | Vagyonőr / portás | Végfelhasználó &ndash; elfogadás-tesztelés a döntés előtt |
| `02_Property_Manager` | Ingatlankezelő | Veto-jogú, nyomásgyakorló |
| `03_Biztonsagi_es_Teruleti_Vezeto` | Biztonsági vezető | Operatív kulcsszereplő |
| `04_Teruleti_Igazgato` | Területi igazgató | Stratégiai / részben költségvetési |
| `05_Irodahazi_Berlok` | Irodaházi bérlő | Kereslet-igazoló, elfogadó |
| `06_Megbizok_Tulajdonosok_Cegvezetok` | Megbízó / tulajdonos | **Fizető döntéshozó** |
| `07_Kozos` | &ndash; | Szerepkör-független segédanyag: ROI-módszertan, GYIK, összehasonlító táblázat |

## PDF-generálás

WeasyPrint (ajánlott, a CSS erre van optimalizálva):

```
pip install weasyprint
python generate_gtm_pack.py --pdf
```

Vagy egyenként:

```
weasyprint GTM_Marketing_Pack/06_Megbizok_Tulajdonosok_Cegvezetok/adatlap_szorolap.html adatlap.pdf
```

Böngészőből: a HTML megnyitása után Ctrl+P &rarr; A4 &rarr; margó: alapértelmezett,
"Háttérgrafika" bekapcsolva.

## Arculat és hangnem

A teljes szín-, tipográfia- és hangnem-szabálykönyv a
[`00_Brand/arculati_utmutato.md`](00_Brand/arculati_utmutato.md) fájlban van.
Új szöveg vagy szerepkör felvétele előtt azt kell elolvasni, nem a meglévő
lapokból visszafejteni a konvenciót.

## Fontos

**A rendszer még nincs bevezetve sehol.** Az anyagok célja kizárólag az, hogy a
döntési láncban szereplő feleket meggyőzzék az előfizetésről. Egyetlen szöveg sem
közölheti kész tényként a bevezetést &ndash; a 01-es (vagyonőr) és 05-ös (bérlő)
anyag ezért feltételes módban fogalmaz, és visszajelzést kér, nem tájékoztat.
Új szöveg írásakor ezt tartsuk meg: ha a nem-vevő szereplők úgy érzik, hogy a döntés
nélkülük megszületett, ellenérdekeltté válnak, és épp az adoptációs kockázat nő.

Az anyagokban szereplő ROI-értékek **modellszámítások**, nem szerződéses vállalások,
és minden esetben fel van tüntetve a számítási alap. Éles ajánlat előtt az ügyfél
saját óradíjaival és önköltségeivel újraszámolandó.
