<!DOCTYPE html>
<html lang="hu">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Oktatás eredménye</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 16px;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        {{-- Header --}}
        <tr>
          <td style="background-color:#1e293b;border-radius:16px 16px 0 0;padding:28px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="font-size:13px;font-weight:600;color:#94a3b8;letter-spacing:0.05em;text-transform:uppercase;">{{ $tenantName }}</span>
                  <h1 style="margin:6px 0 0;font-size:22px;font-weight:800;color:#ffffff;line-height:1.2;">Oktatás elvégezve</h1>
                  <p style="margin:4px 0 0;font-size:14px;color:#94a3b8;">{{ $training->title }}</p>
                  <p style="margin:6px 0 0;font-size:13px;color:#cbd5e1;">Kitöltő: <strong style="color:#ffffff;">{{ $participantName }}</strong></p>
                </td>
                <td align="right" valign="top">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="56" height="56" align="center" valign="middle"
                          style="background-color:#4f46e5;border-radius:50%;width:56px;height:56px;">
                        <span style="font-size:26px;line-height:1;">🎓</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        {{-- Score card --}}
        <tr>
          <td style="background-color:#ffffff;padding:28px 32px 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="50%" style="padding-right:8px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;">
                    <tr>
                      <td align="center">
                        <span style="font-size:36px;font-weight:800;color:#16a34a;">{{ $firstTryCount }}/{{ $totalSteps }}</span>
                        <br>
                        <span style="font-size:12px;color:#15803d;font-weight:600;">első kísérletből helyes</span>
                      </td>
                    </tr>
                  </table>
                </td>
                <td width="50%" style="padding-left:8px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px;">
                    <tr>
                      <td align="center">
                        <span style="font-size:36px;font-weight:800;color:#2563eb;">{{ $totalSteps }}/{{ $totalSteps }}</span>
                        <br>
                        <span style="font-size:12px;color:#1d4ed8;font-weight:600;">teljesített lépés</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <p style="margin:16px 0 0;font-size:13px;color:#64748b;text-align:center;">
              Elvégezve: <strong style="color:#1e293b;">{{ $completedAt }}</strong>
            </p>
          </td>
        </tr>

        {{-- Results table --}}
        <tr>
          <td style="background-color:#ffffff;padding:24px 32px 0;">
            <h2 style="margin:0 0 12px;font-size:15px;font-weight:700;color:#1e293b;">Részletes eredmény</h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <tr style="background-color:#f8fafc;">
                <td style="padding:10px 12px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #e2e8f0;">#</td>
                <td style="padding:10px 12px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #e2e8f0;">Kérdés</td>
                <td align="center" style="padding:10px 12px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #e2e8f0;white-space:nowrap;">Kísérlet</td>
                <td align="center" style="padding:10px 12px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #e2e8f0;">Eredmény</td>
              </tr>
              @foreach($results as $i => $r)
              <tr style="background-color:{{ $loop->even ? '#f8fafc' : '#ffffff' }};">
                <td style="padding:10px 12px;font-size:13px;color:#94a3b8;border-bottom:1px solid #f1f5f9;vertical-align:top;">{{ $i + 1 }}</td>
                <td style="padding:10px 12px;font-size:13px;color:#1e293b;border-bottom:1px solid #f1f5f9;vertical-align:top;">{{ $r['question'] }}</td>
                <td align="center" style="padding:10px 12px;font-size:13px;border-bottom:1px solid #f1f5f9;vertical-align:top;white-space:nowrap;">
                  @if($r['attempts'] === 1)
                    <span style="color:#16a34a;font-weight:700;">1×</span>
                  @else
                    <span style="color:#ea580c;font-weight:700;">{{ $r['attempts'] }}×</span>
                  @endif
                </td>
                <td align="center" style="padding:10px 12px;border-bottom:1px solid #f1f5f9;vertical-align:top;">
                  @php $correct = $r['correct'] ?? true; @endphp
                  <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                    <tr>
                      <td width="24" height="24" align="center" valign="middle"
                          style="background-color:{{ $correct ? '#16a34a' : '#dc2626' }};border-radius:50%;width:24px;height:24px;">
                        <span style="font-size:13px;font-weight:900;color:#ffffff;line-height:1;">{{ $correct ? '✓' : '✗' }}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              @endforeach
            </table>
          </td>
        </tr>

        {{-- Footer --}}
        <tr>
          <td style="background-color:#ffffff;padding:24px 32px 28px;border-radius:0 0 16px 16px;border-top:none;">
            <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
              Ez egy automatikusan generált értesítő email.<br>
              {{ $tenantName }} · Kulcs &amp; Kártya Nyilvántartó
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>
