<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    @include('documents.pdf._styles')
</head>
<body>
    @include('documents.pdf._header', ['title' => 'Talált tárgy jegyzőkönyv', 'document' => $document, 'tenantName' => $tenantName])

    <div class="doc-body">
        <div class="section">
            <div class="section-label">Alapadatok</div>
            <table class="field-table">
                <tr><td class="field-label">Tárgy</td><td class="field-value">{{ $detail->subject }}</td></tr>
                <tr><td class="field-label">Rögzítés időpontja</td><td class="field-value">{{ $detail->recorded_at->format('Y.m.d. H:i') }}</td></tr>
                <tr><td class="field-label">Helye</td><td class="field-value">{{ $detail->location_text }}</td></tr>
            </table>
        </div>

        <div class="section">
            <div class="section-label">Jelen vannak</div>
            <table class="field-table">
                <tr><td class="field-label">Képviselő</td><td class="field-value">{{ $detail->representative?->name ?? '—' }}</td></tr>
                <tr><td class="field-label">Tanú</td><td class="field-value">{{ $detail->witness?->name ?? '—' }}</td></tr>
                <tr><td class="field-label">Biztonsági őr</td><td class="field-value">{{ $detail->guard?->name ?? '—' }}</td></tr>
            </table>
        </div>

        <div class="section">
            <div class="section-label">A talált tárgy tartalma</div>
            <p class="text-block">{{ $detail->content_description }}</p>
        </div>

        <div class="section">
            <div class="section-label">Átvétel</div>
            <table class="field-table">
                <tr><td class="field-label">Átvétel időpontja</td><td class="field-value">{{ $detail->handed_over_at?->format('Y.m.d. H:i') ?? '—' }}</td></tr>
                <tr><td class="field-label">Név</td><td class="field-value">{{ $detail->recipient_name }}</td></tr>
                <tr><td class="field-label">Fényképes igazolvány száma</td><td class="field-value">{{ $detail->recipient_id_card_number }}</td></tr>
                <tr><td class="field-label">Lakcím</td><td class="field-value">{{ $detail->recipient_address }}</td></tr>
            </table>
        </div>

        @include('documents.pdf._signatures', ['roles' => [
            ['key' => 'atvevo', 'label' => 'Átvevő'],
        ]])
    </div>

    @include('documents.pdf._footer', ['document' => $document, 'tenantName' => $tenantName])
</body>
</html>
