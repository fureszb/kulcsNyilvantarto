<!DOCTYPE html>
<html lang="hu">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Új váltóüzenet</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;-webkit-font-smoothing:antialiased;">

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 16px;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        {{-- HEADER --}}
        <tr>
          <td style="background-color:#0f172a;border-radius:16px 16px 0 0;padding:28px 36px;">
            <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.08em;">{{ $tenantName }}</p>
            <h1 style="margin:0;font-size:22px;font-weight:800;color:#ffffff;line-height:1.3;">Új váltóüzenet érkezett</h1>
            <p style="margin:6px 0 0;font-size:13px;color:#64748b;">Csak kollégáknak szóló belső csatorna</p>
          </td>
        </tr>

        {{-- AUTHOR BANNER --}}
        <tr>
          <td style="background-color:#f0fdfa;border-left:4px solid #0d9488;padding:14px 36px;">
            <p style="margin:0;font-size:13px;color:#0f766e;">
              <strong>{{ $authorName }}</strong> új bejegyzést rögzített a váltóüzenetek között.
            </p>
          </td>
        </tr>

        {{-- BODY --}}
        <tr>
          <td style="background-color:#ffffff;padding:28px 36px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">

            <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.07em;">Üzenet tartalma</p>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px 20px;margin-bottom:28px;">
              <p style="margin:0;font-size:14px;color:#1e293b;line-height:1.7;white-space:pre-line;">{{ $noteContent }}</p>
            </div>

            <p style="margin:0 0 16px;font-size:13px;color:#64748b;text-align:center;">
              Az üzenet megtekintéséhez és válaszoláshoz jelentkezzen be:
            </p>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <a href="{{ $loginUrl }}"
                     style="display:inline-block;background-color:#0d9488;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:13px 32px;border-radius:10px;letter-spacing:.02em;">
                    Bejelentkezés
                  </a>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        {{-- FOOTER --}}
        <tr>
          <td style="background-color:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px;padding:16px 36px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#94a3b8;">{{ $tenantName }} &mdash; Automatikus értesítő &mdash; Ne válaszoljon erre az emailre</p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>
