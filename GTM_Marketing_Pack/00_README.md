# GTM Marketing Pack &ndash; KulcsNyilvántartó Platform

Szerepkörönkénti értékesítési csomag. Minden mappa két fájlt tartalmaz:

- `email_es_outreach.md` &ndash; 3 tárgymező-variáció, fő e-mail, követő e-mail,
  kifogáskezelési útmutató, beszélgetés-nyitók.
- `adatlap_szorolap.html` &ndash; A4-es, nyomdakész adatlap (CSS Paged Media, 12 mm margó).

## Mappák

| Mappa | Szerepkör | Döntési pozíció |
|---|---|---|
| `01_Vagyonor_Portas` | Vagyonőr / portás | Végfelhasználó &ndash; elfogadási kockázat |
| `02_Property_Manager` | Ingatlankezelő | Veto-jogú, nyomásgyakorló |
| `03_Biztonsagi_es_Teruleti_Vezeto` | Biztonsági vezető | Operatív kulcsszereplő |
| `04_Teruleti_Igazgato` | Területi igazgató | Stratégiai / részben költségvetési |
| `05_Irodahazi_Berlok` | Irodaházi bérlő | Érték-igazoló, elfogadó |
| `06_Megbizok_Tulajdonosok_Cegvezetok` | Megbízó / tulajdonos | **Fizető döntéshozó** |

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

## Arculat

A színek a projekt forráskódjából származnak (`tailwind.config.js`,
`resources/css/app.css`): chrome `#0f172a`, accent `#3b82f6`, accent-light `#60a5fa`,
valamint a safelist akcentek (teal `#0d9488`, emerald `#059669`, amber `#b45309`,
indigo `#4f46e5`). Betűtípus: Inter, nyomtatási fallback system-ui / Helvetica / Arial.

## Fontos

Az anyagokban szereplő ROI-értékek **modellszámítások**, nem szerződéses vállalások,
és minden esetben fel van tüntetve a számítási alap. Éles ajánlat előtt az ügyfél
saját óradíjaival és önköltségeivel újraszámolandó.
