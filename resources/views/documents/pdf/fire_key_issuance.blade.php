<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    @include('documents.pdf._styles')
</head>
<body>
    @include('documents.pdf._header', ['title' => 'Tűzkulcs és tűzkazetta kiadás', 'document' => $document, 'tenantName' => $tenantName])

    <div class="doc-body">
        <div class="section">
            <div class="section-label">Adatok</div>
            <table class="field-table">
                <tr><td class="field-label">Plomba szám/matrica szám</td><td class="field-value">{{ $detail->seal_number }}</td></tr>
                <tr><td class="field-label">Levett</td><td class="field-value">{{ $detail->seal_removed ? 'Igen' : 'Nem' }}</td></tr>
                <tr><td class="field-label">Felhelyezett</td><td class="field-value">{{ $detail->seal_applied ? 'Igen' : 'Nem' }}</td></tr>
            </table>
        </div>

        <div class="section">
            <div class="section-label">Kiadás</div>
            <table class="field-table">
                <tr><td class="field-label">Kiadás időpontja</td><td class="field-value">{{ $detail->issued_at->format('Y.m.d. H:i') }}</td></tr>
                <tr><td class="field-label">Felvétel oka</td><td class="field-value">{{ $detail->issue_reason }}</td></tr>
            </table>
        </div>

        <div class="section">
            <div class="section-label">Zárás</div>
            <table class="field-table">
                <tr><td class="field-label">Zárás időpontja</td><td class="field-value">{{ $detail->closed_at?->format('Y.m.d. H:i') ?? '—' }}</td></tr>
            </table>
        </div>

        @include('documents.pdf._signatures', ['roles' => [
            ['key' => 'felvette', 'label' => 'Felvette'],
            ['key' => 'leadta', 'label' => 'Leadta'],
        ]])
    </div>

    @include('documents.pdf._footer', ['document' => $document, 'tenantName' => $tenantName])
</body>
</html>
