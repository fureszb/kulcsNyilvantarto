<?php

namespace App\Http\Controllers\Documents;

use App\Http\Controllers\Controller;
use App\Http\Requests\Documents\StoreBombThreatRequest;
use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\DocumentBombThreat;
use App\Models\DocumentSignature;
use App\Models\Location;
use App\Services\DocumentPdfService;
use App\Services\DocumentSignatureService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class BombThreatController extends Controller
{
    public function create(): Response
    {
        abort_unless(Auth::guard('tenant')->user()->canCreateDocuments(), 403);

        return Inertia::render('Documents/BombThreat/Create', [
            'locations' => Location::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(
        StoreBombThreatRequest $request,
        DocumentSignatureService $signatureService,
        DocumentPdfService $pdfService,
    ) {
        $validated = $request->validated();
        $tenant = app('tenant');
        $user = Auth::guard('tenant')->user();

        $document = DB::transaction(function () use ($validated, $user, $tenant, $signatureService) {
            $document = Document::create([
                'document_type' => 'robbantasi_fenyegetes',
                'location_id' => $validated['location_id'] ?? null,
                'created_by_user_id' => $user->id,
                'status' => 'draft',
            ]);

            DocumentBombThreat::create(array_merge(
                ['document_id' => $document->id],
                array_intersect_key($validated, array_flip([
                    'call_transcript', 'caller_gender', 'caller_age_group', 'speech_style', 'voice_tone',
                    'emotional_state', 'background_noise', 'area_familiarity', 'other_remarks',
                    'call_datetime', 'caller_phone_number', 'receiver_name', 'receiver_position',
                    'receiver_birth_date', 'receiver_mother_name', 'receiver_address', 'receiver_id_card_number',
                ]))
            ));

            $path = $signatureService->storeTemp($validated['signature_hivast_fogado'], $tenant->slug, 'hivast_fogado');
            DocumentSignature::create([
                'document_id' => $document->id,
                'role' => 'hivast_fogado',
                'signature_path' => $path,
                'signed_at' => now(),
            ]);

            return $document;
        });

        try {
            $pdfPath = $pdfService->generate($document, $tenant->slug, $tenant->name);
        } catch (\Throwable $e) {
            Log::error('Dokumentum PDF generálás sikertelen: ' . $e->getMessage());
            return back()->with('error', 'A PDF generálása sikertelen volt. Próbálja újra.');
        }

        $document->update(['pdf_path' => $pdfPath, 'status' => 'finalized', 'finalized_at' => now()]);

        foreach ($document->signatures as $signature) {
            $signatureService->purge($signature);
        }

        ActivityLog::record('document.created', $user, 'Robbantással fenyegetés rögzítve', [
            'document_id' => $document->id,
            'document_type' => $document->document_type,
        ]);

        return redirect()->route('documents.show', $document)->with('success', 'Dokumentum sikeresen létrehozva.');
    }
}
