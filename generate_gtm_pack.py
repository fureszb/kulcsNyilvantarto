# -*- coding: utf-8 -*-
"""
KulcsNyilvántartó Platform – GTM Marketing Pack generátor.

Létrehozza a szerepkörönkénti értékesítési csomagot:
  GTM_Marketing_Pack/<NN_Szerepkor>/email_es_outreach.md
  GTM_Marketing_Pack/<NN_Szerepkor>/adatlap_szorolap.html

Futtatás:
    python generate_gtm_pack.py            # csak MD + HTML
    python generate_gtm_pack.py --pdf      # + PDF (WeasyPrint szükséges)

A HTML-ek CSS Paged Media (A4 / 12mm) szabályokkal készülnek, a root <body>
nem használ flexbox-ot vagy grid-et (WeasyPrint-kompatibilitás), a többoszlopos
elrendezés display:table / table-cell alapú.
"""

import argparse
import sys
from pathlib import Path

OUTPUT_ROOT = Path(__file__).resolve().parent / "GTM_Marketing_Pack"

# ---------------------------------------------------------------------------
# Arculati paletta – a projekt tailwind.config.js + resources/css/app.css alapján
# ---------------------------------------------------------------------------
BRAND = {
    "chrome": "#0f172a",        # --brand-chrome / bg-slate-900 (header, footer)
    "accent": "#3b82f6",        # --brand-accent
    "accent_light": "#60a5fa",  # --brand-accent-light
    "accent_deep": "#1d4ed8",
    "ink": "#0f172a",
    "body": "#334155",
    "muted": "#64748b",
    "line": "#e2e8f0",
    "wash": "#f8fafc",
    "wash2": "#f1f5f9",
    "ok": "#059669",
    "warn": "#b45309",
    "bad": "#dc2626",
}

PRICE = "120 000 Ft / helyszín / hó"

# ---------------------------------------------------------------------------
# Nyomdakész A4 stíluslap
# ---------------------------------------------------------------------------
CSS = """
@page {
    size: A4;
    margin: 12mm 12mm 13mm 12mm;
}

* { box-sizing: border-box; }

html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

body {
    margin: 0;
    padding: 0;
    font-family: "Inter", system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;
    font-size: 9.2pt;
    line-height: 1.45;
    color: __BODY__;
    background: #ffffff;
}

h1, h2, h3, h4 { margin: 0; font-weight: 700; color: __INK__; }
p { margin: 0 0 6pt; }
strong { color: __INK__; font-weight: 700; }

/* ---------- Fejléc ---------- */
.hero {
    background: __CHROME__;
    color: #ffffff;
    padding: 13pt 15pt 14pt;
    border-radius: 6pt;
    border-left: 5pt solid __ACCENT__;
}
.hero .kicker {
    font-size: 6.9pt;
    letter-spacing: 1.5pt;
    text-transform: uppercase;
    font-weight: 700;
    color: __ACCENT_LIGHT__;
    margin-bottom: 5pt;
}
.hero h1 {
    color: #ffffff;
    font-size: 17.5pt;
    line-height: 1.18;
    letter-spacing: -0.35pt;
    margin-bottom: 5pt;
}
.hero .sub {
    color: #cbd5e1;
    font-size: 9.4pt;
    line-height: 1.45;
    margin: 0;
    max-width: 155mm;
}

/* ---------- Meta sáv ---------- */
.meta {
    display: table;
    width: 100%;
    table-layout: fixed;
    border-spacing: 5pt 0;
    margin: 7pt 0 0;
}
.meta .m {
    display: table-cell;
    vertical-align: top;
    background: __WASH2__;
    border: 0.6pt solid __LINE__;
    border-top: 2pt solid __ACCENT__;
    border-radius: 4pt;
    padding: 6pt 7pt;
}
.meta .m .lbl {
    font-size: 6.6pt;
    letter-spacing: 0.8pt;
    text-transform: uppercase;
    color: __MUTED__;
    font-weight: 700;
    margin-bottom: 2pt;
}
.meta .m .val { font-size: 8.6pt; color: __INK__; font-weight: 600; line-height: 1.3; }

/* ---------- Szekciók ---------- */
.section { margin-top: 12pt; }
.section > h2 {
    font-size: 11pt;
    letter-spacing: -0.15pt;
    padding-bottom: 3.5pt;
    border-bottom: 1.6pt solid __ACCENT__;
    margin-bottom: 7pt;
}
.section > h2 .num {
    display: inline-block;
    color: __ACCENT__;
    font-size: 9pt;
    margin-right: 5pt;
    font-variant-numeric: tabular-nums;
}
.lead { font-size: 9pt; color: __MUTED__; margin: -3pt 0 7pt; }

/* ---------- Kártyarács (table-alapú, WeasyPrint-biztos) ---------- */
.grid { display: table; width: 100%; table-layout: fixed; border-spacing: 5pt 0; }
.grid .cell { display: table-cell; vertical-align: top; }
.grid.rowgap { margin-bottom: 5pt; }

.card {
    background: #ffffff;
    border: 0.7pt solid __LINE__;
    border-radius: 5pt;
    padding: 7.5pt 8.5pt;
    page-break-inside: avoid;
    height: 100%;
}
.card h3 {
    font-size: 9.2pt;
    margin-bottom: 3pt;
    line-height: 1.25;
}
.card p { font-size: 8.5pt; color: __BODY__; margin: 0; line-height: 1.42; }
.card .tag {
    display: inline-block;
    margin-top: 5pt;
    font-size: 6.8pt;
    letter-spacing: 0.5pt;
    text-transform: uppercase;
    font-weight: 700;
    color: __ACCENT_DARK__;
    background: __ACCENT_SOFT__;
    border: 0.6pt solid __ACCENT__;
    border-radius: 20pt;
    padding: 1.6pt 6pt;
}

/* Fájdalompont-kártya */
.card.pain { background: __WASH__; border-color: #fecaca; border-left: 2.6pt solid __BAD__; }
.card.pain h3 { color: #991b1b; }
.card.pain h3 .mk { color: __BAD__; margin-right: 3pt; }

/* Megoldás-kártya */
.card.fix { border-left: 2.6pt solid __ACCENT__; }
.card.fix h3 .mk { color: __ACCENT__; margin-right: 3pt; }

/* ---------- Számsáv ---------- */
.facts { display: table; width: 100%; table-layout: fixed; border-spacing: 5pt 0; margin-top: 3pt; }
.facts .f {
    display: table-cell;
    vertical-align: top;
    text-align: center;
    background: __CHROME__;
    border-radius: 5pt;
    padding: 9pt 6pt 8pt;
    page-break-inside: avoid;
}
.facts .f .big {
    display: block;
    font-size: 17pt;
    font-weight: 800;
    color: __ACCENT_LIGHT__;
    letter-spacing: -0.6pt;
    line-height: 1;
    margin-bottom: 3.5pt;
}
.facts .f .cap { font-size: 7.6pt; color: #cbd5e1; line-height: 1.35; display: block; }

/* ---------- Modul-lista ---------- */
.mods { margin: 0; padding: 0; list-style: none; }
.mods li {
    padding: 4.6pt 0 4.6pt 15pt;
    border-bottom: 0.6pt solid __LINE__;
    font-size: 8.6pt;
    position: relative;
    page-break-inside: avoid;
}
.mods li:last-child { border-bottom: none; }
.mods li:before {
    content: "\\25B8";
    position: absolute;
    left: 3pt;
    top: 4.4pt;
    color: __ACCENT__;
    font-size: 8.5pt;
}
.mods li b { color: __INK__; }

/* ---------- ROI tábla ---------- */
.roi {
    border: 0.8pt solid __LINE__;
    border-radius: 5pt;
    overflow: hidden;
    page-break-inside: avoid;
}
.roi table { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
.roi th {
    background: __CHROME__;
    color: #ffffff;
    text-align: left;
    font-size: 7.2pt;
    letter-spacing: 0.7pt;
    text-transform: uppercase;
    padding: 5.5pt 8pt;
    font-weight: 700;
}
.roi td { padding: 5.2pt 8pt; border-top: 0.6pt solid __LINE__; vertical-align: top; }
.roi tr:nth-child(even) td { background: __WASH__; }
.roi td.num { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; font-weight: 600; color: __INK__; }
.roi td.note { color: __MUTED__; font-size: 7.8pt; }
.roi tr.sum td {
    background: __ACCENT_SOFT__ !important;
    border-top: 1.4pt solid __ACCENT__;
    font-weight: 700;
    color: __ACCENT_DARK__;
}
.assump { font-size: 7.4pt; color: __MUTED__; margin: 5pt 0 0; line-height: 1.4; }

/* ---------- CTA ---------- */
.cta {
    margin-top: 12pt;
    background: __ACCENT_SOFT__;
    border: 0.8pt solid __ACCENT__;
    border-left: 4pt solid __ACCENT__;
    border-radius: 5pt;
    padding: 10pt 12pt;
    page-break-inside: avoid;
}
.cta h3 { font-size: 10.5pt; color: __ACCENT_DARK__; margin-bottom: 4pt; }
.cta p { font-size: 8.8pt; margin-bottom: 5pt; }
.cta ul { margin: 0; padding-left: 13pt; }
.cta li { font-size: 8.6pt; margin-bottom: 2.6pt; }

/* ---------- Idézet ---------- */
.quote {
    border-left: 2.6pt solid __ACCENT__;
    background: __WASH__;
    padding: 7pt 10pt;
    border-radius: 0 4pt 4pt 0;
    font-size: 8.8pt;
    color: __BODY__;
    page-break-inside: avoid;
}

/* ---------- Lábléc ---------- */
.footer {
    margin-top: 13pt;
    padding-top: 6pt;
    border-top: 0.8pt solid __LINE__;
    font-size: 7.2pt;
    color: __MUTED__;
    line-height: 1.45;
}
.footer .brand { color: __INK__; font-weight: 700; }
.footer .price { color: __ACCENT_DARK__; font-weight: 700; }

.pagebreak { page-break-before: always; }
"""


def build_css(p):
    """Persona-akcentre szabott stíluslap."""
    return (
        CSS.replace("__CHROME__", BRAND["chrome"])
        .replace("__ACCENT_LIGHT__", p.get("accent_light", BRAND["accent_light"]))
        .replace("__ACCENT_SOFT__", p["accent_soft"])
        .replace("__ACCENT_DARK__", p["accent_dark"])
        .replace("__ACCENT__", p["accent"])
        .replace("__INK__", BRAND["ink"])
        .replace("__BODY__", BRAND["body"])
        .replace("__MUTED__", BRAND["muted"])
        .replace("__LINE__", BRAND["line"])
        .replace("__WASH2__", BRAND["wash2"])
        .replace("__WASH__", BRAND["wash"])
        .replace("__BAD__", BRAND["bad"])
    )


# ---------------------------------------------------------------------------
# HTML építőelemek
# ---------------------------------------------------------------------------
def _rows(items, per_row):
    return [items[i:i + per_row] for i in range(0, len(items), per_row)]


def render_cards(items, per_row, css_class, marker):
    out = []
    for row in _rows(items, per_row):
        cells = []
        for it in row:
            tag = '<span class="tag">%s</span>' % it["tag"] if it.get("tag") else ""
            cells.append(
                '<div class="cell"><div class="card %s">'
                '<h3><span class="mk">%s</span>%s</h3><p>%s</p>%s'
                "</div></div>" % (css_class, marker, it["h"], it["p"], tag)
            )
        while len(cells) < per_row:
            cells.append('<div class="cell"></div>')
        out.append('<div class="grid rowgap">%s</div>' % "".join(cells))
    return "".join(out)


def render_facts(facts):
    cells = "".join(
        '<div class="f"><span class="big">%s</span><span class="cap">%s</span></div>' % (b, c)
        for b, c in facts
    )
    return '<div class="facts">%s</div>' % cells


def render_mods(mods):
    lis = "".join("<li><b>%s</b> &mdash; %s</li>" % (m[0], m[1]) for m in mods)
    return '<ul class="mods">%s</ul>' % lis


def render_roi(roi):
    head = "".join("<th>%s</th>" % h for h in roi["head"])
    body = []
    for r in roi["rows"]:
        cls = ' class="sum"' if r.get("sum") else ""
        body.append(
            "<tr%s><td>%s</td><td class=\"num\">%s</td><td class=\"note\">%s</td></tr>"
            % (cls, r["label"], r["value"], r.get("note", ""))
        )
    html = (
        '<div class="roi"><table><thead><tr>%s</tr></thead><tbody>%s</tbody></table></div>'
        % (head, "".join(body))
    )
    if roi.get("assumptions"):
        html += '<p class="assump"><strong>Számítási alap:</strong> %s</p>' % roi["assumptions"]
    return html


def render_section(num, title, inner, lead=None):
    lead_html = '<p class="lead">%s</p>' % lead if lead else ""
    return (
        '<div class="section"><h2><span class="num">%s</span>%s</h2>%s%s</div>'
        % (num, title, lead_html, inner)
    )


