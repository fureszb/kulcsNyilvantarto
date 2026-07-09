<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    @include('documents.pdf._styles')
</head>
<body>
    @include('documents.pdf._header', ['title' => 'Kiürítési nyilvántartás', 'document' => $document, 'tenantName' => $tenantName])

    <div class="doc-body">
        <div class="section">
            <div class="section-label">Adatok</div>
            <table class="field-table">
                <tr><td class="field-label">Bérlő neve</td><td class="field-value">{{ $detail->tenant_name }}</td></tr>
                <tr><td class="field-label">Tűzvédelmi felelős</td><td class="field-value">{{ $detail->fire_safety_officer_name }}</td></tr>
            </table>
        </div>

        @if ($detail->remained_in_building)
            <div class="section">
                <div class="section-label">Bérleményben maradtak</div>
                <p class="text-block">{{ $detail->remained_in_building }}</p>
            </div>
        @endif

        @include('documents.pdf._signatures', ['roles' => [
            ['key' => 'tuzvedelmi_felelos', 'label' => 'Tűzvédelmi felelős'],
        ]])
    </div>

    @include('documents.pdf._footer', ['document' => $document, 'tenantName' => $tenantName])
</body>
</html>
