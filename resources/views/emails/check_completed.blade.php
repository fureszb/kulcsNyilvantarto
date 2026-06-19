<!DOCTYPE html>
<html lang="hu">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ellenőrzési összesítő</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;-webkit-font-smoothing:antialiased;">

@php
    $checkedCount = $check->checkItems->where('is_checked', true)->count();
    $total        = $check->checkItems->count();
    $missCount    = $total - $checkedCount;
    $allOk        = $missCount === 0;
    $tenantName   = app()->bound('tenant') ? app('tenant')->name : 'KK Nyilvántartó';
@endphp

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 16px;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        {{-- HEADER --}}
        <tr>
          <td style="background-color:#0f172a;border-radius:16px 16px 0 0;padding:28px 36px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.08em;">{{ $tenantName }}</p>
                  <h1 style="margin:0;font-size:22px;font-weight:800;color:#ffffff;line-height:1.3;">Kulcs & Kártya Ellenőrzési Összesítő</h1>
                  <p style="margin:6px 0 0;font-size:13px;color:#64748b;">{{ $check->created_at->format('Y. F j., H:i') }}</p>
                </td>
                <td align="right" valign="middle" style="padding-left:16px;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="48" height="48" align="center" valign="middle"
                          style="background-color:{{ $allOk ? '#16a34a' : '#dc2626' }};border-radius:50%;width:48px;height:48px;">
                        <span style="font-size:22px;font-weight:900;color:#ffffff;line-height:1;">{{ $allOk ? '✓' : '!' }}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        {{-- STATUS BANNER --}}
        <tr>
          <td style="background-color:{{ $allOk ? '#f0fdf4' : '#fef2f2' }};border-left:4px solid {{ $allOk ? '#16a34a' : '#dc2626' }};padding:14px 36px;">
            <p style="margin:0;font-size:14px;font-weight:700;color:{{ $allOk ? '#15803d' : '#b91c1c' }};">
              @if($allOk)
                Minden tétel megvolt – az ellenőrzés hiánytalanul lezárult.
              @else
                Figyelem: {{ $missCount }} tétel hiányzott az ellenőrzés során!
              @endif
            </p>
          </td>
        </tr>

        {{-- BODY --}}
        <tr>
          <td style="background-color:#ffffff;padding:28px 36px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">

            {{-- Meta grid --}}
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td width="50%" style="padding-right:8px;padding-bottom:8px;">
                  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px 16px;">
                    <p style="margin:0;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.07em;">Helyszín</p>
                    <p style="margin:3px 0 0;font-size:14px;font-weight:700;color:#0f172a;">{{ $check->location->name }}</p>
                  </div>
                </td>
                <td width="50%" style="padding-left:8px;padding-bottom:8px;">
                  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px 16px;">
                    <p style="margin:0;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.07em;">Ellenőrizte</p>
                    <p style="margin:3px 0 0;font-size:14px;font-weight:700;color:#0f172a;">{{ $check->checked_by }}</p>
                  </div>
                </td>
              </tr>
              <tr>
                <td width="50%" style="padding-right:8px;">
                  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px 16px;">
                    <p style="margin:0;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.07em;">Felelős személy</p>
                    <p style="margin:3px 0 0;font-size:14px;font-weight:700;color:#0f172a;">{{ $check->location->responsible_person ?? '–' }}</p>
                  </div>
                </td>
                <td width="50%" style="padding-left:8px;">
                  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px 16px;">
                    <p style="margin:0;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.07em;">Dátum & idő</p>
                    <p style="margin:3px 0 0;font-size:14px;font-weight:700;color:#0f172a;">{{ $check->created_at->format('Y.m.d H:i') }}</p>
                  </div>
                </td>
              </tr>
            </table>

            {{-- Summary numbers --}}
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td width="33%" align="center" style="padding-right:6px;">
                  <div style="background:#f0fdf4;border-radius:10px;padding:16px 8px;text-align:center;">
                    <p style="margin:0;font-size:30px;font-weight:800;color:#16a34a;line-height:1;">{{ $checkedCount }}</p>
                    <p style="margin:4px 0 0;font-size:11px;color:#15803d;font-weight:600;">Megvolt</p>
                  </div>
                </td>
                <td width="33%" align="center" style="padding:0 3px;">
                  <div style="background:{{ $missCount > 0 ? '#fef2f2' : '#f8fafc' }};border-radius:10px;padding:16px 8px;text-align:center;">
                    <p style="margin:0;font-size:30px;font-weight:800;color:{{ $missCount > 0 ? '#dc2626' : '#94a3b8' }};line-height:1;">{{ $missCount }}</p>
                    <p style="margin:4px 0 0;font-size:11px;color:{{ $missCount > 0 ? '#b91c1c' : '#94a3b8' }};font-weight:600;">Hiányzó</p>
                  </div>
                </td>
                <td width="33%" align="center" style="padding-left:6px;">
                  <div style="background:#eff6ff;border-radius:10px;padding:16px 8px;text-align:center;">
                    <p style="margin:0;font-size:30px;font-weight:800;color:#2563eb;line-height:1;">{{ $total }}</p>
                    <p style="margin:4px 0 0;font-size:11px;color:#1d4ed8;font-weight:600;">Összesen</p>
                  </div>
                </td>
              </tr>
            </table>

            {{-- Items table --}}
            <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.07em;">Tételek részletezése</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
              <thead>
                <tr style="background-color:#f8fafc;">
                  <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid #e2e8f0;">Megnevezés</th>
                  <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid #e2e8f0;">Típus</th>
                  <th style="padding:10px 16px;text-align:center;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid #e2e8f0;">Állapot</th>
                </tr>
              </thead>
              <tbody>
                @foreach($check->checkItems as $ci)
                <tr style="background-color:{{ $loop->even ? '#f8fafc' : '#ffffff' }};">
                  <td style="padding:11px 16px;font-size:13px;font-weight:600;color:#1e293b;{{ !$loop->last ? 'border-bottom:1px solid #f1f5f9;' : '' }}">{{ $ci->item->name }}</td>
                  <td style="padding:11px 16px;font-size:13px;color:#64748b;{{ !$loop->last ? 'border-bottom:1px solid #f1f5f9;' : '' }}">{{ $ci->item->type === 'card' ? '💳 Kártya' : '🔑 Kulcs' }}</td>
                  <td style="padding:11px 16px;text-align:center;{{ !$loop->last ? 'border-bottom:1px solid #f1f5f9;' : '' }}">
                    @if($ci->is_checked)
                      <span style="display:inline-block;background:#dcfce7;color:#15803d;font-size:11px;font-weight:700;padding:3px 12px;border-radius:999px;">Megvolt</span>
                    @else
                      <span style="display:inline-block;background:#fee2e2;color:#b91c1c;font-size:11px;font-weight:700;padding:3px 12px;border-radius:999px;">Hiányzik</span>
                    @endif
                  </td>
                </tr>
                @endforeach
              </tbody>
            </table>

            {{-- Notes --}}
            @if($check->notes)
            <div style="margin-top:20px;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 18px;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:.06em;">Megjegyzés</p>
              <p style="margin:0;font-size:13px;color:#78350f;">{{ $check->notes }}</p>
            </div>
            @endif

          </td>
        </tr>

        {{-- FOOTER --}}
        <tr>
          <td style="background-color:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px;padding:16px 36px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#94a3b8;">{{ $tenantName }} &mdash; Automatikusan generált összesítő &mdash; Ne válaszoljon erre az emailre</p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>