def render_flyer(p):
    meta = "".join(
        '<div class="m"><div class="lbl">%s</div><div class="val">%s</div></div>' % (k, v)
        for k, v in p["meta"]
    )

    parts = [
        '<div class="hero">'
        '<div class="kicker">%s</div><h1>%s</h1><p class="sub">%s</p></div>'
        % (p["kicker"], p["title"], p["subtitle"]),
        '<div class="meta">%s</div>' % meta,
    ]

    n = 1
    parts.append(render_section(
        "%02d" % n, p["pains_title"], render_cards(p["pains"], 3, "pain", "&#9642;"),
        p.get("pains_lead"),
    ))
    n += 1

    parts.append(render_section(
        "%02d" % n, p["fix_title"], render_cards(p["solutions"], 2, "fix", "&#9679;"),
        p.get("fix_lead"),
    ))
    n += 1

    if p.get("facts"):
        parts.append(render_section("%02d" % n, p["facts_title"], render_facts(p["facts"])))
        n += 1

    if p.get("mods"):
        parts.append(render_section(
            "%02d" % n, p["mods_title"], render_mods(p["mods"]), p.get("mods_lead")
        ))
        n += 1

    if p.get("quote"):
        parts.append('<div class="section"><div class="quote">%s</div></div>' % p["quote"])

    if p.get("roi"):
        parts.append(render_section(
            "%02d" % n, p["roi"]["title"], render_roi(p["roi"]), p["roi"].get("lead")
        ))
        n += 1

    cta_items = "".join("<li>%s</li>" % b for b in p["cta"]["bullets"])
    parts.append(
        '<div class="cta"><h3>%s</h3><p>%s</p><ul>%s</ul></div>'
        % (p["cta"]["h"], p["cta"]["p"], cta_items)
    )

    parts.append(
        '<div class="footer"><span class="brand">KulcsNyilv&aacute;ntart&oacute; Platform</span> '
        "&nbsp;&middot;&nbsp; T&ouml;bb c&eacute;get kiszolg&aacute;l&oacute; biztons&aacute;gi l&eacute;tes&iacute;tm&eacute;nygazd&aacute;lkod&aacute;si "
        "&eacute;s &odblac;rszolg&aacute;lat-ir&aacute;ny&iacute;t&aacute;si rendszer (PWA + nat&iacute;v Android/iOS)"
        "<br>Adatlap: <strong>%s</strong> &nbsp;&middot;&nbsp; List&aacute;s d&iacute;j: "
        '<span class="price">%s</span> &nbsp;&middot;&nbsp; %s</div>'
        % (p["role"], PRICE, p["footnote"])
    )

    return (
        "<!DOCTYPE html>\n"
        '<html lang="hu"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width, initial-scale=1">'
        "<title>%s &ndash; KulcsNyilvantarto Platform</title>"
        "<style>%s</style></head><body>%s</body></html>"
        % (p["role"], build_css(p), "".join(parts))
    )


# ===========================================================================
# 1. VAGYONŐR / PORTÁS
# ===========================================================================
P1 = {
    "dir": "01_Vagyonor_Portas",
    "role": "Vagyonőr / portás",
    "accent": "#0d9488",
    "accent_dark": "#0f766e",
    "accent_soft": "#f0fdfa",
    "accent_light": "#5eead4",
    "kicker": "Munkatársi tájékoztató &middot; Operatív szint",
    "title": "A telefonod lesz az átadás-átvételi füzet, a jegyzőkönyv és a beosztás.",
    "subtitle": "Nem több adminisztráció &ndash; kevesebb. Ami eddig papíron ment, az "
                "másodpercek alatt elvégezhető művelet lesz, és minden elvégzett munkád "
                "névvel és időbélyeggel, visszakereshetően rögzül. Ez elsősorban téged véd.",
    "meta": [
        ("Kinek szól", "Vagyonőr, portás, recepciós"),
        ("Eszköz", "Saját okostelefon vagy szolgálati készülék"),
        ("Betanulás", "Kb. 20 perc, oktatási modullal"),
    ],
    "pains_title": "Ahogy ma megy",
    "pains_lead": "Három konkrét helyzet a szolgálatból, amit ma papír és telefon old meg.",
    "pains": [
        {"h": "Az átadás-átvételi füzet",
         "p": "Reggel kiderül, hogy egy kulcs nincs a helyén. A füzetben vagy nincs bejegyzés, "
              "vagy olvashatatlan az, ami van. A kérdés mindig ugyanaz: ki vette ki utoljára "
              "&ndash; és nincs rá bizonyíték."},
        {"h": "A kézzel írt jegyzőkönyv",
         "p": "Egy kárfelvételi vagy talált tárgy jegyzőkönyv 20&ndash;30 perc kézírás, aláírásokkal, "
              "másolással, iktatással. Ha egy adat kimarad, hetek múlva derül ki, "
              "amikor már senki nem emlékszik."},
        {"h": "A bejárás bizonyítása",
         "p": "Végigmentél az épületen. Ezt utólag nem tudod igazolni. Ha panasz érkezik, "
              "a szavad áll szemben az ügyfél állításával."},
    ],
    "fix_title": "Amit helyette csinálsz",
    "solutions": [
        {"h": "NFC-matrica beolvasása", "tag": "NFC bejárás-ellenőrzés",
         "p": "A telefonodat hozzáérinted a checkponton elhelyezett matricához. Kész. Az esemény "
              "névvel és időbélyeggel rögzül, és azonnal látja a vezetőd is. "
              "Ha nincs térerő, a telefon eltárolja és később magától elküldi."},
        {"h": "Digitális jegyzőkönyv, PDF-ben", "tag": "10 jegyzőkönyv-típus"},
        {"h": "Beosztás a zsebedben", "tag": "Vezénylés modul",
         "p": "Látod a havi beosztási rácsot. A saját sorodba beírhatod, hogy nem érsz rá (X), "
              "hogy bizonytalan (?), vagy hogy vállalsz túlórát (+). "
              "Nem kell telefonálni és nem kell a faliújságot fotózni."},
        {"h": "Kulcs- és kártyaellenőrzés listáról", "tag": "Ellenőrzési modul",
         "p": "A teljes tétellistát bérlő szerinti csoportokban látod, és egyenként pipálod. "
              "A hiányzó tétel nem &bdquo;kimarad&rdquo;, hanem &bdquo;hiányzik&rdquo; státuszt kap "
              "megjegyzéssel &ndash; és az értesítő e-mail automatikusan kimegy."},
        {"h": "Kérdezd meg az AI-asszisztenst", "tag": "Tudásbázis-asszisztens",
         "p": "&bdquo;Mi a teendő bombariadó esetén?&rdquo; &ndash; a válasz a cég saját "
              "szabályzatából jön, magyarul, akár hangvezérléssel is, hogy szolgálat közben "
              "ne kelljen a mappákat lapozni."},
        {"h": "Váltóüzenet a következő műszaknak", "tag": "Kommunikáció",
         "p": "Rövid jegyzet a helyszínhez és a naphoz kötve, hogy ne szóban adódjon "
              "tovább a fontos információ. A vezetői körüzenetre pedig válaszolni tudsz "
              "a szálban."},
    ],
    "facts_title": "Amit ez időben jelent",
    "facts": [
        ("3 mp", "egy NFC-checkpoint beolvasása a papíralapú bejárási lap kitöltése helyett"),
        ("0 perc", "iktatás &ndash; a jegyzőkönyv PDF-ként azonnal elkészül és letölthető"),
        ("100", "a legutóbbi 100 beolvasásod visszakereshető az NFC-előzményekben"),
    ],
    "mods_title": "Amit fontos tudnod &ndash; őszintén",
    "mods_lead": "A rendszer bevezetése kérdéseket vet fel. Ezek a valós válaszok.",
    "mods": [
        ("GPS", "csak szolgálat alatt fut, és a rendszer a zóna elhagyását, illetve a "
                "visszatérést jelzi &ndash; nem az útvonaladat követi. A téves riasztás "
                "elkerülésére csak 3 egymást követő &bdquo;kívüli&rdquo; jelzés után riaszt."),
        ("Aláírás", "az aláírásképed a szerveren kizárólag a PDF elkészültéig létezik, "
                    "utána véglegesen törlődik a lemezről. Csak a kész dokumentumba ágyazva marad meg."),
        ("Bizonyíték", "minden ellenőrzés, bejárás és jegyzőkönyv a te nevedhez kötve, "
                       "időbélyeggel rögzül. Ha valaki utólag megkérdőjelezi a munkádat, "
                       "a rendszer melletted szól."),
        ("Vizsga", "a fülváltás-figyelés csalás elleni védelem, nem megfigyelés. "
                   "Az újrapróbálkozási keret és a várakozási idő előre látható."),
        ("Offline", "a natív mobilalkalmazás térerő nélkül is fogadja a beolvasást; a rendszer "
                    "felismeri, ha ugyanaz a beolvasás kétszer érkezik be, és nem duplikálja."),
    ],
    "quote": "<strong>A legfontosabb egy mondatban:</strong> ez a rendszer nem azt méri, hogy "
             "mennyit dolgozol &ndash; azt dokumentálja, hogy <strong>elvégezted</strong>, amit "
             "rád bíztak. A különbség akkor számít, amikor egy vitatott ügyben rád mutatnak.",
    "cta": {
        "h": "Mi történik a bevezetéskor",
        "p": "Nem kell semmit előkészítened. A folyamat a szolgálat mellett fut.",
        "bullets": [
            "<strong>1. nap:</strong> fiókot kapsz, a telefonodra felteszed az alkalmazást "
            "(vagy a kezdőképernyőre a webes verziót).",
            "<strong>1. hét:</strong> a helyismereti oktatási modult végigkattintod &ndash; "
            "kb. 20 perc, a szolgálat közbeni holtidőben is megy.",
            "<strong>Átmenet:</strong> a papírfüzetet a bevezetés első hetében párhuzamosan "
            "vezetjük, hogy senki ne maradjon adat nélkül.",
            "<strong>Kérdés esetén:</strong> a vezetődnek vagy az AI-asszisztensnek is "
            "felteheted &ndash; a válasz a cég saját szabályzatából jön.",
        ],
    },
    "footnote": "Belső bevezetési tájékoztató &ndash; nem árajánlat.",
}
P1["solutions"][1]["p"] = (
    "Feljegyzés, kárfelvétel, talált tárgy, kulcsátadás, gépjárműnapló, bombariadó "
    "és további típusok &ndash; mindegyiket űrlapon töltöd ki, az aláírásokat a képernyőn "
    "gyűjtöd be. A PDF azonnal elkészül, nyomtatás és iktatás nélkül."
)

P1_EMAIL = """# Vagyonőr / Portás &ndash; belső bevezetési kommunikáció

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
"""

