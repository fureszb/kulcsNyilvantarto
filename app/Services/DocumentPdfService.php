<?php

namespace App\Services;

use App\Models\Document;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

/**
 * A típusonkénti Blade sablonból (resources/views/documents/pdf/{type}.blade.php)
 * állítja elő a végleges PDF-et. A dokumentum aláírásainak fájljait base64-be
 * ágyazza a renderelés előtt — a fájlok törlése (purge) NEM ennek a service-nek
 * a felelőssége, azt a controller végzi a sikeres mentés UTÁN.
 */
class DocumentPdfService
{
    private const VIEWS = [
        'feljegyzeses_jegyzokonyv' => 'documents.pdf.incident_report',
        'gepjarmu_beleptetes' => 'documents.pdf.vehicle_entry',
        'eszkoz_atadas_atvetel' => 'documents.pdf.equipment_handover',
        'karfelveteli_jegyzokonyv' => 'documents.pdf.damage_report',
        'kiuritesi_jegyzokonyv' => 'documents.pdf.evacuation_report',
        'kiuritesi_nyilvantartas' => 'documents.pdf.evacuation_registry',
        'kulcs_kartya_atadas_atvetel' => 'documents.pdf.key_card_handover',
        'talalt_targy_jegyzokonyv' => 'documents.pdf.lost_found_report',
        'robbantasi_fenyegetes' => 'documents.pdf.bomb_threat',
        'tuzkulcs_tuzkazetta_kiadas' => 'documents.pdf.fire_key_issuance',
    ];

    public function generate(Document $document, string $tenantSlug, string $tenantName): string
    {
        $view = self::VIEWS[$document->document_type] ?? null;

        abort_if($view === null, 500, "Ismeretlen dokumentumtípus: {$document->document_type}");

        $signatureImages = [];
        foreach ($document->signatures as $signature) {
            if ($signature->signature_path && Storage::disk('local')->exists($signature->signature_path)) {
                $binary = Storage::disk('local')->get($signature->signature_path);
                $signatureImages[$signature->role] = 'data:image/png;base64,' . base64_encode($binary);
            }
        }

        $pdf = Pdf::loadView($view, [
            'document' => $document,
            'detail' => $document->detail(),
            'signatureImages' => $signatureImages,
            'attachments' => $document->attachments,
            'tenantName' => $tenantName,
        ])->setPaper('a4', 'portrait');

        $path = "documents/{$tenantSlug}/pdfs/{$document->id}.pdf";
        Storage::disk('local')->put($path, $pdf->output());

        return $path;
    }
}
