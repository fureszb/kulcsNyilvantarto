<?php

namespace App\Http\Controllers\Api\Documents;

use App\Http\Controllers\Api\Controller;
use App\Http\Controllers\Api\Documents\Concerns\BuildsDocumentResponse;
use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\DocumentLostFoundReport;
use App\Models\DocumentSignature;
use App\Services\DocumentPdfService;
use App\Services\DocumentSignatureService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LostFoundReportController extends Controller
{
    use BuildsDocumentResponse;

    private function detailPayload(DocumentLostFoundReport $detail): array
    {
        return [
            'subject'                   => $detail->subject,
            'recorded_at'               => optional($detail->recorded_at)->toIso8601String(),
            'location_text'             => $detail->location_text,
            'representative_user_id'    => $detail->representative_user_id,
            'witness_user_id'           => $detail->witness_user_id,
            'guard_user_id'             => $detail->guard_user_id,
            'content_description'       => $detail->content_description,
            'handed_over_at'            => optional($detail->handed_over_at)->toIso8601String(),
            'recipient_name'            => $detail->recipient_name,
            'recipient_id_card_number'  => $detail->recipient_id_card_number,
            'recipient_address'         => $detail->recipient_address,
        ];
    }

    public function show(Request $request, Document $document)
    {
        abort_unless($document->document_type === 'talalt_targy_jegyzokonyv', 404);
        $user = $request->user();
        abort_if(!$user->canManage() && $user->id !== $document->created_by_user_id, 403);

        $document->load(['signatures', 'attachments']);

        return response()->json([
            'document' => $this->documentBase($document),
            'detail'   => $this->detailPayload($document->lostFoundReport),
        ]);
    }

    public function store(Request $request, DocumentSignatureService $signatureService, DocumentPdfService $pdfService)
    {
        $user = $request->user();
        abort_unless($user->canCreateDocuments(), 403);

        $data = $request->validate([
            'location_id'               => ['nullable', 'integer', 'exists:tenant.locations,id'],
            'subject'                   => ['required', 'string', 'max:255'],
            'recorded_at'               => ['required', 'date'],
            'location_text'             => ['required', 'string', 'max:255'],
            'representative_user_id'    => ['nullable', 'integer', 'exists:tenant.users,id'],
            'witness_user_id'           => ['nullable', 'integer', 'exists:tenant.users,id'],
            'guard_user_id'             => ['nullable', 'integer', 'exists:tenant.users,id'],
            'content_description'       => ['required', 'string', 'max:2000'],
            'handed_over_at'            => ['nullable', 'date'],
            'recipient_name'            => ['required', 'string', 'max:255'],
            'recipient_id_card_number'  => ['required', 'string', 'max:100'],
            'recipient_address'         => ['required', 'string', 'max:255'],
            'signature_base64'          => ['required', 'string', 'regex:/^data:image\/png;base64,/'],
        ]);

        $tenant = app('tenant');

        $document = DB::transaction(function () use ($data, $user, $tenant, $signatureService) {
            $document = Document::create([
                'document_type'      => 'talalt_targy_jegyzokonyv',
                'location_id'        => $data['location_id'] ?? null,
                'created_by_user_id' => $user->id,
                'status'             => 'draft',
            ]);

            DocumentLostFoundReport::create([
                'document_id'               => $document->id,
                'subject'                   => $data['subject'],
                'recorded_at'               => $data['recorded_at'],
                'location_text'             => $data['location_text'],
                'representative_user_id'    => $data['representative_user_id'] ?? null,
                'witness_user_id'           => $data['witness_user_id'] ?? null,
                'guard_user_id'             => $data['guard_user_id'] ?? null,
                'content_description'       => $data['content_description'],
                'handed_over_at'            => $data['handed_over_at'] ?? null,
                'recipient_name'            => $data['recipient_name'],
                'recipient_id_card_number'  => $data['recipient_id_card_number'],
                'recipient_address'         => $data['recipient_address'],
            ]);

            $path = $signatureService->storeTemp($data['signature_base64'], $tenant->slug, 'atvevo');
            DocumentSignature::create([
                'document_id'    => $document->id,
                'role'           => 'atvevo',
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

        ActivityLog::record('document.created', $user, 'Talált tárgy jegyzőkönyv rögzítve', [
            'document_id'   => $document->id,
            'document_type' => $document->document_type,
        ]);

        $document->load(['signatures', 'attachments']);

        return response()->json([
            'document' => $this->documentBase($document),
            'detail'   => $this->detailPayload($document->lostFoundReport),
        ], 201);
    }
}