# ===========================================================================
# 2. PROPERTY MANAGER
# ===========================================================================
P2 = {
    "dir": "02_Property_Manager",
    "role": "Ingatlankezelő / Property Manager",
    "accent": "#2563eb",
    "accent_dark": "#1d4ed8",
    "accent_soft": "#eff6ff",
    "accent_light": "#93c5fd",
    "kicker": "Ingatlankezelői adatlap &middot; Szolgáltató-felügyelet",
    "title": "Nem a szolgáltató beszámolóját kapja. Magát a teljesítést látja.",
    "subtitle": "Saját, csak-olvasási felügyeleti hozzáférés a biztonsági szolgáltató "
                "operatív rendszeréhez: bejárás-visszaigazolás, napi jelentés, "
                "aktivitásnapló, jegyzőkönyvek &ndash; amint keletkeznek.",
    "meta": [
        ("Szerepkör", "Ingatlankezelői &ndash; dedikált, korlátozott jogkör"),
        ("Hozzáférés", "Csak-olvasás, jóváhagyás és körüzenet"),
        ("Bevezetési teher", "A szolgáltató oldalán, nem az Önén"),
    ],
    "pains_title": "Ahol ma vakon repül",
    "pains_lead": "Nem a szolgáltató szándékával van baj, hanem a visszacsatolás késésével.",
    "pains": [
        {"h": "A bejárás bizonyítéka",
         "p": "A szolgáltató azt jelenti, hogy az éjszakai bejárás megtörtént. Ezt ma "
              "elhinni lehet, ellenőrizni nem &ndash; legfeljebb kamerafelvétel utólagos "
              "visszanézésével, ami órákat visz el."},
        {"h": "A riport késése",
         "p": "A havi beszámoló a tárgyhónap zárása után 2&ndash;3 héttel érkezik, Word-fájlban. "
              "Amikor a tulajdonos rákérdez egy eseményre, a válasz az, hogy "
              "&bdquo;utánanézünk&rdquo; &ndash; a bizonyíték pedig papírdossziékban van."},
        {"h": "A bérlői panasz",
         "p": "&bdquo;Valaki bement az irodánkba hétvégén.&rdquo; Ma ezt cáfolni vagy igazolni csak "
              "kamerából és szóbeli emlékezetből lehet. Az átadás-átvételi füzet nem "
              "hivatkozható bizonyíték."},
    ],
    "fix_title": "Amit a saját hozzáférésével lát",
    "fix_lead": "A rendszer külön szerepkört tart fenn az ingatlankezelőnek &ndash; nem "
                "adminisztrátori fiókot, nem is a szolgáltató belső nézetét.",
    "solutions": [
        {"h": "NFC-bejárás visszaigazolás", "tag": "Bejárás-ellenőrzés",
         "p": "Nem önbevallás: az őr a helyszínen elhelyezett fizikai matricához érinti "
              "a telefonját. Minden beolvasás névvel, időbélyeggel, checkpont-címkével "
              "(&bdquo;Hátsó bejárat&rdquo;) rögzül, és élőben frissül a felületén."},
        {"h": "Napi biztonsági jelentés &ndash; jóváhagyással", "tag": "Napi jelentés",
         "p": "Incidensek, őrjáratok, tűzriasztások, liftállapot, karbantartási "
              "bejegyzések strukturáltan. Ön &bdquo;átnézve&rdquo; jelöléssel láthatja el &ndash; ez "
              "dokumentált visszacsatolás a szolgáltató felé, nem e-mail-váltás."},
        {"h": "Kulcs- és kártyaellenőrzés eredménye", "tag": "Ellenőrzési modul",
         "p": "Minden nyilvántartott tétel állapota bérlő/terület szerinti bontásban. "
              "A hiányzó tétel önálló státuszt kap megjegyzéssel &ndash; nem &bdquo;lemarad&rdquo; "
              "a listáról. Szerkeszteni nem tud, és ez szándékos: a nyilvántartás így marad hiteles."},
        {"h": "Teljes aktivitásnapló", "tag": "Auditnapló",
         "p": "Be- és kilépések, ellenőrzés-leadások, NFC-események, dokumentum-műveletek, "
              "geofence-riasztások &ndash; időbélyeggel és névvel, visszakereshetően. "
              "Ehhez a rendszerben az adminisztrátoron kívül csak Ön fér hozzá."},
        {"h": "Geofence-riasztás a saját telefonjára", "tag": "GPS zóna-figyelés",
         "p": "Ha egy szolgálatban lévő őr elhagyja az épület térképi lehatárolását, "
              "a helyszín felelősei &ndash; köztük az ingatlankezelő &ndash; azonnali "
              "push-értesítést kapnak. Nem másnap, a jelentésből."},
        {"h": "Körüzenet közvetlenül a csapatnak", "tag": "Kommunikáció",
         "p": "Bérlőváltás, karbantartási munka, rendezvény &ndash; az információ közvetlenül "
              "a szolgálatot adó kollégákhoz jut, válaszlehetőséggel a szálban. "
              "Nem a diszpécseren keresztül, három áttéttel."},
    ],
    "facts_title": "Ami ebből mérhető",
    "facts": [
        ("10", "jogilag strukturált jegyzőkönyv-típus, aláírt PDF-ként azonnal letölthető"),
        ("&lt; 1 perc", "amíg egy NFC-bejárás vagy geofence-esemény megjelenik a felületén"),
        ("0", "adminisztratív teher az Ön oldalán &ndash; a rendszert a szolgáltató üzemelteti"),
    ],
    "mods_title": "Amit a szerepköre szándékosan NEM tartalmaz",
    "mods_lead": "A korlátok nem hiányosságok &ndash; a nyilvántartás hitelességét védik.",
    "mods": [
        ("Nem szerkeszthet ellenőrzést", "az elkészült ellenőrzési eredményt kizárólag az "
         "adminisztrátor vagy az azt rögzítő dolgozó javíthatja. Így a rekord bizonyító ereje megmarad."),
        ("Nem hozhat létre jegyzőkönyvet", "dokumentumot csak dolgozó és adminisztrátor "
         "készíthet &ndash; Ön megtekintheti és jóváhagyhatja. A felelősségi lánc nem mosódik össze."),
        ("Nincs hozzáférése a Vezénylés modulhoz", "a szolgáltató munkaerő-beosztása "
         "munkajogi belügy. Ebből a modulból az ingatlankezelői szerepkör teljesen ki van zárva."),
        ("Nem lát AI-forrásmegjelölést", "a tudásbázis-asszisztenst használhatja, de a "
         "szolgáltató belső szabályzat-dokumentumainak listáját nem &ndash; tudatos "
         "információvédelmi döntés mindkét fél érdekében."),
    ],
    "quote": "<strong>Amit ez a szerződéses viszonyban jelent:</strong> a szolgáltatói SLA "
             "eddig nem volt mérhető &ndash; az, hogy &bdquo;az éjszakai bejárás megtörtént&rdquo;, "
             "nem adat. A checkpont-beolvasások időbélyeges listája viszont az, és szerződéses "
             "teljesítés-igazolásként hivatkozható.",
    "roi": {
        "title": "Amit a felügyeleti hozzáférés megspórol",
        "lead": "Az alábbi modell egy közepes irodaházra vonatkozik &ndash; a saját "
                "számaival felülírandó.",
        "head": ["Tétel", "Havi érték", "Alap"],
        "rows": [
            {"label": "Szolgáltatói riport bekérése, olvasása, visszakérdezése",
             "value": "4 óra", "note": "PM-óra, havi jelentési ciklus"},
            {"label": "Bérlői panasz kivizsgálása kamerafelvételből",
             "value": "3 óra", "note": "2 eset/hó &times; 1,5 óra visszanézés"},
            {"label": "Kulcs-/kártyanyilvántartás egyeztetése a szolgáltatóval",
             "value": "2 óra", "note": "havi leltár-összevetés"},
            {"label": "Tulajdonosi kérdésre adatgyűjtés",
             "value": "1,5 óra", "note": "ad-hoc, dossziékból"},
            {"label": "Megtakarított PM-idő összesen", "value": "10,5 óra / hó",
             "note": "&asymp; 63 000 Ft 6 000 Ft/órás PM-önköltséggel", "sum": True},
        ],
        "assumptions": "A platformdíjat (120 000 Ft/helyszín/hó) tipikusan a biztonsági "
                       "szolgáltató viseli és a szolgáltatási díjba építi. Az ingatlankezelő "
                       "oldalán ez döntően nem költség, hanem visszanyert kapacitás és "
                       "bizonyíthatóság. A PM-óradíj becsült érték &ndash; kérjük a saját "
                       "belső elszámolóárral újraszámolni.",
    },
    "cta": {
        "h": "Következő lépés &ndash; két lehetőség, mindkettő 30 perc alatt",
        "p": "A demót már látta. Innen két irányba lehet menni, és mindkettő azonnal indítható:",
        "bullets": [
            "<strong>Éles adatokon futó próba:</strong> egy kiválasztott irodaházban "
            "beállítjuk a checkpontokat és az Ön ingatlankezelői fiókját &ndash; "
            "két hétig párhuzamosan fut a jelenlegi jelentési renddel.",
            "<strong>SLA-melléklet átbeszélése:</strong> átnézzük, hogy a jelenlegi "
            "szolgáltatói szerződésének mely pontjai válnak a rendszerrel ténylegesen "
            "mérhetővé (bejárás-gyakoriság, incidens-válaszidő, jelentési határidő).",
            "<strong>Amit ehhez kérünk:</strong> egy helyszín, egy kapcsolattartó "
            "a szolgáltatónál, és a checkpontok kijelölése &ndash; jellemzően "
            "6&ndash;12 pont épületenként.",
        ],
    },
    "footnote": "Ingatlankezelői összefoglaló &ndash; a teljes funkciólista a specifikációban.",
}

P2_EMAIL = """# Ingatlankezelő / Property Manager &ndash; értékesítési csomag

> **Pozicionálás:** a PM ritkán a fizető fél &ndash; de gyakran ő a *veto-jogú* szereplő,
> és ő tud nyomást gyakorolni a biztonsági szolgáltatóra, hogy bevezesse. Az érv nem
> költségcsökkentés, hanem **bizonyíthatóság a tulajdonos felé** és a szolgáltatói SLA
> mérhetővé tétele.

---

## Tárgymező-variációk

1. `Az éjszakai bejárás igazolása &ndash; ami a havi riportból hiányzik`
2. `[Épület neve]: mérhető szolgáltatói SLA a jelenlegi szerződés mellett`
3. `Demó utáni összefoglaló &ndash; az ingatlankezelői hozzáférés pontos tartalma`

---

## E-mail &ndash; fő változat

**Tárgy:** Az éjszakai bejárás igazolása &ndash; ami a havi riportból hiányzik

Kedves [Név]!

Köszönöm a múlt heti bemutatóra szánt időt. Egy dolgot emelnék ki, ami akkor
elhangzott, de érdemes külön leírni, mert ez a rendszer legfontosabb hozadéka
az Ön pozíciójából.

**A jelenlegi helyzet:** amikor a tulajdonos vagy egy bérlő rákérdez, hogy megtörtént-e
egy bejárás vagy ki nyúlt egy kulcshoz, Önnek ma két lehetősége van &ndash; elhinni a
szolgáltató beszámolóját, vagy órákat tölteni kamerafelvétel visszanézésével.
A havi Word-riport 2&ndash;3 héttel az esemény után érkezik. Ez nem a szolgáltató hibája:
egyszerűen nincs mit felmutatni, mert az adat papírfüzetben keletkezik.

**Amit a rendszer ehelyett ad Önnek:** egy saját, csak-olvasási felügyeleti hozzáférést
a szolgáltató operatív rendszeréhez. Ebben:

- **Az NFC-bejárás nem önbevallás.** Az őr a helyszínen elhelyezett fizikai matricához
  érinti a telefonját. Minden beolvasás névvel, időbélyeggel és checkpont-címkével
  ("Hátsó bejárat") rögzül, és élőben, oldalfrissítés nélkül jelenik meg Önnél.
- **A napi biztonsági jelentést Ön "átnézve" jelöléssel láthatja el.** Ez dokumentált
  visszacsatolás a szolgáltató felé, nem e-mail-váltás, amit három hónap múlva
  senki nem talál meg.
- **Teljes aktivitásnaplóhoz fér hozzá.** Be- és kilépések, ellenőrzés-leadások,
  NFC-események, dokumentum-műveletek &ndash; a rendszerben ehhez az adminisztrátoron
  kívül kizárólag az ingatlankezelői szerepkör fér hozzá.
- **A geofence-riasztás a telefonjára érkezik.** Ha egy szolgálatban lévő őr elhagyja
  az épület térképi lehatárolását, Ön azonnal értesül róla &ndash; nem másnap, a jelentésből.

**Amit szándékosan nem tartalmaz a szerepköre:** ellenőrzési eredményt nem szerkeszthet,
jegyzőkönyvet nem hozhat létre, és a szolgáltató munkaerő-beosztásához (Vezénylés modul)
egyáltalán nincs hozzáférése. Ezek nem hiányosságok, hanem a nyilvántartás bizonyító
erejének és a felelősségi lánc tisztaságának a feltételei &ndash; ha Ön is szerkeszthetné
a rekordot, az egy vitás ügyben pont az értékét veszítené el.

**A gyakorlati következmény, ami miatt írok:** a jelenlegi szolgáltatói szerződésében
szereplő "rendszeres bejárás" ma nem mérhető kötelezettség. A checkpont-beolvasások
időbélyeges listájával viszont azzá válik &ndash; és teljesítés-igazolásként hivatkozható.

**Javaslatom:** válasszunk ki egyetlen irodaházat, ott beállítjuk a checkpontokat és
az Ön hozzáférését, és két hétig párhuzamosan fut a jelenlegi jelentési renddel.
Ehhez egy helyszín, egy kapcsolattartó a szolgáltatónál és a checkpontok kijelölése kell
&ndash; jellemzően 6&ndash;12 pont épületenként.

Melyik épület lenne erre a legalkalmasabb? Ha megnevezi, a beállítást a mi oldalunkon
elvégezzük.

Üdvözlettel,
[Név]

**P.S.** A platformdíj (120 000 Ft/helyszín/hó) rendszerint a biztonsági szolgáltatónál
merül fel, nem az ingatlankezelőnél. Ha ebben a konstrukcióban gondolkodik, szívesen
átküldöm azt az érvelést, amit a szolgáltatója felé érdemes használni.

---

## Követő e-mail (+4 nap)

**Tárgy:** Re: Az éjszakai bejárás igazolása &ndash; egy konkrét kérdés

Kedves [Név]!

Nem szeretném újra elmondani, amit már leírtam, ezért csak egy kérdésem van:

**Az elmúlt fél évben volt olyan bérlői vagy tulajdonosi kérdés, amire azt kellett
válaszolnia, hogy "utánanézünk"?**

Ha igen, egyetlen ilyen esetet átbeszélve 15 percben meg tudom mutatni, hogy a rendszer
adataiból mit lehetett volna azonnal megválaszolni. Ez konkrétabb, mint bármilyen
általános bemutató.

Ha nemleges a válasz, azt is megköszönöm &ndash; akkor ez a rendszer most nem az Ön
problémáját oldja meg, és nem terhelem tovább.

Üdvözlettel,
[Név]

---

## Kifogáskezelési útmutató

| Amit mond | Ami mögötte van | Ahogy érdemes válaszolni |
|---|---|---|
| "Ez a biztonsági szolgáltató dolga, nem az enyém." | Jogos hatáskör-elhatárolás. | "Egyetértek &ndash; és a díj is náluk merül fel. Amiért Önnel beszélek: a szolgáltató nem fogja bevezetni, ha a megbízó nem kéri. Ön az, aki a szerződésben mérhető bejárás-igazolást ki tud kötni." |
| "Nekünk már van BMS-ünk / helpdesk rendszerünk." | Rendszer-duplikáció félelme. | "A BMS a gépészetet és az épületet méri, a helpdesk a hibajegyet követi. Egyik sem tudja megmondani, hogy egy ember fizikailag végigment-e a 4. emeleten hajnali kettőkor. Ez a rendszer az emberi őrszolgálat teljesítés-igazolása &ndash; nem váltja ki, kiegészíti." |
| "Nem akarok még egy felületet, amit néznem kell." | Rendszer-fáradtság, valós. | "Nem is kell néznie. A geofence- és kritikus jegyzőkönyv-értesítés push-ban jön a telefonjára, a napi jelentést pedig ott hagyja jóvá, ahol eddig e-mailben visszaírt volna. A felületet akkor nyitja meg, amikor kérdés van &ndash; és pont akkor lesz benne minden." |
| "A szolgáltatóm meg fogja emelni miatta az árat." | Költségaggály, gyakran a valódi kifogás. | Ne tagadjuk. "Valószínűleg beépíti a díjba, igen. A kérdés az, hogy mit kap érte: mérhető SLA-t, azonnali bizonyítékot bérlői panasznál, és olyan dokumentációt, ami egy kárvitában használható. Ha a szolgáltató emelni akar, ezért érdemes engednie &ndash; nem ok nélkül." |
| "Az őrök nem fogják használni." | Korábbi bevezetési kudarc. | "Ez a legjogosabb kifogás, és nálunk is ez a legnagyobb kockázat. Ezért a bevezetés első hetében a papír párhuzamosan megy, és az őri munkafolyamat rövidebb lesz, nem hosszabb: egy NFC-scan három másodperc a bejárási lap kitöltése helyett. Ha ez nem így van, a bevezetés megbukik &ndash; és ezt előre vállaljuk." |
| "Adatvédelmileg ez GPS-követés." | GDPR-aggály, jogos. | "A rendszer zóna-be- és kilépést rögzít, nem folyamatos útvonalat, és csak szolgálati időben. Az aláírásképek pedig kizárólag a PDF elkészültéig léteznek fájlként, utána véglegesen törlődnek a lemezről. Ez tervezési döntés, nem beállítás." |

---

## Beszélgetés-nyitók

- "Ha a tulajdonos holnap rákérdez, hogy a múlt hónapban hány éjszakai bejárás történt &ndash; mennyi idő alatt tudna válaszolni, és mire hivatkozna?"
- "Melyik szerződéses pontja a szolgáltatói SLA-nak az, amit ma nem tud számon kérni, mert nincs hozzá adat?"
- "Az elmúlt évben volt olyan kárügy vagy bérlői panasz, ahol a dokumentáció hiánya miatt Ön került nehéz helyzetbe?"
"""

