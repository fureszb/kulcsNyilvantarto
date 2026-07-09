<style>
    /* dompdf-kompatibilis, sima CSS — NINCS flexbox/grid/Tailwind, mindent
       <table>-alapú elrendezéssel oldunk meg. */
    * { box-sizing: border-box; }
    body {
        font-family: 'DejaVu Sans', sans-serif;
        font-size: 10.5px;
        color: #1e293b;
        margin: 0;
        padding: 0;
    }
    table { border-collapse: collapse; width: 100%; }
    .doc-header-table td { vertical-align: middle; }
    .doc-header-bar {
        background-color: #0f172a;
        color: #ffffff;
        padding: 14px 20px;
    }
    .doc-header-title { font-size: 16px; font-weight: bold; margin: 0; }
    .doc-header-sub { font-size: 9px; color: #94a3b8; margin: 2px 0 0 0; }
    .doc-header-meta { font-size: 9px; color: #cbd5e1; text-align: right; }
    .doc-body { padding: 16px 20px; }
    .section { margin-bottom: 14px; }
    .section-label {
        font-size: 8.5px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #64748b;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 3px;
        margin-bottom: 6px;
    }
    .field-table td { padding: 3px 6px 3px 0; vertical-align: top; }
    .field-label { color: #64748b; font-size: 9px; width: 34%; }
    .field-value { color: #0f172a; font-size: 10.5px; font-weight: bold; }
    .text-block { white-space: pre-wrap; line-height: 1.5; }
    .sign-table td { width: 33.33%; padding: 8px; vertical-align: top; }
    .sign-box {
        border: 1px solid #cbd5e1;
        border-radius: 4px;
        height: 70px;
        text-align: center;
        vertical-align: middle;
        background-color: #f8fafc;
    }
    .sign-box img { max-height: 60px; max-width: 100%; }
    .sign-role { font-size: 8.5px; color: #64748b; text-align: center; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.04em; }
    .doc-footer-bar {
        border-top: 1px solid #e2e8f0;
        padding: 8px 20px;
        font-size: 8px;
        color: #94a3b8;
    }
</style>
