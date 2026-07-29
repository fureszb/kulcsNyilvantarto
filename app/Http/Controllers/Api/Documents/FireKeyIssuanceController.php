<?php

namespace App\Http\Controllers\Api\Documents;

use App\Http\Controllers\Api\Controller;
use App\Http\Controllers\Api\Documents\Concerns\BuildsDocumentResponse;
use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\DocumentFireKeyIssuance;
use App\Models\DocumentSignature;
use App\Services\DocumentPdfService;
use App\Services\DocumentSignatureService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FireKeyIssuanceController extends Controller
{
    use BuildsDocumentResponse;

    private function detailPayload(DocumentFireKeyIssuance $detail): array
    {
        return [
            'seal_number'   => $detail->seal_number,
            'seal_removed'  => $detail->seal_removed,
            'seal_applied'  => $detail->seal_applied,
            'issued_at'     => optional($detail->issued_at)->toIso8601String(),
            'issue_reason'  => $detail->issue_reason,
            'closed_at'     => optional($detail->closed_at)->toIso8601String(),
        ];
    }

    public function show(Request $request, Document $document)
    {
        abort_unless($document->document_type === 'tuzkulcs_tuzkazetta_kiadas', 404);
        $user = $request->user();
        abort_if(!$user->canManage() && $user->id !== $document->created_by_user_id, 403);

        $document->load(['signatures', 'attachments']);

        return response()->json([
            'document' => $this->documentBase($document),
            'detail'   => $this->detailPayload($document->fireKeyIssuance),
        ]);
    }

    public function store(Request $request, DocumentSignatureService $signatureService, DocumentPdfService $pdfService)
    {
        $user = $request->user();
        abort_unless($user->canCreateDocuments(), 403);

        $data = $request->validate([
            'location_id'               => ['nullable', 'integer', 'exists:tenant.locations,id'],
            'seal_number'               => ['required', 'string', 'max:100'],
            'seal_removed'              => ['required', 'boolean'],
            'seal_applied'              => ['required', 'boolean'],
            'issued_at'                 => ['required', 'date'],
            'issue_reason'              => ['required', 'string', 'max:2000'],
            'closed_at'                 => ['nullable', 'date'],
            'signatures'                => ['required', 'array'],
            'signatures.*.role'         => ['required', 'string', 'in:felvette,leadta'],
            'signatures.*.image_base64' => ['required', 'string', 'regex:/^data:image\/png;base64,/'],
        ]);

        $this->requireSignatureRoles($data['signatures'], ['felvette']);
        if (!empty($data['closed_at'])) {
            $this->requireSignatureRoles($data['signatures'], ['leadta']);
        }

        $tenant = app('tenant');

        $document = DB::transaction(function () use ($data, $user, $tenant, $signatureService) {
            $document = Document::create([
                'document_type'      => 'tuzkulcs_tuzkazetta_kiadas',
                'location_id'        => $data['location_id'] ?? null,
                'created_by_user_id' => $user->id,
                'status'             => 'draft',
            ]);

            DocumentFireKeyIssuance::create([
                'document_id'  => $document->id,
                'seal_number'  => $data['seal_number'],
                'seal_removed' => $data['seal_removed'],
                'seal_applied' => $data['seal_applied'],
                'issued_at'    => $data['issued_at'],
                'issue_reason' => $data['issue_reason'],
                'closed_at'    => $data['closed_at'] ?? null,
            ]);

            foreach ($data['signatures'] as $sig) {
                $path = $signatureService->storeTemp($sig['image_base64'], $tenant->slug, $sig['role']);
                DocumentSignature::create([
                    'document_id'    => $document->id,
                    'role'           => $sig['role'],
                    'signature_path' => $path,
                    'signed_at'      => now(),
                ]);
            }

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

        ActivityLog::record('document.created', $user, 'Tűzkulcs és tűzkazetta kiadás rögzítve', [
            'document_id'   => $document->id,
            'document_type' => $document->document_type,
        ]);

        $document->load(['signatures', 'attachments']);

        return response()->json([
            'document' => $this->documentBase($document),
            'detail'   => $this->detailPayload($document->fireKeyIssuance),
        ], 201);
    }
}