# ===========================================================================
# 3. BIZTONSÁGI VEZETŐ
# ===========================================================================
P3 = {
    "dir": "03_Biztonsagi_es_Teruleti_Vezeto",
    "role": "Biztonsági vezető",
    "accent": "#4f46e5",
    "accent_dark": "#4338ca",
    "accent_soft": "#eef2ff",
    "accent_light": "#a5b4fc",
    "kicker": "Operatív vezetői adatlap &middot; 3&ndash;10 irodaház",
    "title": "Hajnali kettőkor kiesik egy 24 órás szolgálat. Innen 4 perc, nem 40.",
    "subtitle": "A rendszer a saját felügyelt irodaházaira szűkített nézetet ad: élő "
                "&bdquo;ki van bent&rdquo; nézet, automatikus pótlás-jelölt-ajánlás, geofence-riasztás, "
                "leltár- és csapatkezelés &ndash; egy felületen, telefonról is.",
    "meta": [
        ("Látókör", "Kizárólag a saját felügyelt irodaházai"),
        ("Kritikus modul", "Vezénylés és a &bdquo;Ki van bent&rdquo; élő nézet"),
        ("Eszköz", "Web (PWA) + natív Android/iOS"),
    ],
    "pains_title": "A három legdrágább órája",
    "pains_lead": "Nem a döntés nehéz &ndash; az információ összegyűjtése viszi el az időt.",
    "pains": [
        {"h": "A pótlás-keresés",
         "p": "Kiesik egy 24 órás szolgálat. Következik az Excel-tábla nyitogatása, "
              "a fejben tartott &bdquo;ki pihent eleget&rdquo; logika, majd 8&ndash;15 telefonhívás. "
              "Éjszaka, a saját szabadidejében."},
        {"h": "&bdquo;Ki van most bent?&rdquo;",
         "p": "Az ügyfél rákérdez, hogy ki adja a szolgálatot. A válasz a beosztási "
              "Excelből és két telefonhívásból áll össze &ndash; és nem biztos, hogy "
              "aki a táblában szerepel, az ténylegesen ott is van."},
        {"h": "A havi adatgyűjtés",
         "p": "Ellenőrzési lapok, napi jelentések, jegyzőkönyvek 5&ndash;8 helyszínről, "
              "különböző formában, különböző késéssel. A riport összeállítása "
              "hónapvégi rutinfeladat &ndash; 6&ndash;8 óra."},
    ],
    "fix_title": "Amit a rendszer átvesz",
    "solutions": [
        {"h": "Automatikus pótlás-jelölt-ajánlás", "tag": "Vezénylés modul",
         "p": "A kieső 24 órás szolgálatot a rendszer két 12 órás blokkra bontja, és "
              "megnevezi a természetes jelöltet: éjszakára azt, aki előző nap 24 órázott "
              "(logikusan folytatja), nappalra azt, aki két napja dolgozott, de tegnap "
              "már nem (kipihente magát). Mellettük az aznap szabad kollégák, "
              "alacsonyabb prioritással. Kijelölés egy kattintás &ndash; naplózva."},
        {"h": "&bdquo;Ki van bent&rdquo; &ndash; élő, és megbízható forrásból", "tag": "Élő jelenlét",
         "p": "A nézet nem NFC-önbejelentésből dolgozik, hanem a Vezénylés aznapi "
              "beosztásából &ndash; ez akkor is helyes, ha valaki éppen nem olvasott be "
              "checkpontot. Kiegészül élő GPS-pozícióval és zóna-státusszal. Automatikusan "
              "a saját irodaházaira szűkül."},
        {"h": "Geofence-riasztás &ndash; téves riasztás nélkül", "tag": "GPS zóna-figyelés",
         "p": "Ha egy szolgálatban lévő őr elhagyja a helyszín térképi lehatárolását, "
              "azonnal push-értesítés megy ki. A GPS-pontatlanság kiszűrésére a rendszer csak "
              "3 egymást követő &bdquo;kívüli&rdquo; jelzés után riaszt &ndash; így a riasztás "
              "nem válik olyan zajjá, amit egy idő után mindenki figyelmen kívül hagy."},
        {"h": "Leltár és csapat &ndash; saját kézben", "tag": "Adminisztráció (szűkített)",
         "p": "A saját irodaházaiban felveheti/módosíthatja a kulcs- és kártyatételeket, "
              "a tétel-csoportokat, és hozzárendelheti a dolgozókat és az ingatlankezelőt. "
              "Nem kell adminisztrátorra várnia minden bérlőváltásnál."},
        {"h": "Vizsga-emlékeztető, célzottan", "tag": "Oktatás / Vizsga",
         "p": "Látja, kinek van elmaradt vagy lejáró képzése, és egy lépésben kiküldi "
              "az emlékeztetőt. Az oktatottsági szint ráadásul közvetlenül beszámít "
              "a saját teljesítmény-pontszámába."},
        {"h": "Jegyzőkönyvek és jelentések &ndash; a csapatáról", "tag": "Dokumentumok",
         "p": "A felügyelt irodaházak dolgozóinak jegyzőkönyveit látja, és &bdquo;átnézve&rdquo; "
              "jelöléssel láthatja el, a napi jelentéseket ugyanígy. Nincs több "
              "e-mailben körbeküldött szkennelt papír."},
    ],
    "facts_title": "Amit ez számokban jelent",
    "facts": [
        ("2", "kattintás egy 24 órás kiesés lefedéséhez: a jelölt kiválasztása és kijelölése"),
        ("200", "utolsó pótlás-esemény visszakereshető, emberi nyelvű változásnaplóban"),
        ("3", "egymást követő GPS-jelzés kell egy riasztáshoz &ndash; nincs téves riasztás-zaj"),
    ],
    "mods_title": "A jogköre pontos határai",
    "mods_lead": "A rendszer a hierarchiát (területi igazgató &rarr; biztonsági vezető "
                 "&rarr; irodaház &rarr; dolgozó) automatikusan érvényesíti minden modulban.",
    "mods": [
        ("Vezénylés", "a saját felügyelt irodaházainak területeit szerkeszti, "
                      "óraszámot is írhat. A saját sorát mindig látja."),
        ("Ellenőrzés", "kulcs-/kártyaellenőrzést rögzíthet, tételeket és tétel-csoportokat kezelhet."),
        ("Dokumentum", "megtekintheti és jóváhagyhatja a csapatáét &ndash; létrehozni és "
                       "törölni nem tud (ez dolgozói, illetve adminisztrátori jogkör)."),
        ("Körüzenet", "a saját csapatára korlátozva küldhet &ndash; a &bdquo;mindenkinek&rdquo; "
                      "küldés ezen a szinten nem érhető el."),
        ("Nem éri el", "az ellenőrzési előzményeket és a CSV-exportot, az NFC-matricák "
                       "adminisztrációját és a teljesítmény-irányítópultot &ndash; ezek "
                       "adminisztrátori, illetve területi igazgatói jogkörök."),
    ],
    "quote": "<strong>A legerősebb egyetlen funkció:</strong> a pótlás-jelölt-ajánló nem "
             "listát ad, hanem <strong>sorrendet</strong> &ndash; és a mögötte lévő logika "
             "ugyanaz, amit ma fejben csinál. A különbség, hogy hajnali kettőkor a rendszer "
             "nem fárad el, és minden kijelölés naplózva marad.",
    "roi": {
        "title": "Vezetői időmérleg &ndash; 5 felügyelt irodaház esetén",
        "lead": "Az értékek a jelenlegi (Excel + telefon) munkaszervezésre vonatkoznak.",
        "head": ["Feladat", "Ma / hó", "A rendszerrel"],
        "rows": [
            {"label": "Havi beosztás összeállítása és karbantartása Excelben",
             "value": "10 óra", "note": "&rarr; 3 óra (rács + Excel-import)"},
            {"label": "Kiesések pótlása telefonon (átl. 6 eset/hó)",
             "value": "7 óra", "note": "&rarr; 1 óra (ajánlott jelölt + 1 kattintás)"},
            {"label": "Napi jelentések és jegyzőkönyvek begyűjtése",
             "value": "6 óra", "note": "&rarr; 0,5 óra (a felületen keletkeznek)"},
            {"label": "&bdquo;Ki van bent&rdquo; és egyéb státuszkérdések megválaszolása",
             "value": "3 óra", "note": "&rarr; 0 óra (élő nézet, ügyfél is látja)"},
            {"label": "Havi riport összeállítása a felettesnek",
             "value": "4 óra", "note": "&rarr; 0,5 óra (generált riport)"},
            {"label": "Visszanyert vezetői kapacitás", "value": "25 óra / hó",
             "note": "&asymp; 3 munkanap, 5 helyszínre vetítve 5 óra/helyszín", "sum": True},
        ],
        "assumptions": "Feltételezett munkaszervezés: 5 felügyelt irodaház, 24/7 szolgálat, "
                       "havi 6 nem tervezett kiesés. A számok iparági tapasztalati értékek "
                       "&ndash; kérjük a saját ráfordításával felülírni. A platformdíj "
                       "(120 000 Ft/helyszín/hó) cégszinten merül fel, nem vezetői "
                       "költséghelyen.",
    },
    "cta": {
        "h": "Amit javaslok: egy hónap, egy terület, valós beosztással",
        "p": "Nem demókörnyezetben. A saját múlt havi beosztásával, a saját embereivel.",
        "bullets": [
            "<strong>1. lépés:</strong> a jelenlegi Excel-beosztását egy lépésben "
            "beimportáljuk &ndash; a területek és a dolgozók automatikusan létrejönnek.",
            "<strong>2. lépés:</strong> a következő valós kiesésnél egyszerre nézzük meg, "
            "kit ajánl a rendszer és kit hívott volna Ön. Ha nem egyezik, az nekünk "
            "fontosabb információ, mint ha egyezik.",
            "<strong>3. lépés:</strong> egy irodaházban felragasztjuk a checkpontokat "
            "(6&ndash;12 pont), és két hétig figyeljük a bejárás-lefedettséget.",
            "<strong>Amit ehhez kérek:</strong> a múlt havi beosztási táblázat és "
            "45 perc közös beállítás. Ennyi.",
        ],
    },
    "footnote": "Operatív vezetői adatlap &ndash; a területi igazgatói funkciók külön lapon.",
}

P3_EMAIL = """# Biztonsági vezető (security_lead) &ndash; értékesítési csomag

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
"""

