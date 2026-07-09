<?php

namespace App\Http\Controllers\Documents;

use App\Http\Controllers\Controller;
use App\Http\Requests\Documents\StoreEvacuationRegistryRequest;
use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\DocumentEvacuationRegistry;
use App\Models\DocumentSignature;
use App\Models\Location;
use App\Services\DocumentPdfService;
use App\Services\DocumentSignatureService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class EvacuationRegistryController extends Controller
{
    public function create(): Response
    {
        abort_unless(Auth::guard('tenant')->user()->canCreateDocuments(), 403);

        return Inertia::render('Documents/EvacuationRegistry/Create', [
            'locations' => Location::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(
        StoreEvacuationRegistryRequest $request,
        DocumentSignatureService $signatureService,
        DocumentPdfService $pdfService,
    ) {
        $validated = $request->validated();
        $tenant = app('tenant');
        $user = Auth::guard('tenant')->user();

        $document = DB::transaction(function () use ($validated, $user, $tenant, $signatureService) {
            $document = Document::create([
                'document_type' => 'kiuritesi_nyilvantartas',
                'location_id' => $validated['location_id'] ?? null,
                'created_by_user_id' => $user->id,
                'status' => 'draft',
            ]);

            DocumentEvacuationRegistry::create([
                'document_id' => $document->id,
                'tenant_name' => $validated['tenant_name'],
                'remained_in_building' => $validated['remained_in_building'] ?? null,
                'fire_safety_officer_name' => $validated['fire_safety_officer_name'],
            ]);

            $path = $signatureService->storeTemp($validated['signature_tuzvedelmi_felelos'], $tenant->slug, 'tuzvedelmi_felelos');
            DocumentSignature::create([
                'document_id' => $document->id,
                'role' => 'tuzvedelmi_felelos',
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

        ActivityLog::record('document.created', $user, 'Kiürítési nyilvántartás rögzítve', [
            'document_id' => $document->id,
            'document_type' => $document->document_type,
        ]);

        return redirect()->route('documents.show', $document)->with('success', 'Dokumentum sikeresen létrehozva.');
    }
}
