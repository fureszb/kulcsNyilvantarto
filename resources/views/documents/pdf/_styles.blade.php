<style>
    /* dompdf-kompatibilis, sima CSS — NINCS flexbox/grid/Tailwind, mindent
       <table>-alapú elrendezéssel oldunk meg. A paletta a webes felület
       sötét/amber design-rendszerét követi (letterhead-stílusú fejléc). */
    * { box-sizing: border-box; }
    body {
        font-family: 'DejaVu Sans', sans-serif;
        font-size: 10.5px;
        color: #1e293b;
        margin: 0;
        padding: 0;
    }
    table { border-collapse: collapse; width: 100%; }

    /* Fejléc */
    .doc-header-accent { height: 5px; background-color: #d97706; }
    .doc-header-table td { vertical-align: middle; }
    .doc-header-bar {
        background-color: #0f172a;
        color: #ffffff;
        padding: 16px 24px;
    }
    .doc-header-eyebrow {
        font-size: 8px;
        font-weight: bold;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #fbbf24;
        margin: 0 0 4px 0;
    }
    .doc-header-title { font-size: 18px; font-weight: bold; margin: 0; color: #ffffff; }
    .doc-header-sub { font-size: 9px; color: #94a3b8; margin: 3px 0 0 0; }
    .doc-header-meta { font-size: 8.5px; color: #cbd5e1; text-align: right; line-height: 1.7; }
    .doc-header-meta b { color: #fbbf24; }

    /* Törzs */
    .doc-body { padding: 20px 24px; }
    .section { margin-bottom: 16px; }
    .section-label {
        font-size: 8.5px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #92400e;
        background-color: #fffbeb;
        border-left: 3px solid #d97706;
        padding: 5px 10px;
        margin-bottom: 8px;
    }
    .field-table td { padding: 5px 8px; vertical-align: top; border-bottom: 1px solid #f1f5f9; }
    .field-table tr:last-child td { border-bottom: none; }
    .field-label { color: #64748b; font-size: 8.5px; width: 34%; text-transform: uppercase; letter-spacing: 0.03em; }
    .field-value { color: #0f172a; font-size: 10.5px; font-weight: bold; }
    .text-block {
        white-space: pre-wrap;
        line-height: 1.6;
        color: #334155;
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        padding: 10px 12px;
        margin: 0;
    }

    /* Aláírások */
    .sign-table td { width: 33.33%; padding: 6px; vertical-align: top; }
    .sign-box {
        border: 1px solid #e2e8f0;
        border-bottom: 2px solid #d97706;
        border-radius: 4px;
        height: 72px;
        text-align: center;
        vertical-align: middle;
        background-color: #fffdf7;
    }
    .sign-box img { max-height: 60px; max-width: 100%; }
    .sign-box-empty { color: #cbd5e1; font-size: 8px; font-style: italic; }
    .sign-role {
        font-size: 8.5px;
        font-weight: bold;
        color: #475569;
        text-align: center;
        margin: 5px 0 0 0;
        text-transform: uppercase;
        letter-spacing: 0.04em;
    }

    /* Lábléc */
    .doc-footer-bar {
        border-top: 2px solid #f1f5f9;
        padding: 10px 24px;
        font-size: 7.5px;
        color: #94a3b8;
    }
    .doc-footer-table td { vertical-align: middle; }
</style>
