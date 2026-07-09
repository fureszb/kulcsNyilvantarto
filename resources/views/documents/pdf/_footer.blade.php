<div class="doc-footer-bar">
    <table class="doc-footer-table">
        <tr>
            <td>{{ $tenantName }} &mdash; Dokumentum #{{ $document->id }}</td>
            <td style="text-align: right;">Létrehozta: {{ $document->createdBy?->name ?? 'Ismeretlen' }}</td>
        </tr>
    </table>
</div>
