<?php

namespace App\Http\Controllers\Documents;

use App\Http\Controllers\Controller;
use App\Http\Requests\Documents\StoreFireKeyIssuanceRequest;
use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\DocumentFireKeyIssuance;
use App\Models\DocumentSignature;
use App\Models\Location;
use App\Services\DocumentPdfService;
use App\Services\DocumentSignatureService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class FireKeyIssuanceController extends Controller
{
    public function create(): Response
    {
        abort_unless(Auth::guard('tenant')->user()->canCreateDocuments(), 403);

        return Inertia::render('Documents/FireKeyIssuance/Create', [
            'locations' => Location::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(
        StoreFireKeyIssuanceRequest $request,
        DocumentSignatureService $signatureService,
        DocumentPdfService $pdfService,
    ) {
        $validated = $request->validated();
        $tenant = app('tenant');
        $user = Auth::guard('tenant')->user();

        $document = DB::transaction(function () use ($validated, $user, $tenant, $signatureService) {
            $document = Document::create([
                'document_type' => 'tuzkulcs_tuzkazetta_kiadas',
                'location_id' => $validated['location_id'] ?? null,
                'created_by_user_id' => $user->id,
                'status' => 'draft',
            ]);

            DocumentFireKeyIssuance::create([
                'document_id' => $document->id,
                'seal_number' => $validated['seal_number'],
                'seal_removed' => $validated['seal_removed'],
                'seal_applied' => $validated['seal_applied'],
                'issued_at' => $validated['issued_at'],
                'issue_reason' => $validated['issue_reason'],
                'closed_at' => $validated['closed_at'] ?? null,
            ]);

            $path = $signatureService->storeTemp($validated['signature_felvette'], $tenant->slug, 'felvette');
            DocumentSignature::create([
                'document_id' => $document->id,
                'role' => 'felvette',
                'signature_path' => $path,
                'signed_at' => now(),
            ]);

            if (!empty($validated['signature_leadta'])) {
                $path = $signatureService->storeTemp($validated['signature_leadta'], $tenant->slug, 'leadta');
                DocumentSignature::create([
                    'document_id' => $document->id,
                    'role' => 'leadta',
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

        ActivityLog::record('document.created', $user, 'Tűzkulcs és tűzkazetta kiadás rögzítve', [
            'document_id' => $document->id,
            'document_type' => $document->document_type,
        ]);

        return redirect()->route('documents.show', $document)->with('success', 'Dokumentum sikeresen létrehozva.');
    }
}