# ===========================================================================
# 4. TERÜLETI IGAZGATÓ
# ===========================================================================
P4 = {
    "dir": "04_Teruleti_Igazgato",
    "role": "Területi igazgató",
    "accent": "#b45309",
    "accent_dark": "#92400e",
    "accent_soft": "#fffbeb",
    "accent_light": "#fcd34d",
    "kicker": "Regionális vezetői adatlap &middot; Kontrolling",
    "title": "Ma a vezetőit benyomás alapján méri. Holnap egy nyilvános képlet alapján.",
    "subtitle": "Irodaházankénti és vezetőnkénti teljesítmény-pontszám, célkitűzés-kezelés "
                "és hat havi trend &ndash; ugyanabból az adatból, ami az operatív "
                "munkavégzés során amúgy is keletkezik. Nincs külön adatbekérés.",
    "meta": [
        ("Látókör", "Minden felügyelt biztonsági vezető és irodaházaik"),
        ("Kulcsmodul", "Teljesítmény-irányítópult és célkitűzés"),
        ("Riport-ciklus", "Élő, visszamenőleg 6 hónap"),
    ],
    "pains_title": "Amiről ma nincs adata",
    "pains_lead": "Nem a döntéseivel van baj, hanem azzal, hogy mikor kap hozzá információt.",
    "pains": [
        {"h": "A vezetők összehasonlítása",
         "p": "Öt biztonsági vezetője van. Melyik teljesít jobban? A válasz ma abból áll, "
              "hogy ki panaszkodik ritkábban, és kinél nem volt ügyfélpanasz. "
              "Ez nem mérés, hanem benyomás."},
        {"h": "A fluktuáció késése",
         "p": "Egy helyszínen elkezdenek kilépni az emberek. Ez ma akkor derül ki, amikor "
              "már nem lehet feltölteni a szolgálatot &ndash; jellemzően 2&ndash;3 hónappal "
              "a folyamat kezdete után."},
        {"h": "Az ügyfélpanasz",
         "p": "A megbízó felhívja, hogy három hete nem kapott jelentést, és volt egy "
              "incidens, amiről Ön nem tudott. Ekkor hallja először &ndash; és a beosztottja "
              "ekkor kezd el adatot gyűjteni."},
    ],
    "fix_title": "Amit a vezetői irányítópult ad",
    "solutions": [
        {"h": "Teljesítmény-pontszám &ndash; nyilvános képlettel", "tag": "Teljesítmény modul",
         "p": "Irodaházanként: az aktív dolgozók átlagos készültségi szintje (elvégzett "
              "kötelező oktatások és vizsgák aránya) <strong>mínusz</strong> a fluktuációs "
              "büntetés (az adott hónapban kilépettek aránya). A képlet nyílt és "
              "auditálható &ndash; nem fekete doboz. Az eredmény negatív is lehet, "
              "és ez szándékos."},
        {"h": "Vezetőnkénti, súlyozott összesítő", "tag": "Vezetői kártyák",
         "p": "Minden felügyelt biztonsági vezető névjegykártya-szerű összesítője, "
              "a felügyelt irodaházak <strong>létszámmal súlyozott</strong> átlagával &ndash; "
              "hogy egy 3 fős helyszín ne torzítsa el ugyanúgy a képet, mint egy 25 fős. "
              "Lenyitható irodaházankénti bontással."},
        {"h": "Célkitűzés &ndash; vezetőre és helyszínre", "tag": "Célkitűzés-kezelés",
         "p": "Havi célérték beállítása egy adott biztonsági vezetőre: elvárt oktatottsági "
              "százalék és maximális fluktuációs százalék. Cégszinten vagy egy konkrét "
              "irodaházra vonatkoztatva &ndash; így a teljesítményről szóló beszélgetés "
              "számokra épül, nem benyomásokra."},
        {"h": "Hat havi trend, hónapról hónapra", "tag": "Havi riport",
         "p": "Nem pillanatkép: az elmúlt (alapértelmezetten) hat hónap alakulása, "
              "hónapról hónapra számított javulással vagy romlással. Egy rossz hónap "
              "nem ítélet, egy hat hónapos lejtmenet viszont beavatkozási pont."},
        {"h": "Nyitott kritikus jegyzőkönyvek", "tag": "Dokumentumok",
         "p": "A még nem jóváhagyott kárfelvételi, bombariadó- és kiürítési jegyzőkönyvek "
              "listája &ndash; mobil nézetben az irányítópult tetején, heti incidens-trenddel "
              "és élő jelenlét-számlálóval. A panasz előtt látja, nem utána."},
        {"h": "Teljes körű Vezénylés-hozzáférés", "tag": "Vezénylés modul",
         "p": "Minden felügyelt terület beosztása, pótlás-kijelölés, változásnapló és "
              "Excel-import &ndash; ha egy vezetője kiesik vagy szabadságon van, "
              "Ön azonnal át tudja venni a területet, nem kell átadás-átvételre várni."},
    ],
    "facts_title": "Ami ebből mérhetővé válik",
    "facts": [
        ("6", "hónap visszamenőleges trend, hónapról hónapra számított változással"),
        ("2", "célérték vezetőnként: oktatottsági % és maximális fluktuációs %"),
        ("0", "külön adatbekérés &ndash; a mutatók az operatív munkából keletkeznek"),
    ],
    "mods_title": "A jogköre és a mutató korlátai &ndash; nyíltan",
    "mods_lead": "Egy kontrolling-eszköz akkor használható, ha a határai is ismertek.",
    "mods": [
        ("Amit mér", "készültségi szint (oktatás/vizsga-teljesítés) és fluktuáció. "
                     "Ez a két mutató az, ami a rendszerben objektíven és manipulációmentesen keletkezik."),
        ("Amit NEM mér", "ügyfél-elégedettséget, incidens-kezelési minőséget vagy szubjektív "
                         "vezetői kvalitást. A pontszám a vezetői beszélgetés kiindulópontja, nem a végeredménye."),
        ("Miért lehet negatív", "ha egy hónapban a kilépések aránya meghaladja a készültségi "
                                "szintet, a pontszám negatívba fordul &ndash; ez tudatosan éles jelzés, nem hiba."),
        ("Adminisztrátori szintű jogkör", "teljesítmény-áttekintés, célkitűzés, havi riportok, teljes "
                                "Vezénylés-hozzáférés, AI-tudásbázis feltöltés és forrásmegjelölés, "
                                "minden dokumentum megtekintése."),
        ("Amit nem lát", "ellenőrzési előzményeket, CSV-exportot és aktivitásnaplót &ndash; "
                         "ezek adminisztrátori, illetve ingatlankezelői jogkörök."),
    ],
    "quote": "<strong>Amiért a képlet nyílt:</strong> egy teljesítménymutató, amit a mért fél "
             "nem tud levezetni, nem motivál &ndash; csak gyanút kelt. Itt minden vezetője "
             "pontosan tudja, mit kell tennie a javításért: képzést befejeztetni és "
             "embert megtartani. Mindkettő valódi vezetői munka.",
    "roi": {
        "title": "Megtérülés &ndash; a fluktuáció korai észlelésének értéke",
        "lead": "A modell 40 helyszínt és helyszínenként átlagosan 3 fő állandó állományt "
                "feltételez (120 fő).",
        "head": ["Tétel", "Érték", "Levezetés"],
        "rows": [
            {"label": "Egy kilépő munkatárs pótlásának teljes költsége",
             "value": "180 000 Ft", "note": "toborzás + oktatás + betanulási kiesés + túlóra-fedezés"},
            {"label": "Éves kilépés 50%-os iparági fluktuációnál",
             "value": "60 fő / év", "note": "120 fő állomány"},
            {"label": "Éves fluktuációs költség ma",
             "value": "10 800 000 Ft", "note": "60 &times; 180 000 Ft"},
            {"label": "Korai észleléssel elért javulás (50% &rarr; 42%)",
             "value": "&minus;9,6 fő / év", "note": "8 százalékpont, konzervatív becslés"},
            {"label": "Éves megtakarítás a fluktuáción",
             "value": "1 728 000 Ft", "note": "9,6 &times; 180 000 Ft"},
            {"label": "Vezetői kontrolling-idő (riportgyűjtés, egyeztetés)",
             "value": "+1 440 000 Ft", "note": "20 óra/hó &times; 12 &times; 6 000 Ft igazgatói önköltség"},
            {"label": "Kimutatható éves haszon &ndash; kizárólag ezen a két tételen",
             "value": "3 168 000 Ft / év", "note": "2,2 helyszín teljes éves platformdíja", "sum": True},
        ],
        "assumptions": "40 helyszín &times; 120 000 Ft/hó = 57,6 MFt/év teljes platformdíj. "
                       "A fenti 3,17 MFt <em>kizárólag</em> a fluktuációs és kontrolling-oldalt "
                       "fedi &ndash; az operatív megtakarítás (biztonsági vezetőnként 25 óra/hó), "
                       "a kárvita-kockázat és az árbevételi oldal a tulajdonosi "
                       "adatlapon szerepel. Minden érték iparági becslés, saját adattal "
                       "felülírandó.",
    },
    "cta": {
        "h": "Amit javaslok: mérjünk visszamenőlegesen, ne előre",
        "p": "A rendszer értékét nem az mutatja meg, hogy mit ígér, hanem hogy a múltbeli "
             "adataira ráillesztve mit mutatott volna ki időben.",
        "bullets": [
            "<strong>Retrospektív teszt:</strong> adja meg két helyszín elmúlt 6 havi "
            "belépési/kilépési és képzési adatát. Kiszámoljuk a pontszámot visszamenőleg, "
            "és megnézzük, hogy a mutató jelezte-e a problémát, mielőtt Ön értesült róla.",
            "<strong>Ha jelezte:</strong> tudjuk, mennyi lett volna a reakcióidő-nyereség &ndash; "
            "és ez az egyetlen érv, ami ebben a pozícióban számít.",
            "<strong>Ha nem jelezte:</strong> azt is megmondjuk, és megbeszéljük, milyen "
            "mutatóra van valójában szüksége. Ez sem üres kör.",
            "<strong>Időigény:</strong> 1 óra adategyeztetés, 1 óra közös kiértékelés.",
        ],
    },
    "footnote": "Regionális vezetői adatlap &ndash; a teljes ROI-levezetés a tulajdonosi lapon.",
}

P4_EMAIL = """# Területi igazgató (area_director) &ndash; értékesítési csomag

> **Pozicionálás:** ő stratégiai és részben költségvetési döntéshozó. Az operatív
> kényelem **nem érv** nála. Az érv: objektív, összehasonlítható vezetői mérőszám és a
> fluktuáció korai észlelése. A hitelesség kulcsa, hogy a mutató korlátait mi mondjuk ki
> először, ne ő.

---

## Tárgymező-variációk

1. `Öt biztonsági vezető &ndash; melyik teljesít jobban? Ma erre nincs adata`
2. `Retrospektív teszt: jelezte volna-e a mutató a [X] helyszín fluktuációját?`
3. `A teljesítmény-képlet, amit a beosztottjai is le tudnak vezetni`

---

## E-mail &ndash; fő változat

**Tárgy:** Öt biztonsági vezető &ndash; melyik teljesít jobban? Ma erre nincs adata

Kedves [Név]!

A bemutatón sok modult láttunk. Az Ön pozíciójából viszont a rendszernek egyetlen
igazi tétje van, és arról szeretnék konkrétan írni.

**A jelenlegi helyzet.** Öt biztonsági vezetője van. Ha ma meg kellene mondania, melyik
teljesít jobban, a válasz abból állna össze, hogy ki panaszkodik ritkábban és kinél nem
volt eszkaláció. Ez nem mérés. Ennek pedig az a következménye, hogy a fluktuáció akkor
derül ki, amikor már nem lehet feltölteni a szolgálatot &ndash; jellemzően két-három
hónappal a folyamat tényleges kezdete után &ndash;, az ügyfél-eszkalációról pedig
a megbízó telefonjából értesül, nem a saját rendszeréből.

**Amit a rendszer ehelyett ad.** Irodaházankénti teljesítmény-pontszámot, egy nyílt
képlet alapján: az aktív dolgozók átlagos készültségi szintje (a rendszerben elvégzett
kötelező oktatások és vizsgák arányából) **mínusz** a fluktuációs büntetés (az adott
hónapban kilépett dolgozók aránya az aktív állományhoz képest). Vezetői szinten ez a
felügyelt irodaházak **létszámmal súlyozott** átlaga &ndash; hogy egy 3 fős helyszín
ne torzítson ugyanúgy, mint egy 25 fős.

Ehhez jön a célkitűzés-kezelés (vezetőnként havi elvárt oktatottsági és maximális
fluktuációs százalék, akár konkrét irodaházra szűkítve), a hat havi visszamenőleges
trend hónapról hónapra számított változással, és az irányítópulton a még nem jóváhagyott
kritikus jegyzőkönyvek listája.

**Amit előre kimondok, mielőtt Ön kérdezné.** Ez a mutató **két dolgot mér: képzettséget
és fluktuációt.** Nem méri az ügyfél-elégedettséget, az incidenskezelés minőségét és a
vezetői kvalitást. A pontszám a vezetői beszélgetés kiindulópontja, nem a végeredménye.
Ha valaki ennél többet ígér Önnek egy számtól, azt érdemes gyanakvással fogadni.

Két dolog viszont mellette szól. Az egyik: **a képlet nyilvános**, minden vezetője le
tudja vezetni, és pontosan tudja, mit kell tennie a javításért &ndash; képzést
befejeztetni és embert megtartani. Mindkettő valódi vezetői munka, nem mutatókozmetika.
A másik: **az adat nem külön bekérésből keletkezik**, hanem az operatív munkából, amit
a kollégái amúgy is elvégeznek. Nincs riport-körlevél, nincs Excel-bekérés.

**A javaslatom nem demó, hanem visszamenőleges teszt.** Adja meg két helyszín elmúlt
hat havi belépési/kilépési és képzési adatát. Kiszámoljuk a pontszámot visszamenőleg,
és megnézzük: **jelezte volna-e a mutató a problémát, mielőtt Ön értesült róla?**

Ha jelezte, akkor tudjuk, mennyi reakcióidőt nyert volna &ndash; és ez az egyetlen érv,
ami ebben a pozícióban valóban számít. Ha nem jelezte, azt is megmondom, és akkor arról
kell beszélnünk, milyen mutatóra van valójában szüksége.

Időigény: egy óra adategyeztetés, egy óra közös kiértékelés.

Melyik két helyszínnel csináljuk?

Üdvözlettel,
[Név]

**P.S.** A számszerű oldal röviden: 40 helyszín, 120 fős állomány, 50%-os iparági
fluktuáció mellett a kilépések éves költsége nagyságrendileg 10,8 MFt (180 000 Ft/fő
pótlási költséggel). Ha a korai észlelés ezt 42%-ra viszi, az önmagában 1,7 MFt/év,
a visszanyert kontrolling-idővel együtt kb. 3,2 MFt/év &ndash; ez 2,2 helyszín teljes
éves platformdíja. A teljes levezetést csatoltam.

---

## Követő e-mail (+5 nap)

**Tárgy:** Re: a retrospektív teszt &ndash; a két helyszín kiválasztása

Kedves [Név]!

Hogy egyszerűbb legyen: **ne a legjobb és a legrosszabb helyszínt válassza.**
Válasszon egyet, ahol az elmúlt évben volt egy meglepetés &ndash; váratlan felmondáshullám,
ügyfél-panasz, vezetőcsere &ndash;, és egyet, ahol minden rendben ment.

Az elsőn az látszik majd, hogy a mutató jelzett-e időben. A másodikon az, hogy nem ad-e
téves riasztást. A kettő együtt eldönti a kérdést &ndash; külön-külön egyik sem.

Ha megnevezi a két helyszínt, az adatbekérési listát még aznap átküldöm. Négy oszlop,
nem több.

Üdvözlettel,
[Név]

---

## Kifogáskezelési útmutató

| Amit mond | Ami mögötte van | Ahogy érdemes válaszolni |
|---|---|---|
| "Egy szám nem mér teljesítményt." | Szakmai, jogos ellenvetés &ndash; és teszt is. | Adjunk igazat. "Egyetértek, és ezért mondom el elsőként, mit nem mér: elégedettséget, incidenskezelési minőséget, vezetői kvalitást. Két dolgot mér &ndash; képzettséget és fluktuációt &ndash;, mert ez az a kettő, ami manipulációmentesen, magától keletkezik. A többiről továbbra is Önnek kell beszélgetnie. Csak most lesz mihez képest." |
| "A vezetőim majd megjátsszák a mutatót." | Gaming-kockázat, valós vezetői tapasztalat. | "Nézzük meg, hogyan lehetne. A készültségi szintet úgy lehet javítani, hogy az emberek elvégzik a képzést &ndash; ez a kívánt viselkedés. A fluktuációt úgy, hogy nem lépnek ki &ndash; szintén. Ha valaki ezt a két mutatót megjátssza, közben pontosan azt csinálja, amit szeretnénk. Ez a képlet szándékos tulajdonsága." |
| "Ez már megvan a HR-rendszerünkben." | Redundancia-aggály. | "A belépés/kilépés valószínűleg igen. Az viszont nem, hogy egy konkrét irodaház konkrét őre elvégezte-e a helyismereti oktatást, és hogy ez hogyan viszonyul a felügyelő vezető többi helyszínéhez. A HR állományt mér, ez felkészültséget, helyszíni bontásban, vezetői felelősségi láncra vetítve." |
| "57,6 millió forint évente 40 helyszínre &ndash; ez sok." | Költségvetési ellenállás, a valódi kifogás. | Ne a mutatóval védekezzünk, hanem az árbevétel-oldallal. "Vessük össze a bevétellel: egy 24/7-es őrposzt havi megbízói árbevétele 2 400 Ft-os óradíjjal nagyságrendileg 1,75 MFt. A platformdíj ennek 6,8%-a. A kérdés nem az, hogy sok-e, hanem hogy ez a 6,8% megvéd-e egyetlen ügyfélvesztéstől vagy kárvitától évente. Ezt a levezetést a tulajdonosi anyagban részletesen leírtuk." |
| "Nekem ehhez a beosztottjaim együttműködése kell." | Bevezetési kockázat, jogos. | "Igen, és ezért nem Önnél kezdtük. A biztonsági vezetőinek külön anyagot készítettünk, amiben az ő nyereségük szerepel &ndash; az éjszakai pótlás-telefonok megszűnése és a hónapvégi adatgyűjtés. Ha ők nem használják, a mutatója is üres marad. Ezt a kockázatot nem tagadjuk, hanem külön kezeljük." |
| "Majd a jövő évi tervezésnél." | Halasztás &ndash; gyakran udvarias nem. | "Elfogadom. Egyetlen kérésem van addig: a retrospektív teszt akkor is elvégezhető, ha idén nem lesz döntés. Két helyszín, hat hónap adata, két óra. Ha kiderül, hogy a mutató nem jelzett volna időben, akkor jövőre sem kell erről beszélnünk &ndash; és ez mindkettőnknek időt spórol." |

---

## Beszélgetés-nyitók

- "Ha most meg kellene neveznie a leggyengébben teljesítő biztonsági vezetőjét &ndash; mire hivatkozna?"
- "Az elmúlt évben melyik helyszínen érte meglepetésként egy felmondáshullám? Mikor derült ki, és mikor kezdődött valójában?"
- "Hány órát visz el havonta az, hogy a vezetőitől riportot kérjen be és összefésülje?"
- "Ha egy megbízója holnap panasszal áll elő egy incidens miatt, honnan tudja meg először: tőle, vagy a saját rendszeréből?"
"""

