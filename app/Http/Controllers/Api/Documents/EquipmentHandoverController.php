<?php

namespace App\Http\Controllers\Api\Documents;

use App\Http\Controllers\Api\Controller;
use App\Http\Controllers\Api\Documents\Concerns\BuildsDocumentResponse;
use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\DocumentEquipmentHandover;
use App\Services\DocumentPdfService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EquipmentHandoverController extends Controller
{
    use BuildsDocumentResponse;

    private function detailPayload(DocumentEquipmentHandover $detail): array
    {
        return [
            'equipment_name'             => $detail->equipment_name,
            'issued_at'                  => optional($detail->issued_at)->toIso8601String(),
            'issued_to_name'             => $detail->issued_to_name,
            'issuer_security_service'    => $detail->issuer_security_service,
            'returned_at'                => optional($detail->returned_at)->toIso8601String(),
            'returned_by_name'           => $detail->returned_by_name,
            'receiver_security_service'  => $detail->receiver_security_service,
        ];
    }

    public function show(Request $request, Document $document)
    {
        abort_unless($document->document_type === 'eszkoz_atadas_atvetel', 404);
        $user = $request->user();
        abort_if(!$user->canManage() && $user->id !== $document->created_by_user_id, 403);

        $document->load(['signatures', 'attachments']);

        return response()->json([
            'document' => $this->documentBase($document),
            'detail'   => $this->detailPayload($document->equipmentHandover),
        ]);
    }

    public function store(Request $request, DocumentPdfService $pdfService)
    {
        $user = $request->user();
        abort_unless($user->canCreateDocuments(), 403);

        $data = $request->validate([
            'location_id'               => ['nullable', 'integer', 'exists:tenant.locations,id'],
            'equipment_name'            => ['required', 'string', 'max:255'],
            'issued_at'                 => ['required', 'date'],
            'issued_to_name'            => ['required', 'string', 'max:255'],
            'issuer_security_service'   => ['required', 'string', 'max:255'],
            'returned_at'               => ['nullable', 'date'],
            'returned_by_name'          => ['nullable', 'string', 'max:255'],
            'receiver_security_service' => ['nullable', 'string', 'max:255'],
        ]);

        $tenant = app('tenant');

        $document = DB::transaction(function () use ($data, $user) {
            $document = Document::create([
                'document_type'      => 'eszkoz_atadas_atvetel',
                'location_id'        => $data['location_id'] ?? null,
                'created_by_user_id' => $user->id,
                'status'             => 'draft',
            ]);

            DocumentEquipmentHandover::create([
                'document_id'                => $document->id,
                'equipment_name'             => $data['equipment_name'],
                'issued_at'                  => $data['issued_at'],
                'issued_to_name'             => $data['issued_to_name'],
                'issuer_security_service'    => $data['issuer_security_service'],
                'returned_at'                => $data['returned_at'] ?? null,
                'returned_by_name'           => $data['returned_by_name'] ?? null,
                'receiver_security_service'  => $data['receiver_security_service'] ?? null,
            ]);

            return $document;
        });

        try {
            $pdfPath = $pdfService->generate($document, $tenant->slug, $tenant->name);
        } catch (\Throwable $e) {
            Log::error('Dokumentum PDF generálás sikertelen: ' . $e->getMessage());
            return response()->json(['message' => 'A PDF generálása sikertelen volt. Próbálja újra.'], 500);
        }

        $document->update(['pdf_path' => $pdfPath, 'status' => 'finalized', 'finalized_at' => now()]);

        ActivityLog::record('document.created', $user, 'Eszközök átadás-átvétele rögzítve', [
            'document_id'   => $document->id,
            'document_type' => $document->document_type,
        ]);

        $document->load(['signatures', 'attachments']);

        return response()->json([
            'document' => $this->documentBase($document),
            'detail'   => $this->detailPayload($document->equipmentHandover),
        ], 201);
    }
}
