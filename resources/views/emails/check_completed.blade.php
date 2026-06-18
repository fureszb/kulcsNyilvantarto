<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ellenőrzési összesítő</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 24px; color: #334155; }
        .wrapper { max-width: 620px; margin: 0 auto; }
        .header { background: #1e3a5f; border-radius: 12px 12px 0 0; padding: 28px 32px; }
        .header h1 { color: #fff; margin: 0; font-size: 20px; font-weight: 700; }
        .header p { color: #93c5fd; margin: 4px 0 0; font-size: 13px; }
        .body { background: #fff; padding: 28px 32px; border: 1px solid #e2e8f0; border-top: none; }
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
        .meta-item { background: #f8fafc; border-radius: 8px; padding: 12px 16px; border: 1px solid #e2e8f0; }
        .meta-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: .05em; font-weight: 600; }
        .meta-value { font-size: 14px; color: #1e293b; font-weight: 600; margin-top: 2px; }
        h2 { font-size: 14px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: .05em; margin: 0 0 12px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        thead th { background: #f1f5f9; padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .05em; }
        tbody td { padding: 11px 14px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
        tbody tr:last-child td { border-bottom: none; }
        .badge-ok { display: inline-block; background: #dcfce7; color: #15803d; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 999px; }
        .badge-miss { display: inline-block; background: #fee2e2; color: #b91c1c; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 999px; }
        .summary { display: flex; gap: 12px; margin-bottom: 24px; }
        .summary-box { flex: 1; border-radius: 8px; padding: 14px 18px; text-align: center; }
        .summary-box .num { font-size: 28px; font-weight: 800; line-height: 1; }
        .summary-box .lbl { font-size: 12px; margin-top: 4px; }
        .ok-box { background: #f0fdf4; color: #15803d; }
        .miss-box { background: #fef2f2; color: #b91c1c; }
        .total-box { background: #eff6ff; color: #1d4ed8; }
        .notes { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 18px; font-size: 13px; color: #92400e; margin-bottom: 24px; }
        .footer-bar { background: #f8fafc; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; padding: 16px 32px; text-align: center; font-size: 11px; color: #94a3b8; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <h1>Kulcs & Kártya Ellenőrzési Összesítő</h1>
        <p>{{ $check->created_at->format('Y. F j. H:i') }}</p>
    </div>
    <div class="body">
        <div class="meta-grid">
            <div class="meta-item">
                <div class="meta-label">Helyszín</div>
                <div class="meta-value">{{ $check->location->name }}</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Felelős</div>
                <div class="meta-value">{{ $check->location->responsible_person ?? '–' }}</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Ellenőrző személy</div>
                <div class="meta-value">{{ $check->checked_by }}</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Dátum & idő</div>
                <div class="meta-value">{{ $check->created_at->format('Y.m.d H:i') }}</div>
            </div>
        </div>

        @php
            $checkedCount = $check->checkItems->where('is_checked', true)->count();
            $total = $check->checkItems->count();
            $missCount = $total - $checkedCount;
        @endphp
        <div class="summary">
            <div class="summary-box ok-box">
                <div class="num">{{ $checkedCount }}</div>
                <div class="lbl">Megvolt</div>
            </div>
            <div class="summary-box miss-box">
                <div class="num">{{ $missCount }}</div>
                <div class="lbl">Hiányzó</div>
            </div>
            <div class="summary-box total-box">
                <div class="num">{{ $total }}</div>
                <div class="lbl">Összes</div>
            </div>
        </div>

        <h2>Tételek részletezése</h2>
        <table>
            <thead>
                <tr>
                    <th>Megnevezés</th>
                    <th>Típus</th>
                    <th>Állapot</th>
                </tr>
            </thead>
            <tbody>
                @foreach($check->checkItems as $ci)
                <tr>
                    <td><strong>{{ $ci->item->name }}</strong></td>
                    <td>{{ $ci->item->type === 'card' ? '💳 Kártya' : '🔑 Kulcs' }}</td>
                    <td>
                        @if($ci->is_checked)
                            <span class="badge-ok">✓ Megvolt</span>
                        @else
                            <span class="badge-miss">✗ Hiányzik</span>
                        @endif
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>

        @if($check->notes)
        <div class="notes">
            <strong>Megjegyzés:</strong> {{ $check->notes }}
        </div>
        @endif
    </div>
    <div class="footer-bar">
        Kulcs & Kártya Nyilvántartó &mdash; Automatikusan generált összesítő
    </div>
</div>
</body>
</html>
