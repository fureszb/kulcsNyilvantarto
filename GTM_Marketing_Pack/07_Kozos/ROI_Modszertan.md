# ROI-módszertan &ndash; egységes számítási alap

A 04-es (területi igazgató) és a 06-os (megbízó/tulajdonos) lapon külön-külön
szerepel egy-egy ROI-levezetés. Ez a dokumentum a kettő közös alapja, hogy két
külön beszélgetésben ne mondjunk egymásnak ellentmondó számot. Élő ajánlat
előtt minden feltételezést az ügyfél saját adataival kell felülírni &ndash;
az alábbi értékek iparági becslések, nem szerződéses vállalások.

## 1. Alapegység: a helyszín

Az elszámolás alapja a helyszín (lépcsőház/épület), nem a felhasználó. Ez
azért fontos érv, mert a bővülés lineárisan tervezhető: az ötödik helyszín
ugyanannyiba kerül, mint az első.

## 2. Alapfeltevések (felülírandók)

| Változó | Alapérték | Megjegyzés |
|---|---|---|
| 24/7-es poszt havi óraszáma | 730 óra | 365 &times; 24 / 12 |
| Megbízói óradíj | 2 400 Ft | piaci átlag, régiófüggő |
| Őrzési önköltség (adminisztrációra vetítve) | 1 800 Ft/óra | belső bér+járulék |
| Vezetői önköltség (biztonsági vezető) | 4 500 Ft/óra | bér+járulék |
| Igazgatói önköltség | 6 000 Ft/óra | bér+járulék |
| Egy kilépő munkatárs pótlási költsége | 180 000 Ft | toborzás, oktatás, betanulási kiesés, túlóra-fedezés |
| Iparági éves fluktuáció | 50% | tapasztalati érték biztonsági szolgáltatóknál |
| Fedezeti hányad (megbízói szerződésen) | 12% | árbevétel-fedezet arány |

## 3. Helyszín-szintű havi modell (06-os lap alapja)

```
Helyszín havi árbevétele  = 730 óra × megbízói óradíj
Platformdíj                = 120 000 Ft (6,8% egy 2 400 Ft-os óradíjnál)
Ismétlődő megtakarítás     = megszűnő őri adminisztráció
                            + visszanyert vezetői kapacitás
                            + papír/iktatás megtakarítás
Érvényesíthető többlet      = árbevétel × 5% (óradíj-emelés, tenderen érvelhető)
Nettó havi eredmény         = ismétlődő megtakarítás + érvényesíthető többlet
                              &minus; platformdíj
```

**Fontos korlát, amit minden beszélgetésben ki kell mondani:** az ismétlődő
megtakarítás önmagában jellemzően **nem** fedezi a díjat. A különbözetet az
érvényesíthető óradíj-emelésnek vagy a kockázati oldalnak (lásd lent) kell
fedeznie &ndash; ezt a vevőnek magának kell realizálnia, mi nem tehetjük meg
helyette automatikusan.

## 4. Vezetői szintű éves modell (04-es lap alapja)

```
Éves fluktuációs költség  = aktív állomány × fluktuációs ráta × pótlási költség
Korai észleléssel elérhető
javulás (konzervatív)      = 8 százalékpont
Éves megtakarítás          = (aktív állomány × 0,08) × pótlási költség
Visszanyert vezetői idő    = 20&ndash;25 óra/hó/vezető
```

## 5. Kockázati oldal (nem ismétlődő, de nagyobb tételek)

| Esemény | Nagyságrend | Mikor releváns |
|---|---|---|
| Egyetlen megnyert kárvita | 800 000&ndash;5 000 000 Ft | ha van dokumentált, aláírt jegyzőkönyv |
| Egy megelőzett generálkulcs-vesztés | 400 000&ndash;1 200 000 Ft | napi tételes ellenőrzéssel |
| Egy megtartott ügyfél-helyszín | &asymp; 2 500 000 Ft/év | mérhető SLA-teljesítéssel |

## 6. Amit sosem mondunk

- Nem állítjuk, hogy a rendszer csökkenti az őrzési létszámot.
- Nem ígérünk konkrét, garantált megtérülési időt &ndash; csak modellt,
  feltételezésekkel.
- Nem kerekítünk felfelé egyetlen tételt sem a végösszeg kedvéért.
