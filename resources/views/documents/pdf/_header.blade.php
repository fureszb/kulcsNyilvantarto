<div class="doc-header-accent"></div>
<table class="doc-header-table doc-header-bar">
    <tr>
        <td>
            <p class="doc-header-eyebrow">Fizikai biztonsági dokumentum</p>
            <p class="doc-header-title">{{ $title }}</p>
            <p class="doc-header-sub">{{ $tenantName }}</p>
        </td>
        <td class="doc-header-meta">
            Azonosító: <b>#{{ $document->id }}</b><br>
            Generálva: {{ now()->format('Y.m.d. H:i') }}
        </td>
    </tr>
</table>
