<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    @include('documents.pdf._styles')
</head>
<body>
    @include('documents.pdf._header', ['title' => 'Eszközök átadás-átvétele', 'document' => $document, 'tenantName' => $tenantName])

    <div class="doc-body">
        <div class="section">
            <div class="section-label">Eszköz</div>
            <table class="field-table">
                <tr>
                    <td class="field-label">Eszköz megnevezése</td>
                    <td class="field-value">{{ $detail->equipment_name }}</td>
                </tr>
            </table>
        </div>

        <div class="section">
            <div class="section-label">Kiadás</div>
            <table class="field-table">
                <tr>
                    <td class="field-label">Kiadás időpontja</td>
                    <td class="field-value">{{ $detail->issued_at->format('Y.m.d. H:i') }}</td>
                </tr>
                <tr>
                    <td class="field-label">Felvette (Név)</td>
                    <td class="field-value">{{ $detail->issued_to_name }}</td>
                </tr>
                <tr>
                    <td class="field-label">Bizt. szolg.</td>
                    <td class="field-value">{{ $detail->issuer_security_service }}</td>
                </tr>
            </table>
        </div>

        <div class="section">
            <div class="section-label">Visszavétel</div>
            <table class="field-table">
                <tr>
                    <td class="field-label">Visszavétel időpontja</td>
                    <td class="field-value">{{ $detail->returned_at?->format('Y.m.d. H:i') ?? '—' }}</td>
                </tr>
                <tr>
                    <td class="field-label">Leadta (név)</td>
                    <td class="field-value">{{ $detail->returned_by_name ?? '—' }}</td>
                </tr>
                <tr>
                    <td class="field-label">Bizt. szolg.</td>
                    <td class="field-value">{{ $detail->receiver_security_service ?? '—' }}</td>
                </tr>
            </table>
        </div>
    </div>

    @include('documents.pdf._footer', ['document' => $document, 'tenantName' => $tenantName])
</body>
</html>