# ===========================================================================
# 5. IRODAHÁZI BÉRLŐK
# ===========================================================================
P5 = {
    "dir": "05_Irodahazi_Berlok",
    "role": "Irodaházi bérlő",
    "accent": "#059669",
    "accent_dark": "#047857",
    "accent_soft": "#ecfdf5",
    "accent_light": "#6ee7b7",
    "kicker": "Bérlői tájékoztató &middot; Szolgáltatási szint",
    "title": "A kulcsaik, a talált tárgyak és a tűzriadó &ndash; mindegyikről aláírt dokumentum készül.",
    "subtitle": "Az épület biztonsági szolgálata digitális nyilvántartásra áll át. "
                "Bérlőként ez azt jelenti, hogy a korábban szóban vagy füzetben "
                "elintézett ügyekből visszakereshető, aláírt jegyzőkönyvek lesznek.",
    "meta": [
        ("Kinek szól", "Bérlői kapcsolattartó, irodavezető"),
        ("Amit tenni kell", "Semmit &ndash; az üzemeltető és a szolgálat vezeti be"),
        ("Ami változik", "Bizonyíthatóság kulcs-, kár- és kiürítési ügyekben"),
    ],
    "pains_title": "Amit ma nem lehet visszakeresni",
    "pains_lead": "Nem gyakori helyzetek &ndash; de amikor előfordulnak, nagy a tét.",
    "pains": [
        {"h": "&bdquo;Kinél van a kulcsunk?&rdquo;",
         "p": "A tartalék irodakulcsot évekkel ezelőtt leadták a portán. Hogy azóta ki "
              "vette fel és mikor adta vissza, arról egy kézzel vezetett füzet szól &ndash; "
              "ha egyáltalán megvan."},
        {"h": "A tűzriadó utáni kérdés",
         "p": "Kiürítés volt. Bent maradt-e valaki az Önök területéről? Ki volt a "
              "tűzvédelmi felelős? Ez ma szóban hangzik el a gyülekezőhelyen, "
              "és sehol nem rögzül."},
        {"h": "A kárügy bizonyítéka",
         "p": "Egy takarítás vagy költöztetés során kár keletkezik. A biztosítói "
              "kárrendezéshez jegyzőkönyv kell, tanúval, aláírással, pontos "
              "időintervallummal &ndash; napokkal később már nem rekonstruálható."},
    ],
    "fix_title": "Amit ezután kap &ndash; kérés nélkül",
    "solutions": [
        {"h": "Kulcs- és kártyaátadás, aláírással", "tag": "Jegyzőkönyv-típus",
         "p": "Minden kiadás és visszavétel dokumentálva: azonosító, cég/munkahely, "
              "kiadás és visszavétel időpontja, a felvevő igazolványszáma. Három aláírás "
              "&ndash; felvevő, leadó, visszavevő &ndash; a PDF-be ágyazva."},
        {"h": "Bérlőnkénti kiürítési nyilvántartás", "tag": "Jegyzőkönyv-típus",
         "p": "Tűzriadó vagy kiürítés esetén az Önök cége külön tételként rögzül: "
              "bent maradt-e valaki, és ki volt a tűzvédelmi felelős &ndash; az ő "
              "aláírásával. Ez az a dokumentum, amit egy hatósági vizsgálat kér."},
        {"h": "Kárfelvételi jegyzőkönyv, teljes adattartalommal", "tag": "Jegyzőkönyv-típus",
         "p": "Esemény időintervalluma, helyszín, tárgy, a károkozó teljes azonosító "
              "adatai, tanú, eseményleírás, és hogy beismerte-e. Aláírja a károkozó, "
              "a biztonsági szolgálat és a képviselő. Biztosítói kárrendezéshez "
              "használható formában, azonnal."},
        {"h": "Talált tárgy nyilvántartás", "tag": "Jegyzőkönyv-típus",
         "p": "A megtalált tárgy leírása, az észlelés helye és ideje, kiadáskor pedig "
              "az átvevő teljes adatlapja és aláírása. Nincs többé &bdquo;valaki elvitte "
              "a portáról&rdquo; helyzet."},
        {"h": "Gépjármű beléptető napló", "tag": "Jegyzőkönyv-típus",
         "p": "A telephelyre belépő és kilépő járművek naplózása rendszámmal, "
              "céggel, be- és kilépési időponttal &ndash; szállítmány- vagy "
              "parkolási vita esetén visszakereshető."},
        {"h": "Igazolt bejárás az Önök szintjén is", "tag": "NFC-checkpoint",
         "p": "A szolgálat a folyosókon elhelyezett NFC-matricákat olvassa be. "
              "Ha felmerül a kérdés, hogy hajnalban járt-e ott őr, az üzemeltető "
              "időbélyeges listával tud válaszolni &ndash; nem emlékezetből."},
    ],
    "facts_title": "A költségoldal &ndash; hogy arányában lássa",
    "facts": [
        ("6 667 Ft", "a rendszer havi díjának egy bérlőre eső része egy 18 bérlős irodaházban"),
        ("&lt; 0,3%", "ugyanez egy 400 m&sup2;-es iroda havi bérleti díjához viszonyítva"),
        ("10", "jogilag strukturált jegyzőkönyv-típus, aláírt PDF-ként azonnal letölthető"),
    ],
    "mods_title": "Amit érdemes az üzemeltetőtől kérnie",
    "mods_lead": "A rendszert nem Ön rendeli meg &ndash; de Ön tudja kikötni, hogy mit lásson belőle.",
    "mods": [
        ("Másolatot minden Önöket érintő jegyzőkönyvről", "kulcsátadás, kárfelvétel, "
         "talált tárgy, kiürítési nyilvántartás &ndash; PDF-ként, az esemény napján, nem hónap végén."),
        ("A kiürítési nyilvántartás bérlői sorát", "tűzvédelmi felelősük nevével és "
         "aláírásával &ndash; ez az Önök tűzvédelmi dokumentációjának is része."),
        ("Bejárás-igazolást vitás esetben", "az Önök szintjén elhelyezett checkpont "
         "időbélyeges beolvasási listáját &ndash; nem folyamatosan, hanem konkrét kérdésre."),
        ("Kulcsnyilvántartás-kivonatot", "évente egyszer: mely kulcsaik és kártyáik vannak "
         "a portán nyilvántartva, és azok legutóbbi ellenőrzésének eredménye."),
        ("Amit NEM kérhet", "az őrszolgálat beosztását, GPS-pozícióit vagy belső "
         "teljesítménymutatóit &ndash; ezek a szolgáltató munkajogi és üzleti adatai."),
    ],
    "quote": "<strong>A lényeg röviden:</strong> Önöknek ebből nem lesz többletfeladata. "
             "Az egyetlen változás az, hogy ami eddig szóban vagy egy füzetben történt, "
             "az ezután aláírt PDF-ként keletkezik &ndash; és fél év múlva is előkereshető, "
             "amikor a biztosító vagy egy hatóság kérdez.",
    "cta": {
        "h": "Amit a bérlői kapcsolattartótól kérünk",
        "p": "A bevezetéshez az Önök oldaláról összesen három adat kell:",
        "bullets": [
            "<strong>A tűzvédelmi felelősük neve és elérhetősége</strong> &ndash; hogy a "
            "kiürítési nyilvántartásban az Önök sora előre kitöltve, a megfelelő "
            "aláíróval jelenjen meg.",
            "<strong>A jelenleg a portán tárolt kulcsaik és kártyáik listája</strong> &ndash; "
            "az induló leltár összevetéséhez. Ha eltérés van, azt most a legolcsóbb tisztázni.",
            "<strong>Egy e-mail-cím</strong>, ahová az Önöket érintő jegyzőkönyvek "
            "másolata automatikusan megy.",
            "Ezt az üzemeltetőnek vagy a biztonsági szolgálat vezetőjének küldje &ndash; "
            "a beállítást ők végzik el.",
        ],
    },
    "footnote": "Bérlői tájékoztató &ndash; a rendszert az épület üzemeltetője vezeti be.",
}

