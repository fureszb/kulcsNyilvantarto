<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    @include('documents.pdf._styles')
</head>
<body>
    @include('documents.pdf._header', ['title' => 'Kiürítési jegyzőkönyv', 'document' => $document, 'tenantName' => $tenantName])

    <div class="doc-body">
        <div class="section">
            <div class="section-label">Alapadatok</div>
            <table class="field-table">
                <tr><td class="field-label">Készítette</td><td class="field-value">{{ $detail->prepared_by }} ({{ $detail->prepared_by_position }})</td></tr>
                <tr><td class="field-label">Helyszín</td><td class="field-value">{{ $detail->location_text }}</td></tr>
                <tr><td class="field-label">Dátum</td><td class="field-value">{{ $detail->event_date->format('Y.m.d.') }}</td></tr>
            </table>
        </div>

        <div class="section">
            <div class="section-label">Esemény leírása</div>
            <p class="text-block">{{ $detail->event_description }}</p>
        </div>

        <div class="section">
            <div class="section-label">Riasztás és kiürítés</div>
            <table class="field-table">
                <tr><td class="field-label">Riasztás típusa</td><td class="field-value">{{ $detail->alarm_type }}</td></tr>
                <tr><td class="field-label">Riasztás oka</td><td class="field-value">{{ $detail->alarm_reason }}</td></tr>
                <tr><td class="field-label">Kiürítés típusa</td><td class="field-value">{{ $detail->evacuation_type }}</td></tr>
            </table>
        </div>

        <div class="section">
            <div class="section-label">Tűzjelző berendezések vezérlései</div>
            <p class="text-block">{{ $detail->fire_alarm_control_notes }}</p>
        </div>

        @if ($detail->deficiencies)
            <div class="section">
                <div class="section-label">Hiányosságok</div>
                <p class="text-block">{{ $detail->deficiencies }}</p>
            </div>
        @endif

        @if ($detail->guard_duty_obligations)
            <div class="section">
                <div class="section-label">Őrszolgálati kötelezettségek</div>
                <p class="text-block">{{ $detail->guard_duty_obligations }}</p>
            </div>
        @endif

        @if ($detail->tenant_obligations)
            <div class="section">
                <div class="section-label">Bérlői kötelezettségek</div>
                <p class="text-block">{{ $detail->tenant_obligations }}</p>
            </div>
        @endif

        @if ($detail->had_alarm)
            <div class="section">
                <div class="section-label">Tűzjelzés részletei</div>
                <table class="field-table">
                    <tr><td class="field-label">Mi gyulladt ki</td><td class="field-value">{{ $detail->fire_what_ignited }}</td></tr>
                    <tr><td class="field-label">Emberélet veszélyben volt-e</td><td class="field-value">{{ $detail->fire_life_in_danger }}</td></tr>
                    <tr><td class="field-label">Oltás módja</td><td class="field-value">{{ $detail->fire_extinguished_how }}</td></tr>
                    <tr><td class="field-label">Tűzoltóparancsnok érkezése</td><td class="field-value">{{ $detail->fire_commander_arrival_time?->format('Y.m.d. H:i') }}</td></tr>
                    <tr><td class="field-label">Visszaengedési protokoll</td><td class="field-value">{{ $detail->fire_reentry_protocol }}</td></tr>
                    <tr><td class="field-label">Felelős</td><td class="field-value">{{ $detail->fire_cause_responsible }}</td></tr>
                </table>
            </div>
        @else
            <div class="section">
                <div class="section-label">Riasztás hiányának részletei</div>
                <table class="field-table">
                    <tr><td class="field-label">Volt-e előjelzés</td><td class="field-value">{{ $detail->had_early_warning ? 'Igen' : 'Nem' }}</td></tr>
                    @if ($detail->had_early_warning)
                        <tr><td class="field-label">Késleltetés a sziréna előtt</td><td class="field-value">{{ $detail->delay_before_siren ? 'Igen' : 'Nem' }}</td></tr>
                        @if (!$detail->delay_before_siren)
                            <tr><td class="field-label">Ok</td><td class="field-value">{{ $detail->no_delay_reason }}</td></tr>
                            <tr><td class="field-label">Intézkedések</td><td class="field-value">{{ $detail->no_delay_corrective_actions }}</td></tr>
                        @else
                            <tr><td class="field-label">Miért nem reagáltunk időben</td><td class="field-value">{{ $detail->delay_reason_not_reacted }}</td></tr>
                        @endif
                    @endif
                </table>
            </div>
        @endif

        @if ($attachments->count() > 0)
            <div class="section">
                <div class="section-label">Csatolt dokumentumok</div>
                <table class="field-table">
                    @foreach ($attachments as $attachment)
                        <tr><td class="field-label">{{ $attachment->label }}</td><td class="field-value">{{ $attachment->original_name }}</td></tr>
                    @endforeach
                </table>
            </div>
        @endif
    </div>

    @include('documents.pdf._footer', ['document' => $document, 'tenantName' => $tenantName])
</body>
</html>
