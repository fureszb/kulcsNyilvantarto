<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    @include('documents.pdf._styles')
</head>
<body>
    @include('documents.pdf._header', ['title' => 'Kulcs/Kártya átadás-átvétele', 'document' => $document, 'tenantName' => $tenantName])

    <div class="doc-body">
        <div class="section">
            <div class="section-label">Adatok</div>
            <table class="field-table">
                <tr><td class="field-label">Kulcs/Kártya száma/megnevezése</td><td class="field-value">{{ $detail->key_card_number_or_name }}</td></tr>
                <tr><td class="field-label">Cégnév/munkavégzés helye</td><td class="field-value">{{ $detail->company_or_workplace }}</td></tr>
            </table>
        </div>

        <div class="section">
            <div class="section-label">Felvétel</div>
            <table class="field-table">
                <tr><td class="field-label">Felvétel időpontja</td><td class="field-value">{{ $detail->issued_at->format('Y.m.d. H:i') }}</td></tr>
                <tr><td class="field-label">Felvette (név)</td><td class="field-value">{{ $detail->issued_to_name }}</td></tr>
                <tr><td class="field-label">Fényképes igazolvány száma</td><td class="field-value">{{ $detail->issued_to_id_card_number }}</td></tr>
                <tr><td class="field-label">Biztonsági szolgálat</td><td class="field-value">{{ $detail->security_service ?? '—' }}</td></tr>
            </table>
        </div>

        <div class="section">
            <div class="section-label">Leadás</div>
            <table class="field-table">
                <tr><td class="field-label">Leadás ideje</td><td class="field-value">{{ $detail->returned_at?->format('Y.m.d. H:i') ?? '—' }}</td></tr>
                <tr><td class="field-label">Leadta (név)</td><td class="field-value">{{ $detail->returned_by_name ?? '—' }}</td></tr>
            </table>
        </div>

        @include('documents.pdf._signatures', ['roles' => [
            ['key' => 'felvevo', 'label' => 'Felvevő'],
            ['key' => 'leado', 'label' => 'Leadó'],
            ['key' => 'visszavevo', 'label' => 'Visszavevő'],
        ]])
    </div>

    @include('documents.pdf._footer', ['document' => $document, 'tenantName' => $tenantName])
</body>
</html>