P5_EMAIL = """# Irodaházi bérlő &ndash; kommunikációs csomag

> **Pozicionálás:** a bérlő nem vevő. Két szerepe van: (1) **érték-igazoló** &ndash; ha ő
> kéri a dokumentációt, az üzemeltetőnek indoka lesz megrendelni; (2) **elfogadó** &ndash;
> a bevezetés nem ütközhet bérlői ellenállásba. A hangnem ezért nem eladás, hanem
> szolgáltatási szint-tájékoztatás. Az árazás csak arányában jelenik meg.

---

## Tárgymező-variációk

1. `[Épület neve]: változás a kulcs- és jegyzőkönyv-kezelésben &ndash; amit Önöknek jelent`
2. `Kiürítési nyilvántartás bérlőnként &ndash; egy adatot kérnénk Önöktől`
3. `Aláírt jegyzőkönyv minden kulcsátadásról &ndash; a portaszolgálat digitális átállása`

---

## E-mail &ndash; fő változat (üzemeltető / PM aláírásával megy ki)

**Tárgy:** [Épület neve]: változás a kulcs- és jegyzőkönyv-kezelésben &ndash; amit Önöknek jelent

Tisztelt [Név]!

Az épület biztonsági szolgálata a következő hetekben digitális nyilvántartásra áll át.
Ez az Önök oldaláról **nem jár teendővel**, de érdemes tudni, mi változik &ndash; mert
néhány olyan helyzetben lesz jelentősége, ahol eddig nem volt mire hivatkozni.

**Ami eddig szóban vagy füzetben történt, ezután aláírt dokumentum lesz:**

- **Kulcs- és kártyaátadás.** Minden kiadás és visszavétel rögzül: azonosító, cég,
  időpont, a felvevő igazolványszáma, és három aláírás &ndash; felvevő, leadó,
  visszavevő &ndash; a PDF-be ágyazva. A "kinél van a tartalék kulcsunk" kérdésre
  ezután van válasz.
- **Kiürítés és tűzriadó.** Az Önök cége külön tételként szerepel a kiürítési
  nyilvántartásban: bent maradt-e valaki, és ki volt a tűzvédelmi felelős &ndash;
  az ő aláírásával. Ez az a dokumentum, amit egy hatósági vizsgálat kér, és ami
  az Önök tűzvédelmi dokumentációjának is része.
- **Kárfelvétel.** Ha az Önök területén kár keletkezik, a jegyzőkönyv az esemény napján
  elkészül: időintervallum, helyszín, a károkozó azonosító adatai, tanú, eseményleírás.
  Biztosítói kárrendezéshez használható formában &ndash; nem napokkal később,
  emlékezetből rekonstruálva.
- **Talált tárgy.** Leírás, az észlelés helye és ideje, kiadáskor pedig az átvevő
  adatlapja és aláírása.
- **Bejárás-igazolás.** A szolgálat a folyosókon elhelyezett NFC-matricákat olvassa be.
  Ha felmerül a kérdés, hogy hajnalban járt-e ott őr, időbélyeges listával tudunk
  válaszolni.

**Amit Önöktől kérnénk &ndash; összesen három adat:**

1. A **tűzvédelmi felelősük neve és elérhetősége**, hogy a kiürítési nyilvántartásban
   az Önök sora előre kitöltve, a megfelelő aláíróval jelenjen meg.
2. A **jelenleg a portán tárolt kulcsaik és kártyáik listája** &ndash; az induló leltár
   összevetéséhez. Ha eltérés van a nyilvántartásunkhoz képest, azt most a legegyszerűbb
   tisztázni.
3. Egy **e-mail-cím**, ahová az Önöket érintő jegyzőkönyvek másolata automatikusan megy.

Ezt a hármat elég egy válaszlevélben visszaküldeni. A beállítást mi végezzük el.

Üdvözlettel,
[Név] &ndash; [Üzemeltető / Ingatlankezelő]

---

## E-mail &ndash; változat, ha a bérlő fizet a szolgáltatásból (költségallokációs helyzet)

**Tárgy:** A biztonsági szolgáltatás fejlesztése &ndash; a bérlőre eső költség arányában

Tisztelt [Név]!

Az épület biztonsági szolgálatának digitális nyilvántartására áttérünk. Mivel a
közös költség terhére valósul meg, leírom az arányokat is, hogy megítélhető legyen.

**A rendszer díja 120 000 Ft/hó az épületre.** Ez [18] bérlő között megosztva
nagyságrendileg **6 700 Ft/hó bérlőnként**, ami egy 400 m&sup2;-es iroda havi bérleti
díjának kevesebb mint 0,3%-a.

**Amit ezért kap:** aláírt, azonnal letölthető jegyzőkönyvet minden kulcsátadásról,
kárfelvételről, talált tárgyról és kiürítésről; bérlőnkénti kiürítési nyilvántartást
a tűzvédelmi felelősük aláírásával; és időbélyeges bejárás-igazolást, ha vitás kérdés
merül fel.

**Amit ezért nem kap:** hozzáférést az őrszolgálat beosztásához, GPS-adataihoz vagy
belső teljesítménymutatóihoz &ndash; ezek a szolgáltató munkajogi és üzleti adatai,
és ez így is helyes.

Ha az arányokat vagy a dokumentum-típusokat részletesebben látná, szívesen átküldöm
a bérlői adatlapot.

Üdvözlettel,
[Név]

---

## Kifogáskezelési útmutató

| Amit mond | Ami mögötte van | Ahogy érdemes válaszolni |
|---|---|---|
| "Miért kell nekünk ezzel foglalkozni?" | Teher-érzet, jogos. | "Nem kell &ndash; három adatot kérünk egyszer, és utána semmit. A változás nálunk történik. Önöknél annyi, hogy ha kérdés merül fel egy kulcsról vagy egy kárügyről, lesz mire hivatkozni." |
| "Ez a közös költséget emeli." | Költségaggály. | Ne kerüljük meg. "Igen, a szolgáltatási díjban jelentkezik. Bérlőnként nagyságrendileg 6 700 Ft/hó, ami egy 400 m&sup2;-es iroda bérleti díjának 0,3%-a alatt van. Egyetlen vitatott kárügy vagy egy elveszett kulcs miatti zárcsere ennek a többszöröse &ndash; és eddig ezekben nem volt mire hivatkozni." |
| "Nekünk saját beléptető rendszerünk van." | Redundancia-érzet. | "Az az Önök területére való bejutást szabályozza. Ez nem beléptető rendszer, hanem az őrszolgálat munkájának dokumentálása: bejárás-igazolás, jegyzőkönyv, kulcsnyilvántartás. A kettő nem fedi egymást &ndash; az Önök rendszere nem tud kárfelvételi jegyzőkönyvet készíteni aláírásokkal." |
| "Adatvédelmileg mi lesz a mi adatainkkal?" | GDPR-kérdés, jogos. | "A jegyzőkönyvekben az szerepel, ami eddig is a papíron: név, cég, aláírás &ndash; annyi, amennyit a dokumentum típusa megkövetel. Az aláírásképek pedig fájlként kizárólag a PDF elkészültéig léteznek, utána véglegesen törlődnek. Az Önök adataihoz csak a szolgáltató és az üzemeltető fér hozzá, ugyanúgy, mint ma." |
| "Ez a portásnak lesz jó, nem nekünk." | Nem látja a saját hasznát. | "Egy konkrét helyzettel: ha holnap egy takarítás közben kár keletkezik az irodájukban, ma egy kézzel írt lap készül, amit a biztosító nagy eséllyel visszadob. Ezután egy strukturált jegyzőkönyv készül a károkozó adataival és három aláírással, ugyanaznap PDF-ben, az Önök postafiókjában." |
| "Nem akarunk még egy rendszert használni." | Rendszer-fáradtság. | "Nem is fognak. Nincs felület, amit meg kellene tanulniuk, és nincs belépés. Az Önöket érintő dokumentumok e-mailben érkeznek PDF-ként. Ennyi." |

---

## Beszélgetés-nyitók (bérlői fórumra, éves egyeztetésre)

- "Meg tudja mondani, hogy jelenleg hány kulcsuk és kártyájuk van a portán, és mikor ellenőrizte ezt bárki utoljára?"
- "A legutóbbi tűzriadónál rögzítette valaki írásban, hogy az Önök területéről mindenki kijött?"
- "Volt olyan kárügyük az épületben, ahol a dokumentáció hiánya miatt hosszabb lett a kárrendezés?"
"""

# ===========================================================================
# 6. MEGBÍZÓK / TULAJDONOSOK / CÉGVEZETŐK
# ===========================================================================
P6 = {
    "dir": "06_Megbizok_Tulajdonosok_Cegvezetok",
    "role": "Megbízó / épülettulajdonos / vagyonvédelmi cégtulajdonos",
    "accent": "#3b82f6",
    "accent_dark": "#1d4ed8",
    "accent_soft": "#eff6ff",
    "accent_light": "#60a5fa",
    "kicker": "Vezetői döntéselőkészítő &middot; Tulajdonosi adatlap",
    "title": "A platformdíj egy 24/7-es őrposzt havi árbevételének 6,8%-a.",
    "subtitle": "Ez az adatlap nem funkciólista. Azt vezeti le, hogy a "
                "120 000 Ft/helyszín/hó hol térül meg: adminisztrációs önköltségben, "
                "érvényesíthető óradíjban, kárvita-kockázatban és ügyfélmegtartásban.",
    "meta": [
        ("Listás díj", PRICE),
        ("Elszámolási egység", "Helyszín (lépcsőház / épület)"),
        ("Viszonyítás", "Az őrposzt havi árbevételének 6,8%-a"),
    ],
    "pains_title": "Ami ma a mérlegben nem látszik",
    "pains_lead": "Három tétel, amit ma senki nem könyvel, de mindhárom valós pénz.",
    "pains": [
        {"h": "A tenderen nincs differenciátor",
         "p": "Egy pályázaton az óradíj és a referencia dönt. Ha a szolgáltatás "
              "önmagában megkülönböztethetetlen, az ár lefelé megy &ndash; "
              "évről évre, a fedezet rovására."},
        {"h": "Az SLA-vita bizonyíték nélkül",
         "p": "A megbízó azt állítja, hogy az éjszakai bejárás nem történt meg. "
              "Bizonyíték egyik oldalon sincs. Ilyenkor a szolgáltató enged &ndash; és "
              "díjkorrekcióval, rosszabb esetben az ügyfél elvesztésével fizet érte."},
        {"h": "A dokumentálatlan kárügy",
         "p": "Egy kárfelvétel hiányos, kézzel írt lapon készült. A biztosító "
              "visszadobja, a megbízó a szolgáltatón keresi. Egyetlen ilyen ügy "
              "elviheti egy helyszín éves fedezetét."},
    ],
    "fix_title": "Amit a platform üzletileg megold",
    "solutions": [
        {"h": "Digitális teljesítés-igazolás mint ajánlati elem", "tag": "Értékesítési eszköz",
         "p": "Tenderen nem az óradíjjal, hanem a bizonyíthatósággal versenyez: "
              "időbélyeges NFC-bejárás-lista, jóváhagyott napi jelentés, "
              "aláírt PDF-jegyzőkönyv, teljes auditnapló. Ez az, amit egy "
              "megbízó ma sehol nem kap meg &ndash; és amiért hajlandó fizetni."},
        {"h": "Megnyerhető kárvita", "tag": "Kockázatcsökkentés",
         "p": "10 jogilag strukturált jegyzőkönyv-típus, digitális aláírással, "
              "az esemény napján elkészült PDF-ben. Az aláíráskép fájlként "
              "kizárólag a PDF elkészültéig létezik, utána véglegesen törlődik &ndash; "
              "ez adatvédelmi szempontból is védhető megoldás."},
        {"h": "Csökkenő adminisztrációs önköltség", "tag": "Működési hatékonyság",
         "p": "Az őri papírmunka és a vezetői adatgyűjtés nagy része megszűnik: "
              "az adat ott keletkezik, ahol a munka történik. Biztonsági vezetőnként "
              "átlagosan 25 óra/hó visszanyert kapacitás &ndash; ez nem elbocsátás, "
              "hanem több felügyelhető helyszín ugyanannyi vezetővel."},
        {"h": "Objektív vezetői kontrolling", "tag": "Teljesítmény modul",
         "p": "Irodaházankénti és vezetőnkénti pontszám nyílt képlettel "
              "(oktatottság mínusz fluktuációs büntetés), célkitűzéssel és hat havi "
              "trenddel. A fluktuáció korai észlelése önmagában milliós tétel."},
        {"h": "Skálázás új ügyfélre percek alatt", "tag": "Több céges architektúra",
         "p": "Új cég felvétele azonnal létrehozza a teljesen elkülönített, saját "
              "adatbázist. Nincs külön telepítés, nincs helyszíni szerver &ndash; "
              "az akvizíció nem informatikai projekt."},
        {"h": "Belső tudás azonnal elérhetővé téve", "tag": "AI-tudásbázis",
         "p": "A cég saját szabályzatai, ügyrendjei alapján válaszoló asszisztens &ndash; "
              "kizárólag a feltöltött dokumentumokból, találgatás nélkül. "
              "Csökkenti a betanítási időt és a vezetőkre eső kérdés-terhelést."},
    ],
    "facts_title": "A három szám, ami a döntéshez kell",
    "facts": [
        ("6,8%", "a platformdíj egy 24/7-es őrposzt havi megbízói árbevételéhez képest"),
        ("+41 600 Ft", "modellezett nettó havi eredmény helyszínenként a díj levonása után"),
        ("1,7", "ennyi helyszín éves platformdíját fedezi egyetlen megtartott "
                "ügyfél-helyszín éves fedezete"),
    ],
    "roi": {
        "title": "Megtérülési levezetés &ndash; helyszínszint, havi bontásban",
        "lead": "Egy 24/7-ben ellátott őrposzt (730 óra/hó) modellje. Minden érték "
                "iparági becslés &ndash; a saját adataival felülírandó.",
        "head": ["Tétel", "Havi érték", "Levezetés"],
        "rows": [
            {"label": "Helyszín havi megbízói árbevétele (viszonyítási alap)",
             "value": "1 752 000 Ft", "note": "730 óra &times; 2 400 Ft/óra megbízói ár"},
            {"label": "Platformdíj", "value": "&minus;120 000 Ft",
             "note": "az árbevétel 6,8%-a"},
            {"label": "Megszűnő őri adminisztráció",
             "value": "+45 000 Ft", "note": "25 óra/hó &times; 1 800 Ft őrzési önköltség"},
            {"label": "Visszanyert vezetői kapacitás (helyszínre vetítve)",
             "value": "+23 000 Ft", "note": "5,2 óra/hó &times; 4 500 Ft vezetői önköltség"},
            {"label": "Papír, nyomtatás, iktatás, archiválás",
             "value": "+6 000 Ft", "note": "jegyzőkönyv-, jelentés- és füzetkezelés"},
            {"label": "Érvényesíthető óradíj-emelés a digitális teljesítés-igazolásért",
             "value": "+87 600 Ft", "note": "az árbevétel 5%-a &ndash; konzervatív, tenderen érvelhető"},
            {"label": "Modellezett nettó havi eredmény helyszínenként",
             "value": "+41 600 Ft", "note": "a díj levonása után; 40 helyszínen 20,0 MFt/év", "sum": True},
        ],
        "assumptions": "730 óra/hó = 365&times;24/12, azaz egy folyamatosan ellátott poszt. "
                       "A megbízói óradíj (2 400 Ft), az őrzési önköltség (1 800 Ft) és a "
                       "vezetői önköltség (4 500 Ft) tapasztalati értékek. Az 5%-os "
                       "óradíj-emelés az a tétel, amit szerződéskötéskor vagy árfelülvizsgálatkor "
                       "érvényesíteni kell &ndash; enélkül a modell &minus;46 000 Ft/hó/helyszín, "
                       "és a megtérülés a lentebbi kockázati oldalra tolódik.",
    },
    "mods_title": "A kockázati oldal &ndash; cégszinten, éves bontásban",
    "mods_lead": "A fenti táblázat az ismétlődő tételeket tartalmazza. Az alábbiak "
                 "ritkábbak, de egyenként nagyobbak. 40 helyszínes modell.",
    "mods": [
        ("Egyetlen megnyert kárvita", "800 000 &ndash; 5 000 000 Ft. Strukturált, aláírt, "
         "az esemény napján kelt jegyzőkönyv nélkül a bizonyítási teher gyakorlatilag a "
         "szolgáltatóra hárul."),
        ("Egy megelőzött generálkulcs-vesztés", "400 000 &ndash; 1 200 000 Ft zárcsere. "
         "A napi tételes kulcsellenőrzés a hiányt aznap, nem hetekkel később jelzi."),
        ("Egy megtartott ügyfél-helyszín", "&asymp; 2 500 000 Ft éves fedezet "
         "(21 MFt éves árbevétel, 12%-os fedezeti hányad) &ndash; ez 1,7 helyszín "
         "teljes éves platformdíja."),
        ("Fluktuáció korai észlelése", "&asymp; 1 700 000 Ft/év 120 fős állománynál, "
         "ha a mutató a fluktuációt 50%-ról 42%-ra viszi (180 000 Ft/fő pótlási költséggel)."),
        ("Amit nem ígérünk", "a platform nem csökkenti az őrzési létszámot és nem "
         "helyettesíti a szakmai felügyeletet. Ha az üzleti eset kizárólag "
         "létszám-megtakarításra épülne, az nem állná meg a helyét."),
    ],
    "quote": "<strong>A döntés valódi kérdése nem az, hogy 120 000 Ft sok-e.</strong> "
             "Az, hogy egy 1,75 millió forintos havi árbevételű helyszínen megéri-e "
             "6,8%-ot arra fordítani, hogy a teljesítés bizonyítható legyen &ndash; "
             "tenderen, kárvitában és SLA-egyeztetésen egyaránt.",
    "cta": {
        "h": "Következő lépés &ndash; 3 helyszínes, 60 napos próbaüzem",
        "p": "Nem éves elköteleződés. Egy mérhető szakasz, előre rögzített kilépési ponttal.",
        "bullets": [
            "<strong>Terjedelem:</strong> 3 helyszín, teljes funkcionalitással &ndash; "
            "NFC-checkpontok, jegyzőkönyvek, Vezénylés, teljesítmény-mutató. "
            "Nem korlátozott próbaverzió.",
            "<strong>Előre rögzített sikerkritériumok:</strong> bejárás-lefedettség, "
            "jegyzőkönyv-átfutási idő, vezetői időráfordítás &ndash; a 0. napon mérve "
            "és a 60. napon újramérve.",
            "<strong>Amit mi hozunk:</strong> beállítás, adatmigráció (Excel-beosztás import, "
            "kulcs-/kártyaleltár), munkatársi tájékoztató anyag, oktatási modul.",
            "<strong>Amit Öntől kérünk:</strong> 3 helyszín kijelölése, egy operatív "
            "kapcsolattartó, és hogy a 60. napon a számok alapján döntsünk &ndash; "
            "akár nemmel is.",
        ],
    },
    "footnote": "Vezetői döntéselőkészítő &ndash; minden érték modellszámítás, "
                "nem szerződéses vállalás.",
}

