<?php

namespace App\Http\Controllers\Api\Documents;

use App\Http\Controllers\Api\Controller;
use App\Http\Controllers\Api\Documents\Concerns\BuildsDocumentResponse;
use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\DocumentDamageReport;
use App\Models\DocumentSignature;
use App\Services\DocumentPdfService;
use App\Services\DocumentSignatureService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DamageReportController extends Controller
{
    use BuildsDocumentResponse;

    private const SIGNATURE_ROLES = ['karokozo', 'biztonsagi_szolgalat', 'kepviselo'];

    private function detailPayload(DocumentDamageReport $detail): array
    {
        return [
            'recorded_from'               => optional($detail->recorded_from)->toIso8601String(),
            'recorded_to'                 => optional($detail->recorded_to)->toIso8601String(),
            'location_text'               => $detail->location_text,
            'subject'                     => $detail->subject,
            'perpetrator_name'            => $detail->perpetrator_name,
            'perpetrator_id_card_number'  => $detail->perpetrator_id_card_number,
            'perpetrator_birth_place'     => $detail->perpetrator_birth_place,
            'perpetrator_birth_date'      => optional($detail->perpetrator_birth_date)->toDateString(),
            'perpetrator_mother_name'     => $detail->perpetrator_mother_name,
            'perpetrator_address'         => $detail->perpetrator_address,
            'perpetrator_phone'           => $detail->perpetrator_phone,
            'perpetrator_email'           => $detail->perpetrator_email,
            'guard_user_id'               => $detail->guard_user_id,
            'witness_user_id'             => $detail->witness_user_id,
            'event_description'           => $detail->event_description,
            'perpetrator_admitted'        => $detail->perpetrator_admitted,
        ];
    }

    public function show(Request $request, Document $document)
    {
        abort_unless($document->document_type === 'karfelveteli_jegyzokonyv', 404);
        $user = $request->user();
        abort_if(!$user->canManage() && $user->id !== $document->created_by_user_id, 403);

        $document->load(['signatures', 'attachments']);

        return response()->json([
            'document' => $this->documentBase($document),
            'detail'   => $this->detailPayload($document->damageReport),
        ]);
    }

    public function store(Request $request, DocumentSignatureService $signatureService, DocumentPdfService $pdfService)
    {
        $user = $request->user();
        abort_unless($user->canCreateDocuments(), 403);

        $data = $request->validate([
            'location_id'                => ['nullable', 'integer', 'exists:tenant.locations,id'],
            'recorded_from'              => ['required', 'date'],
            'recorded_to'                => ['required', 'date', 'after_or_equal:recorded_from'],
            'location_text'              => ['required', 'string', 'max:255'],
            'subject'                    => ['required', 'string', 'max:255'],
            'perpetrator_name'           => ['required', 'string', 'max:255'],
            'perpetrator_id_card_number' => ['required', 'string', 'max:100'],
            'perpetrator_birth_place'    => ['required', 'string', 'max:255'],
            'perpetrator_birth_date'     => ['required', 'date'],
            'perpetrator_mother_name'    => ['required', 'string', 'max:255'],
            'perpetrator_address'        => ['required', 'string', 'max:255'],
            'perpetrator_phone'          => ['nullable', 'string', 'max:50'],
            'perpetrator_email'          => ['nullable', 'email', 'max:255'],
            'guard_user_id'              => ['nullable', 'integer', 'exists:tenant.users,id'],
            'witness_user_id'            => ['nullable', 'integer', 'exists:tenant.users,id'],
            'event_description'          => ['required', 'string', 'max:5000'],
            'perpetrator_admitted'       => ['required', 'boolean'],
            'signatures'                 => ['required', 'array'],
            'signatures.*.role'          => ['required', 'string'],
            'signatures.*.image_base64'  => ['required', 'string', 'regex:/^data:image\/png;base64,/'],
        ]);

        $this->requireSignatureRoles($data['signatures'], self::SIGNATURE_ROLES);

        $tenant = app('tenant');

        $document = DB::transaction(function () use ($data, $user, $tenant, $signatureService) {
            $document = Document::create([
                'document_type'      => 'karfelveteli_jegyzokonyv',
                'location_id'        => $data['location_id'] ?? null,
                'created_by_user_id' => $user->id,
                'status'             => 'draft',
            ]);

            DocumentDamageReport::create([
                'document_id'                 => $document->id,
                'recorded_from'               => $data['recorded_from'],
                'recorded_to'                 => $data['recorded_to'],
                'location_text'               => $data['location_text'],
                'subject'                     => $data['subject'],
                'perpetrator_name'            => $data['perpetrator_name'],
                'perpetrator_id_card_number'  => $data['perpetrator_id_card_number'],
                'perpetrator_birth_place'     => $data['perpetrator_birth_place'],
                'perpetrator_birth_date'      => $data['perpetrator_birth_date'],
                'perpetrator_mother_name'     => $data['perpetrator_mother_name'],
                'perpetrator_address'         => $data['perpetrator_address'],
                'perpetrator_phone'           => $data['perpetrator_phone'] ?? null,
                'perpetrator_email'           => $data['perpetrator_email'] ?? null,
                'guard_user_id'               => $data['guard_user_id'] ?? null,
                'witness_user_id'             => $data['witness_user_id'] ?? null,
                'event_description'           => $data['event_description'],
                'perpetrator_admitted'        => $data['perpetrator_admitted'],
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

        ActivityLog::record('document.created', $user, 'Kárfelvételi jegyzőkönyv rögzítve', [
            'document_id'   => $document->id,
            'document_type' => $document->document_type,
        ]);

        $document->load(['signatures', 'attachments']);

        return response()->json([
            'document' => $this->documentBase($document),
            'detail'   => $this->detailPayload($document->damageReport),
        ], 201);
    }
}
