<?php

namespace App\Http\Controllers\Api\Documents;

use App\Http\Controllers\Api\Controller;
use App\Http\Controllers\Api\Documents\Concerns\BuildsDocumentResponse;
use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\DocumentKeyCardHandover;
use App\Models\DocumentSignature;
use App\Services\DocumentPdfService;
use App\Services\DocumentSignatureService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class KeyCardHandoverController extends Controller
{
    use BuildsDocumentResponse;

    private const SIGNATURE_ROLES = ['felvevo', 'leado', 'visszavevo'];

    public function show(Request $request, Document $document)
    {
        abort_unless($document->document_type === 'kulcs_kartya_atadas_atvetel', 404);
        $user = $request->user();
        abort_if(!$user->canManage() && $user->id !== $document->created_by_user_id, 403);

        $document->load(['signatures', 'attachments']);
        $detail = $document->keyCardHandover;

        return response()->json([
            'document' => $this->documentBase($document),
            'detail'   => [
                'key_card_number_or_name' => $detail->key_card_number_or_name,
                'company_or_workplace'    => $detail->company_or_workplace,
                'issued_at'               => optional($detail->issued_at)->toIso8601String(),
                'issued_to_name'          => $detail->issued_to_name,
                'issued_to_id_card_number'=> $detail->issued_to_id_card_number,
                'security_service'        => $detail->security_service,
                'returned_at'             => optional($detail->returned_at)->toIso8601String(),
                'returned_by_name'        => $detail->returned_by_name,
            ],
        ]);
    }

    public function store(Request $request, DocumentSignatureService $signatureService, DocumentPdfService $pdfService)
    {
        $user = $request->user();
        abort_unless($user->canCreateDocuments(), 403);

        $data = $request->validate([
            'location_id'               => ['nullable', 'integer', 'exists:tenant.locations,id'],
            'key_card_number_or_name'   => ['required', 'string', 'max:255'],
            'company_or_workplace'      => ['required', 'string', 'max:255'],
            'issued_at'                 => ['required', 'date'],
            'issued_to_name'            => ['required', 'string', 'max:255'],
            'issued_to_id_card_number'  => ['required', 'string', 'max:100'],
            'security_service'          => ['nullable', 'string', 'max:255'],
            'returned_at'               => ['nullable', 'date'],
            'returned_by_name'          => ['nullable', 'string', 'max:255'],
            'signatures'                => ['required', 'array'],
            'signatures.*.role'         => ['required', 'string'],
            'signatures.*.image_base64' => ['required', 'string', 'regex:/^data:image\/png;base64,/'],
        ]);

        $this->requireSignatureRoles($data['signatures'], self::SIGNATURE_ROLES);

        $tenant = app('tenant');

        $document = DB::transaction(function () use ($data, $user, $tenant, $signatureService) {
            $document = Document::create([
                'document_type'      => 'kulcs_kartya_atadas_atvetel',
                'location_id'        => $data['location_id'] ?? null,
                'created_by_user_id' => $user->id,
                'status'             => 'draft',
            ]);

            DocumentKeyCardHandover::create([
                'document_id'               => $document->id,
                'key_card_number_or_name'   => $data['key_card_number_or_name'],
                'company_or_workplace'      => $data['company_or_workplace'],
                'issued_at'                 => $data['issued_at'],
                'issued_to_name'            => $data['issued_to_name'],
                'issued_to_id_card_number'  => $data['issued_to_id_card_number'],
                'security_service'          => $data['security_service'] ?? null,
                'returned_at'               => $data['returned_at'] ?? null,
                'returned_by_name'          => $data['returned_by_name'] ?? null,
            ]);

            foreach ($data['signatures'] as $sig) {
                $path = $signatureService->storeTemp($sig['image_base64'], $tenant->slug, $sig['role']);
                DocumentSignature::create([
                    'document_id'     => $document->id,
                    'role'            => $sig['role'],
                    'signature_path'  => $path,
                    'signed_at'       => now(),
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

        ActivityLog::record('document.created', $user, 'Kulcs/Kártya átadás-átvétel rögzítve', [
            'document_id'   => $document->id,
            'document_type' => $document->document_type,
        ]);

        $document->load(['signatures', 'attachments']);

        return response()->json([
            'document' => $this->documentBase($document),
            'detail'   => [
                'key_card_number_or_name' => $data['key_card_number_or_name'],
                'company_or_workplace'    => $data['company_or_workplace'],
                'issued_at'               => $data['issued_at'],
                'issued_to_name'          => $data['issued_to_name'],
                'issued_to_id_card_number'=> $data['issued_to_id_card_number'],
                'security_service'        => $data['security_service'] ?? null,
                'returned_at'             => $data['returned_at'] ?? null,
                'returned_by_name'        => $data['returned_by_name'] ?? null,
            ],
        ], 201);
    }
}