P6_EMAIL = """# Megbízó / épülettulajdonos / vagyonvédelmi cégtulajdonos &ndash; értékesítési csomag

> **Pozicionálás:** ez az egyetlen szerepkör, ahol a **pénz nyelvén** kell beszélni,
> és ahol a funkciólista aktívan árt. Az érv szerkezete: viszonyítás (a díj az árbevétel
> hány százaléka) &rarr; ismétlődő megtakarítás &rarr; érvényesíthető árbevétel-oldal
> &rarr; kockázati oldal &rarr; mérhető pilot kilépési ponttal.
>
> **Kritikus:** a modell ismétlődő tételei önmagukban nem fedik a díjat (74 000 Ft
> a 120 000-ből). Ezt mi mondjuk ki elsőként &ndash; ha a másik fél találja meg, elveszett
> a hitelesség. A hiányzó részt az érvényesíthető óradíj-emelés és a kockázati oldal fedi.

---

## Tárgymező-variációk

1. `120 000 Ft/helyszín &ndash; egy 1,75 milliós árbevételű posztra vetítve 6,8%`
2. `Amit egyetlen elvesztett SLA-vita kerül &ndash; és mi az alternatíva ára`
3. `3 helyszín, 60 nap, előre rögzített kilépési pont &ndash; javaslat a demó után`

---

## E-mail &ndash; fő változat

**Tárgy:** 120 000 Ft/helyszín &ndash; egy 1,75 milliós árbevételű posztra vetítve 6,8%

Kedves [Név]!

A bemutatón végigmentünk a modulokon. Az Ön pozíciójából viszont nem a funkciók
a kérdés, hanem az, hogy megéri-e. Ezért most nem funkciókról írok, hanem
levezetem a számot &ndash; a gyenge pontjaival együtt.

**A viszonyítási alap.** Egy 24/7-ben ellátott őrposzt havi 730 órát jelent. 2 400 Ft-os
megbízói óradíjjal ez **1 752 000 Ft havi árbevétel helyszínenként**. A platform díja
120 000 Ft, azaz **ennek 6,8%-a**. A kérdés innentől az, hogy ez a 6,8% megtérül-e.

**Ami ismétlődően megtakarítható (helyszínenként, havonta):**

| Tétel | Havi érték | Alap |
|---|---:|---|
| Megszűnő őri adminisztráció | 45 000 Ft | 25 óra &times; 1 800 Ft önköltség |
| Visszanyert vezetői kapacitás | 23 000 Ft | 5,2 óra &times; 4 500 Ft |
| Papír, nyomtatás, iktatás, archiválás | 6 000 Ft | jegyzőkönyv- és jelentéskezelés |
| **Összesen** | **74 000 Ft** | |

**Itt megállok, mert ez fontos: ez a 74 000 Ft önmagában nem fedezi a 120 000 Ft-ot.**
Ha valaki azt állítja Önnek, hogy egy ilyen rendszer pusztán adminisztrációs
megtakarításból megtérül, az nem számolt utána. A hiányzó 46 000 Ft két helyről jöhet.

**Az első: az árbevételi oldal.** A digitális teljesítés-igazolás &ndash; időbélyeges
NFC-bejárás-lista, jóváhagyott napi jelentés, aláírt PDF-jegyzőkönyv, teljes auditnapló
&ndash; olyan szolgáltatási elem, amit a piacon ma kevesen tudnak felmutatni. Ez tenderen
és árfelülvizsgálatnál érvényesíthető. **Konzervatívan 5%-os óradíj-emelés = 87 600 Ft/hó
helyszínenként.** Ezzel a modell nettó **+41 600 Ft/hó/helyszín**, 40 helyszínen
kb. 20 MFt/év.

Hangsúlyozom: **ez az a tétel, amit Önnek kell érvényesítenie.** Ha nem érvényesíti,
a modell mínusz 46 000 Ft/hó/helyszín, és a megtérülés áttolódik a következő pontra.

**A második: a kockázati oldal.** Ezek ritkábbak, de egyenként nagyobbak:

- **Egy megnyert kárvita:** 800 000 &ndash; 5 000 000 Ft. Strukturált, aláírt,
  az esemény napján kelt jegyzőkönyv nélkül a bizonyítási teher gyakorlatilag a
  szolgáltatóra hárul.
- **Egy megelőzött generálkulcs-vesztés:** 400 000 &ndash; 1 200 000 Ft zárcsere.
  A napi tételes ellenőrzés a hiányt aznap jelzi, nem hetekkel később.
- **Egy megtartott ügyfél-helyszín:** kb. 2 500 000 Ft éves fedezet (21 MFt árbevétel,
  12%-os fedezeti hányad) &ndash; **ez 1,7 helyszín teljes éves platformdíja.**
  Egyetlen bizonyíték nélkül elvesztett SLA-vita ennyibe kerül.

**Amit nem ígérek:** a rendszer nem csökkenti az őrzési létszámot, és nem helyettesíti
a szakmai felügyeletet. Ha az üzleti eset létszám-megtakarításra épülne, nem állná meg
a helyét, és nem is így adom el.

**A javaslatom: 3 helyszín, 60 nap, előre rögzített kilépési ponttal.** Teljes
funkcionalitással, nem korlátozott próbaverzióval. A sikerkritériumokat a 0. napon
együtt rögzítjük &ndash; bejárás-lefedettség, jegyzőkönyv-átfutási idő, vezetői
időráfordítás &ndash;, a 60. napon pedig ugyanezeket újramérjük, és a számok alapján
döntünk. Akár nemmel is.

A beállítást, az adatmigrációt (Excel-beosztás, kulcs- és kártyaleltár), a munkatársi
tájékoztató anyagot és az oktatási modult mi hozzuk. Öntől három helyszín kijelölését
és egy operatív kapcsolattartót kérek.

Melyik három helyszín lenne erre a legalkalmasabb? Ha megnevezi, a részletes
pilot-tervet 48 órán belül átküldöm.

Üdvözlettel,
[Név]

**P.S.** A teljes ROI-levezetést &ndash; a fenti táblázattal, a kockázati oldallal és
minden feltételezéssel &ndash; egy A4-es adatlapon csatoltam. Az összes szám iparági
becslés; ha átküldi a saját óradíjait és önköltségeit, egy nap alatt újraszámoljuk
a valós adataira.

---

## Követő e-mail (+5 nap)

**Tárgy:** Re: a 6,8% &ndash; egy kérdés, ami eldönti

Kedves [Név]!

Nem küldök újabb anyagot. Egyetlen kérdésem van, mert erre a modell egésze épül:

**A jelenlegi ügyfélportfóliójában van olyan szerződés, ahol az utóbbi két évben
árcsökkentést vagy díjkorrekciót kellett elfogadnia, mert nem tudta bizonyítani
a teljesítést?**

Ha igen, kérem mondja meg a nagyságrendjét &ndash; és a modellt arra az esetre
számolom újra. Az általános ROI-tábla ilyenkor felesleges: egyetlen valós ügy
konkrétabban dönt.

Ha nem volt ilyen, akkor a kockázati oldal Önnél nem érv, és marad az árbevételi
oldal &ndash; arról viszont érdemes elmondania, hogy a következő árfelülvizsgálatnál
mire tud hivatkozni ma.

Üdvözlettel,
[Név]

---

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
- "Ha holnap egy megbízója kárigénnyel áll elő egy három hete történt eseményre, mennyi idő alatt tud dokumentumot letenni az asztalra &ndash; és milyet?"
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
"""

# ---------------------------------------------------------------------------
PERSONAS = [
    (P1, P1_EMAIL),
    (P2, P2_EMAIL),
    (P3, P3_EMAIL),
    (P4, P4_EMAIL),
    (P5, P5_EMAIL),
    (P6, P6_EMAIL),
]

README = """# GTM Marketing Pack &ndash; KulcsNyilvántartó Platform

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
"""


def main():
    ap = argparse.ArgumentParser(description="GTM Marketing Pack generátor")
    ap.add_argument("--pdf", action="store_true", help="PDF is készüljön (WeasyPrint)")
    args = ap.parse_args()

    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    (OUTPUT_ROOT / "00_README.md").write_text(README, encoding="utf-8")

    written = []
    for persona, email_md in PERSONAS:
        d = OUTPUT_ROOT / persona["dir"]
        d.mkdir(parents=True, exist_ok=True)

        md_path = d / "email_es_outreach.md"
        md_path.write_text(email_md, encoding="utf-8")
        written.append(md_path)

        html_path = d / "adatlap_szorolap.html"
        html_path.write_text(render_flyer(persona), encoding="utf-8")
        written.append(html_path)

        if args.pdf:
            try:
                from weasyprint import HTML  # noqa: PLC0415
                pdf_path = d / "adatlap_szorolap.pdf"
                HTML(filename=str(html_path)).write_pdf(str(pdf_path))
                written.append(pdf_path)
            except ImportError:
                print("[!] WeasyPrint nincs telepítve - PDF kihagyva. "
                      "Telepites: pip install weasyprint", file=sys.stderr)
                args.pdf = False
            except Exception as exc:  # noqa: BLE001
                print("[!] PDF hiba (%s): %s" % (html_path.name, exc), file=sys.stderr)

    print("GTM Marketing Pack -> %s" % OUTPUT_ROOT)
    for p in written:
        print("  + %s" % p.relative_to(OUTPUT_ROOT.parent))
    print("\n%d fajl, %d szerepkor." % (len(written) + 1, len(PERSONAS)))


if __name__ == "__main__":
    main()
