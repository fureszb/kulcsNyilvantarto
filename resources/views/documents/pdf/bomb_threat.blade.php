<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    @include('documents.pdf._styles')
</head>
<body>
    @include('documents.pdf._header', ['title' => 'Robbantással fenyegetés', 'document' => $document, 'tenantName' => $tenantName])

    <div class="doc-body">
        <div class="section">
            <div class="section-label">Elhangzott beszélgetés leírása</div>
            <p class="text-block">{{ $detail->call_transcript }}</p>
        </div>

        <div class="section">
            <div class="section-label">A hívó jellemzői</div>
            <table class="field-table">
                <tr><td class="field-label">Neme</td><td class="field-value">{{ $detail->callerGenderLabel() }}</td></tr>
                <tr><td class="field-label">Életkora</td><td class="field-value">{{ $detail->callerAgeGroupLabel() }}</td></tr>
                <tr><td class="field-label">Beszédstílusa</td><td class="field-value">{{ $detail->speechStyleLabel() }}</td></tr>
                <tr><td class="field-label">Hangszíne</td><td class="field-value">{{ $detail->voiceToneLabel() }}</td></tr>
                <tr><td class="field-label">Érzelmi állapota</td><td class="field-value">{{ $detail->emotionalStateLabel() }}</td></tr>
                <tr><td class="field-label">Háttérzaj</td><td class="field-value">{{ $detail->backgroundNoiseLabel() }}</td></tr>
                <tr><td class="field-label">Területi jártasság</td><td class="field-value">{{ $detail->areaFamiliarityLabel() }}</td></tr>
            </table>
        </div>

        @if ($detail->other_remarks)
            <div class="section">
                <div class="section-label">Egyéb észrevételek</div>
                <p class="text-block">{{ $detail->other_remarks }}</p>
            </div>
        @endif

        <div class="section">
            <div class="section-label">Hívás adatai</div>
            <table class="field-table">
                <tr><td class="field-label">Hívás dátuma</td><td class="field-value">{{ $detail->call_datetime->format('Y.m.d. H:i') }}</td></tr>
                <tr><td class="field-label">Hívó száma</td><td class="field-value">{{ $detail->caller_phone_number ?? '—' }}</td></tr>
            </table>
        </div>

        <div class="section">
            <div class="section-label">Hívást fogadta</div>
            <table class="field-table">
                <tr><td class="field-label">Név</td><td class="field-value">{{ $detail->receiver_name }}</td></tr>
                <tr><td class="field-label">Beosztás</td><td class="field-value">{{ $detail->receiver_position }}</td></tr>
                <tr><td class="field-label">Születési idő</td><td class="field-value">{{ $detail->receiver_birth_date->format('Y.m.d.') }}</td></tr>
                <tr><td class="field-label">Anyja neve</td><td class="field-value">{{ $detail->receiver_mother_name }}</td></tr>
                <tr><td class="field-label">Lakcím</td><td class="field-value">{{ $detail->receiver_address }}</td></tr>
                <tr><td class="field-label">Szem. ig. szám</td><td class="field-value">{{ $detail->receiver_id_card_number }}</td></tr>
            </table>
        </div>

        @include('documents.pdf._signatures', ['roles' => [
            ['key' => 'hivast_fogado', 'label' => 'Hívást fogadó'],
        ]])
    </div>

    @include('documents.pdf._footer', ['document' => $document, 'tenantName' => $tenantName])
</body>
</html>
