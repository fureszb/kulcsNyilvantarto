<?php

namespace App\Http\Controllers\Documents;

use App\Http\Controllers\Controller;
use App\Http\Requests\Documents\StoreDamageReportRequest;
use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\DocumentDamageReport;
use App\Models\DocumentSignature;
use App\Models\Location;
use App\Models\TenantUser;
use App\Services\DocumentPdfService;
use App\Services\DocumentSignatureService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class DamageReportController extends Controller
{
    private const SIGNATURE_ROLES = [
        'karokozo' => 'Károkozó',
        'biztonsagi_szolgalat' => 'Biztonsági szolgálat',
        'kepviselo' => 'Képviselő',
    ];

    public function create(): Response
    {
        abort_unless(Auth::guard('tenant')->user()->canCreateDocuments(), 403);

        return Inertia::render('Documents/DamageReport/Create', [
            'locations' => Location::orderBy('name')->get(['id', 'name']),
            'workers' => TenantUser::where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(
        StoreDamageReportRequest $request,
        DocumentSignatureService $signatureService,
        DocumentPdfService $pdfService,
    ) {
        $validated = $request->validated();
        $tenant = app('tenant');
        $user = Auth::guard('tenant')->user();

        $document = DB::transaction(function () use ($validated, $user, $tenant, $signatureService) {
            $document = Document::create([
                'document_type' => 'karfelveteli_jegyzokonyv',
                'location_id' => $validated['location_id'] ?? null,
                'created_by_user_id' => $user->id,
                'status' => 'draft',
            ]);

            DocumentDamageReport::create([
                'document_id' => $document->id,
                'recorded_from' => $validated['recorded_from'],
                'recorded_to' => $validated['recorded_to'],
                'location_text' => $validated['location_text'],
                'subject' => $validated['subject'],
                'perpetrator_name' => $validated['perpetrator_name'],
                'perpetrator_id_card_number' => $validated['perpetrator_id_card_number'],
                'perpetrator_birth_place' => $validated['perpetrator_birth_place'],
                'perpetrator_birth_date' => $validated['perpetrator_birth_date'],
                'perpetrator_mother_name' => $validated['perpetrator_mother_name'],
                'perpetrator_address' => $validated['perpetrator_address'],
                'perpetrator_phone' => $validated['perpetrator_phone'] ?? null,
                'perpetrator_email' => $validated['perpetrator_email'] ?? null,
                'guard_user_id' => $validated['guard_user_id'] ?? null,
                'witness_user_id' => $validated['witness_user_id'] ?? null,
                'event_description' => $validated['event_description'],
                'perpetrator_admitted' => $validated['perpetrator_admitted'],
            ]);

            foreach (self::SIGNATURE_ROLES as $role => $label) {
                $path = $signatureService->storeTemp($validated["signature_{$role}"], $tenant->slug, $role);
                DocumentSignature::create([
                    'document_id' => $document->id,
                    'role' => $role,
                    'signature_path' => $path,
                    'signed_at' => now(),
                ]);
            }

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

        ActivityLog::record('document.created', $user, 'Kárfelvételi jegyzőkönyv rögzítve', [
            'document_id' => $document->id,
            'document_type' => $document->document_type,
        ]);

        return redirect()->route('documents.show', $document)->with('success', 'Dokumentum sikeresen létrehozva.');
    }
}
