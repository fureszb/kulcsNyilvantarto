<?php

namespace App\Http\Controllers\Api\Documents;

use App\Http\Controllers\Api\Controller;
use App\Http\Controllers\Api\Documents\Concerns\BuildsDocumentResponse;
use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\DocumentBombThreat;
use App\Models\DocumentSignature;
use App\Services\DocumentPdfService;
use App\Services\DocumentSignatureService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class BombThreatController extends Controller
{
    use BuildsDocumentResponse;

    private function detailPayload(DocumentBombThreat $detail): array
    {
        return [
            'call_transcript'         => $detail->call_transcript,
            'caller_gender'           => $detail->caller_gender,
            'caller_age_group'        => $detail->caller_age_group,
            'speech_style'            => $detail->speech_style,
            'voice_tone'              => $detail->voice_tone,
            'emotional_state'         => $detail->emotional_state,
            'background_noise'        => $detail->background_noise,
            'area_familiarity'        => $detail->area_familiarity,
            'other_remarks'           => $detail->other_remarks,
            'call_datetime'           => optional($detail->call_datetime)->toIso8601String(),
            'caller_phone_number'     => $detail->caller_phone_number,
            'receiver_name'           => $detail->receiver_name,
            'receiver_position'       => $detail->receiver_position,
            'receiver_birth_date'     => optional($detail->receiver_birth_date)->toDateString(),
            'receiver_mother_name'    => $detail->receiver_mother_name,
            'receiver_address'        => $detail->receiver_address,
            'receiver_id_card_number' => $detail->receiver_id_card_number,
        ];
    }

    public function show(Request $request, Document $document)
    {
        abort_unless($document->document_type === 'robbantasi_fenyegetes', 404);
        $user = $request->user();
        abort_if(!$user->canManage() && $user->id !== $document->created_by_user_id, 403);

        $document->load(['signatures', 'attachments']);

        return response()->json([
            'document' => $this->documentBase($document),
            'detail'   => $this->detailPayload($document->bombThreat),
        ]);
    }

    public function store(Request $request, DocumentSignatureService $signatureService, DocumentPdfService $pdfService)
    {
        $user = $request->user();
        abort_unless($user->canCreateDocuments(), 403);

        $data = $request->validate([
            'location_id'         => ['nullable', 'integer', 'exists:tenant.locations,id'],
            'call_transcript'     => ['required', 'string', 'max:5000'],
            'caller_gender'       => ['required', Rule::in(['ferfi', 'no'])],
            'caller_age_group'    => ['required', Rule::in(['fiatal', 'kozepkoru', 'idos', 'gyermek_lany', 'gyermek_fiu'])],
            'speech_style'        => ['required', Rule::in([
                'normalis', 'idegen_akcentus', 'tajszolas', 'hadaro', 'magabiztos', 'gyors',
                'lassu', 'tagolt', 'vontatott', 'posze', 'felolvasott', 'irodalmi',
            ])],
            'voice_tone'          => ['required', Rule::in([
                'magas', 'mely', 'lagy', 'suttogo', 'halk', 'torzitott', 'rekedt', 'orrhang', 'hangos',
            ])],
            'emotional_state'     => ['required', Rule::in([
                'raero', 'izgatott', 'pattogo', 'kiabalo', 'nyugodt', 'erzelmes',
                'dadogo', 'vidam', 'tragar', 'ittas', 'selypito', 'osszefuggestelen',
            ])],
            'background_noise'    => ['required', Rule::in([
                'semmi', 'vasutallomas', 'tarsasag', 'utcai_forgalom', 'csorompoles',
                'zene', 'gyar_uzem', 'tv', 'szorakozohely', 'hivatali_zaj',
            ])],
            'area_familiarity'         => ['required', Rule::in(['altalanos', 'szakszeru', 'helyi_ismeretre_vallo'])],
            'other_remarks'            => ['nullable', 'string', 'max:2000'],
            'call_datetime'            => ['required', 'date'],
            'caller_phone_number'      => ['nullable', 'string', 'max:50'],
            'receiver_name'            => ['required', 'string', 'max:255'],
            'receiver_position'        => ['required', 'string', 'max:255'],
            'receiver_birth_date'      => ['required', 'date'],
            'receiver_mother_name'     => ['required', 'string', 'max:255'],
            'receiver_address'         => ['required', 'string', 'max:255'],
            'receiver_id_card_number'  => ['required', 'string', 'max:100'],
            'signature_base64'         => ['required', 'string', 'regex:/^data:image\/png;base64,/'],
        ]);

        $tenant = app('tenant');

        $document = DB::transaction(function () use ($data, $user, $tenant, $signatureService) {
            $document = Document::create([
                'document_type'      => 'robbantasi_fenyegetes',
                'location_id'        => $data['location_id'] ?? null,
                'created_by_user_id' => $user->id,
                'status'             => 'draft',
            ]);

            DocumentBombThreat::create(array_merge(
                ['document_id' => $document->id],
                array_intersect_key($data, array_flip([
                    'call_transcript', 'caller_gender', 'caller_age_group', 'speech_style', 'voice_tone',
                    'emotional_state', 'background_noise', 'area_familiarity', 'other_remarks',
                    'call_datetime', 'caller_phone_number', 'receiver_name', 'receiver_position',
                    'receiver_birth_date', 'receiver_mother_name', 'receiver_address', 'receiver_id_card_number',
                ]))
            ));

            $path = $signatureService->storeTemp($data['signature_base64'], $tenant->slug, 'hivast_fogado');
            DocumentSignature::create([
                'document_id'    => $document->id,
                'role'           => 'hivast_fogado',
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

        ActivityLog::record('document.created', $user, 'Robbantással fenyegetés rögzítve', [
            'document_id'   => $document->id,
            'document_type' => $document->document_type,
        ]);

        $document->load(['signatures', 'attachments']);

        return response()->json([
            'document' => $this->documentBase($document),
            'detail'   => $this->detailPayload($document->bombThreat),
        ], 201);
    }
}
