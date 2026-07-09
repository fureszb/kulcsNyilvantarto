<?php

namespace App\Http\Controllers\Documents;

use App\Http\Controllers\Controller;
use App\Http\Requests\Documents\StoreKeyCardHandoverRequest;
use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\DocumentKeyCardHandover;
use App\Models\DocumentSignature;
use App\Models\Location;
use App\Services\DocumentPdfService;
use App\Services\DocumentSignatureService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class KeyCardHandoverController extends Controller
{
    private const SIGNATURE_ROLES = [
        'felvevo' => 'Felvevő',
        'leado' => 'Leadó',
        'visszavevo' => 'Visszavevő',
    ];

    public function create(): Response
    {
        abort_unless(Auth::guard('tenant')->user()->canCreateDocuments(), 403);

        return Inertia::render('Documents/KeyCardHandover/Create', [
            'locations' => Location::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(
        StoreKeyCardHandoverRequest $request,
        DocumentSignatureService $signatureService,
        DocumentPdfService $pdfService,
    ) {
        $validated = $request->validated();
        $tenant = app('tenant');
        $user = Auth::guard('tenant')->user();

        $document = DB::transaction(function () use ($validated, $user, $tenant, $signatureService) {
            $document = Document::create([
                'document_type' => 'kulcs_kartya_atadas_atvetel',
                'location_id' => $validated['location_id'] ?? null,
                'created_by_user_id' => $user->id,
                'status' => 'draft',
            ]);

            DocumentKeyCardHandover::create([
                'document_id' => $document->id,
                'key_card_number_or_name' => $validated['key_card_number_or_name'],
                'company_or_workplace' => $validated['company_or_workplace'],
                'issued_at' => $validated['issued_at'],
                'issued_to_name' => $validated['issued_to_name'],
                'issued_to_id_card_number' => $validated['issued_to_id_card_number'],
                'security_service' => $validated['security_service'] ?? null,
                'returned_at' => $validated['returned_at'] ?? null,
                'returned_by_name' => $validated['returned_by_name'] ?? null,
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

        ActivityLog::record('document.created', $user, 'Kulcs/Kártya átadás-átvétel rögzítve', [
            'document_id' => $document->id,
            'document_type' => $document->document_type,
        ]);

        return redirect()->route('documents.show', $document)->with('success', 'Dokumentum sikeresen létrehozva.');
    }
}
