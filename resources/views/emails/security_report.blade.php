<!DOCTYPE html>
<html lang="hu">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Napi Jelentés</title>
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
                  <span style="font-size:12px;font-weight:700;color:#fb7185;letter-spacing:0.08em;text-transform:uppercase;">{{ $tenantName }} · Biztonsági Szolgálat</span>
                  <h1 style="margin:6px 0 0;font-size:22px;font-weight:800;color:#ffffff;line-height:1.2;">Napi Jelentés</h1>
                  <p style="margin:6px 0 0;font-size:14px;color:#94a3b8;">{{ $report->report_date->locale('hu')->translatedFormat('Y. F j., l') }}</p>
                  <p style="margin:4px 0 0;font-size:13px;color:#cbd5e1;">Készítette: <strong style="color:#ffffff;">{{ $report->prepared_by }}</strong></p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        {{-- Átadás-átvétel --}}
        @if($report->taken_over_from || $report->handover_time)
        <tr>
          <td style="background-color:#fff1f2;padding:16px 32px;border-left:4px solid #f43f5e;">
            <p style="margin:0;font-size:13px;font-weight:700;color:#be123c;text-transform:uppercase;letter-spacing:0.06em;">Átadás-átvétel</p>
            @if($report->taken_over_from)
            <p style="margin:6px 0 0;font-size:14px;color:#1e293b;">
              Átvette a szolgálatot: <strong>{{ $report->prepared_by }}</strong>
              &nbsp;←&nbsp; <strong>{{ $report->taken_over_from }}</strong>
              @if($report->handover_time)<span style="color:#64748b;"> ({{ $report->handover_time }})</span>@endif
            </p>
            @endif
          </td>
        </tr>
        @endif

        {{-- Body --}}
        <tr>
          <td style="background-color:#ffffff;padding:24px 32px 8px;">

            {{-- Mai csapat --}}
            @if(!empty($report->service_members))
            <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;">Mai csapat</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:20px;">
              <tr style="background-color:#f8fafc;">
                <td style="padding:8px 12px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;">Beosztás</td>
                <td style="padding:8px 12px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;">Név</td>
                <td style="padding:8px 12px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;">Időtartam</td>
              </tr>
              @foreach($report->service_members as $m)
              <tr style="border-top:1px solid #f1f5f9;">
                <td style="padding:8px 12px;font-size:13px;color:#64748b;">{{ $m['beosztás'] ?? '–' }}</td>
                <td style="padding:8px 12px;font-size:13px;color:#1e293b;font-weight:600;">{{ $m['nev'] ?? '–' }}</td>
                <td style="padding:8px 12px;font-size:12px;color:#94a3b8;font-family:monospace;">{{ ($m['idő_tól'] ?? '') }}–{{ ($m['idő_ig'] ?? '') }}</td>
              </tr>
              @endforeach
            </table>
            @endif

            {{-- Tegnapi csapat --}}
            @if(!empty($report->previous_shift_members))
            <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;">Tegnapi / átadó csapat</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:20px;">
              <tr style="background-color:#f8fafc;">
                <td style="padding:8px 12px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;">Beosztás</td>
                <td style="padding:8px 12px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;">Név</td>
                <td style="padding:8px 12px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;">Időtartam</td>
              </tr>
              @foreach($report->previous_shift_members as $m)
              <tr style="border-top:1px solid #f1f5f9;">
                <td style="padding:8px 12px;font-size:13px;color:#64748b;">{{ $m['beosztás'] ?? '–' }}</td>
                <td style="padding:8px 12px;font-size:13px;color:#1e293b;font-weight:600;">{{ $m['nev'] ?? '–' }}</td>
                <td style="padding:8px 12px;font-size:12px;color:#94a3b8;font-family:monospace;">{{ ($m['idő_tól'] ?? '') }}–{{ ($m['idő_ig'] ?? '') }}</td>
              </tr>
              @endforeach
            </table>
            @endif

            {{-- Rendkívüli események --}}
            @if(!empty($report->incidents))
            <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#be123c;text-transform:uppercase;letter-spacing:0.08em;">Rendkívüli események ({{ count($report->incidents) }})</p>
            @foreach($report->incidents as $inc)
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
              <tr>
                <td width="60" valign="top" style="padding:8px 12px;background:#fff1f2;border-radius:8px 0 0 8px;font-size:12px;font-weight:700;color:#f43f5e;font-family:monospace;">{{ $inc['időpont'] ?? '–' }}</td>
                <td style="padding:8px 12px;background:#fff7f7;border-radius:0 8px 8px 0;font-size:13px;color:#1e293b;">{{ $inc['leírás'] ?? '–' }}</td>
              </tr>
            </table>
            @endforeach
            @else
            <p style="margin:0 0 20px;font-size:13px;color:#94a3b8;">Nem volt rendkívüli esemény.</p>
            @endif

          </td>
        </tr>

        {{-- Footer --}}
        <tr>
          <td style="background-color:#f8fafc;border-radius:0 0 16px 16px;padding:16px 32px;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
              Ez az email automatikusan lett kiküldve a <strong style="color:#64748b;">{{ $tenantName }}</strong> rendszeréből.
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>
