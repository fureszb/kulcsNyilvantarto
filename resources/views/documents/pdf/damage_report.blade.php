<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    @include('documents.pdf._styles')
</head>
<body>
    @include('documents.pdf._header', ['title' => 'Kárfelvételi jegyzőkönyv', 'document' => $document, 'tenantName' => $tenantName])

    <div class="doc-body">
        <div class="section">
            <div class="section-label">Alapadatok</div>
            <table class="field-table">
                <tr>
                    <td class="field-label">Rögzítés időpontja</td>
                    <td class="field-value">{{ $detail->recorded_from->format('Y.m.d. H:i') }} &ndash; {{ $detail->recorded_to->format('Y.m.d. H:i') }}</td>
                </tr>
                <tr>
                    <td class="field-label">Helye</td>
                    <td class="field-value">{{ $detail->location_text }}</td>
                </tr>
                <tr>
                    <td class="field-label">Tárgy</td>
                    <td class="field-value">{{ $detail->subject }}</td>
                </tr>
            </table>
        </div>

        <div class="section">
            <div class="section-label">Károkozó adatai</div>
            <table class="field-table">
                <tr><td class="field-label">Neve</td><td class="field-value">{{ $detail->perpetrator_name }}</td></tr>
                <tr><td class="field-label">Szig. szám</td><td class="field-value">{{ $detail->perpetrator_id_card_number }}</td></tr>
                <tr><td class="field-label">Szül. hely, idő</td><td class="field-value">{{ $detail->perpetrator_birth_place }}, {{ $detail->perpetrator_birth_date->format('Y.m.d.') }}</td></tr>
                <tr><td class="field-label">Anyja neve</td><td class="field-value">{{ $detail->perpetrator_mother_name }}</td></tr>
                <tr><td class="field-label">Lakcím</td><td class="field-value">{{ $detail->perpetrator_address }}</td></tr>
                <tr><td class="field-label">Telefon</td><td class="field-value">{{ $detail->perpetrator_phone ?? '—' }}</td></tr>
                <tr><td class="field-label">Email</td><td class="field-value">{{ $detail->perpetrator_email ?? '—' }}</td></tr>
            </table>
        </div>

        <div class="section">
            <div class="section-label">Jelen vannak</div>
            <table class="field-table">
                <tr><td class="field-label">Vagyonőr</td><td class="field-value">{{ $detail->guard?->name ?? '—' }}</td></tr>
                <tr><td class="field-label">Tanú</td><td class="field-value">{{ $detail->witness?->name ?? '—' }}</td></tr>
            </table>
        </div>

        <div class="section">
            <div class="section-label">Esemény</div>
            <p class="text-block">{{ $detail->event_description }}</p>
            <table class="field-table" style="margin-top: 6px;">
                <tr><td class="field-label">Károkozást elismerte</td><td class="field-value">{{ $detail->perpetrator_admitted ? 'Igen' : 'Nem' }}</td></tr>
            </table>
        </div>

        @include('documents.pdf._signatures', ['roles' => [
            ['key' => 'karokozo', 'label' => 'Károkozó'],
            ['key' => 'biztonsagi_szolgalat', 'label' => 'Biztonsági szolgálat'],
            ['key' => 'kepviselo', 'label' => 'Képviselő'],
        ]])
    </div>

    @include('documents.pdf._footer', ['document' => $document, 'tenantName' => $tenantName])
</body>
</html>
