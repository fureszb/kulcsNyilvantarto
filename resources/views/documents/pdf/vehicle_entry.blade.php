<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    @include('documents.pdf._styles')
</head>
<body>
    @include('documents.pdf._header', ['title' => 'Gépjármű beléptető nyilvántartás', 'document' => $document, 'tenantName' => $tenantName])

    <div class="doc-body">
        <div class="section">
            <div class="section-label">Adatok</div>
            <table class="field-table">
                <tr>
                    <td class="field-label">Rendszám</td>
                    <td class="field-value">{{ $detail->license_plate }}</td>
                </tr>
                <tr>
                    <td class="field-label">Cégnév/név</td>
                    <td class="field-value">{{ $detail->company_or_name }}</td>
                </tr>
                <tr>
                    <td class="field-label">Dátum</td>
                    <td class="field-value">{{ $detail->entry_date->format('Y.m.d.') }}</td>
                </tr>
                <tr>
                    <td class="field-label">Belépési idő</td>
                    <td class="field-value">{{ $detail->entry_time->format('H:i') }}</td>
                </tr>
                <tr>
                    <td class="field-label">Kilépési idő</td>
                    <td class="field-value">{{ $detail->exit_time?->format('H:i') ?? '—' }}</td>
                </tr>
            </table>
        </div>

        @if ($detail->notes)
            <div class="section">
                <div class="section-label">Megjegyzés</div>
                <p class="text-block">{{ $detail->notes }}</p>
            </div>
        @endif
    </div>

    @include('documents.pdf._footer', ['document' => $document, 'tenantName' => $tenantName])
</body>
</html>
