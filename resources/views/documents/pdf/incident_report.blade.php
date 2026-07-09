<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    @include('documents.pdf._styles')
</head>
<body>
    @include('documents.pdf._header', ['title' => 'Feljegyzéses jegyzőkönyv', 'document' => $document, 'tenantName' => $tenantName])

    <div class="doc-body">
        <div class="section">
            <div class="section-label">Alapadatok</div>
            <table class="field-table">
                <tr>
                    <td class="field-label">Rögzítés időpontja</td>
                    <td class="field-value">{{ $detail->recorded_at->format('Y.m.d. H:i') }}</td>
                </tr>
                <tr>
                    <td class="field-label">Helye</td>
                    <td class="field-value">{{ $detail->location_text }}</td>
                </tr>
                <tr>
                    <td class="field-label">Jelen vannak (vagyonőrök)</td>
                    <td class="field-value">{{ $detail->guards->pluck('name')->join(', ') }}</td>
                </tr>
            </table>
        </div>

        <div class="section">
            <div class="section-label">Esemény leírása</div>
            <p class="text-block">{{ $detail->event_description }}</p>
        </div>

        @include('documents.pdf._signatures', ['roles' => [
            ['key' => 'jegyzokonyv_vezeto', 'label' => 'Jegyzőkönyv vezető'],
            ['key' => 'tanu', 'label' => 'Tanú'],
            ['key' => 'kepviselo', 'label' => 'Képviselő'],
        ]])
    </div>

    @include('documents.pdf._footer', ['document' => $document, 'tenantName' => $tenantName])
</body>
</html>
