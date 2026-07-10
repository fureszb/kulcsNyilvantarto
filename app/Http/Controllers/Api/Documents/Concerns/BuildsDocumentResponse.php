<?php

namespace App\Http\Controllers\Api\Documents\Concerns;

use App\Models\Document;

trait BuildsDocumentResponse
{
    /** @param array<int, array{role: string, image_base64: string}> $signatures */
    private function requireSignatureRoles(array $signatures, array $requiredRoles): void
    {
        $presentRoles = collect($signatures)->pluck('role')->all();
        $missing = array_diff($requiredRoles, $presentRoles);

        if ($missing) {
            abort(response()->json([
                'message' => 'Hiányzó kötelező aláírás.',
                'errors'  => ['signatures' => array_map(fn ($r) => "Hiányzik a(z) \"{$r}\" aláírás.", array_values($missing))],
            ], 422));
        }
    }

    private function documentBase(Document $document): array
    {
        return [
            'id'                 => $document->id,
            'document_type'      => $document->document_type,
            'type_label'         => $document->typeLabel(),
            'status'             => $document->status,
            'location_id'        => $document->location_id,
            'created_by_user_id' => $document->created_by_user_id,
            // A mobil kliens Bearer-token-nel hitelesítve, magával az autentikált Ktor
            // HttpClienttel tölti le ezt az URL-t (nem külső, hitelesítés nélküli
            // böngészőnek/PDF-nézőnek adja oda) — lásd `PdfDownloader`/`onOpenPdf` a Kotlin
            // oldalon. A `pdf()` action ezért változatlanul `api-tenant-auth` mögött marad.
            'pdf_url'            => $document->pdf_path ? route('api.documents.pdf', $document) : null,
            'signatures'         => $document->signatures->map(fn ($s) => [
                'id'          => $s->id,
                'document_id' => $s->document_id,
                'role'        => $s->role,
                'signer_name' => $s->signer_name,
                'signed_at'   => optional($s->signed_at)->toIso8601String(),
            ])->values(),
            'attachments'        => $document->attachments->map(fn ($a) => [
                'id'             => $a->id,
                'document_id'    => $a->document_id,
                'label'          => $a->label,
                'original_name'  => $a->original_name,
                'size_bytes'     => $a->size_bytes,
                'mime_type'      => $a->mime_type,
            ])->values(),
            'created_at'         => optional($document->created_at)->toIso8601String(),
            'finalized_at'       => optional($document->finalized_at)->toIso8601String(),
        ];
    }
}
