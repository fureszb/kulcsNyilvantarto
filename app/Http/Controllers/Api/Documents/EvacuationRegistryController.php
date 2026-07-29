<?php

namespace App\Http\Controllers\Api\Documents;

use App\Http\Controllers\Api\Controller;
use App\Http\Controllers\Api\Documents\Concerns\BuildsDocumentResponse;
use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\DocumentEvacuationRegistry;
use App\Models\DocumentSignature;
use App\Services\DocumentPdfService;
use App\Services\DocumentSignatureService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EvacuationRegistryController extends Controller
{
    use BuildsDocumentResponse;

    private function detailPayload(DocumentEvacuationRegistry $detail): array
    {
        return [
            'tenant_name'               => $detail->tenant_name,
            'remained_in_building'      => $detail->remained_in_building,
            'fire_safety_officer_name'  => $detail->fire_safety_officer_name,
        ];
    }

    public function show(Request $request, Document $document)
    {
        abort_unless($document->document_type === 'kiuritesi_nyilvantartas', 404);
        $user = $request->user();
        abort_if(!$user->canManage() && $user->id !== $document->created_by_user_id, 403);

        $document->load(['signatures', 'attachments']);

        return response()->json([
            'document' => $this->documentBase($document),
            'detail'   => $this->detailPayload($document->evacuationRegistry),
        ]);
    }

    public function store(Request $request, DocumentSignatureService $signatureService, DocumentPdfService $pdfService)
    {
        $user = $request->user();
        abort_unless($user->canCreateDocuments(), 403);

        $data = $request->validate([
            'location_id'               => ['nullable', 'integer', 'exists:tenant.locations,id'],
            'tenant_name'               => ['required', 'string', 'max:255'],
            'remained_in_building'      => ['nullable', 'string', 'max:2000'],
            'fire_safety_officer_name'  => ['required', 'string', 'max:255'],
            'signature_base64'          => ['required', 'string', 'regex:/^data:image\/png;base64,/'],
        ]);

        $tenant = app('tenant');

        $document = DB::transaction(function () use ($data, $user, $tenant, $signatureService) {
            $document = Document::create([
                'document_type'      => 'kiuritesi_nyilvantartas',
                'location_id'        => $data['location_id'] ?? null,
                'created_by_user_id' => $user->id,
                'status'             => 'draft',
            ]);

            DocumentEvacuationRegistry::create([
                'document_id'               => $document->id,
                'tenant_name'               => $data['tenant_name'],
                'remained_in_building'      => $data['remained_in_building'] ?? null,
                'fire_safety_officer_name'  => $data['fire_safety_officer_name'],
            ]);

            $path = $signatureService->storeTemp($data['signature_base64'], $tenant->slug, 'tuzvedelmi_felelos');
            DocumentSignature::create([
                'document_id'    => $document->id,
                'role'           => 'tuzvedelmi_felelos',
                'signature_path' => $path,
                'signed_at'      => now(),
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

        foreach ($document->signatures as $signature) {
            $signatureService->purge($signature);
        }

        ActivityLog::record('document.created', $user, 'Kiürítési nyilvántartás rögzítve', [
            'document_id'   => $document->id,
            'document_type' => $document->document_type,
        ]);

        $document->load(['signatures', 'attachments']);

        return response()->json([
            'document' => $this->documentBase($document),
            'detail'   => $this->detailPayload($document->evacuationRegistry),
        ], 201);
    }
}
