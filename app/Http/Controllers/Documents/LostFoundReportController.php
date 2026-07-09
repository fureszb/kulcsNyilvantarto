<?php

namespace App\Http\Controllers\Documents;

use App\Http\Controllers\Controller;
use App\Http\Requests\Documents\StoreLostFoundReportRequest;
use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\DocumentLostFoundReport;
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

class LostFoundReportController extends Controller
{
    public function create(): Response
    {
        abort_unless(Auth::guard('tenant')->user()->canCreateDocuments(), 403);

        return Inertia::render('Documents/LostFoundReport/Create', [
            'locations' => Location::orderBy('name')->get(['id', 'name']),
            'workers' => TenantUser::where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(
        StoreLostFoundReportRequest $request,
        DocumentSignatureService $signatureService,
        DocumentPdfService $pdfService,
    ) {
        $validated = $request->validated();
        $tenant = app('tenant');
        $user = Auth::guard('tenant')->user();

        $document = DB::transaction(function () use ($validated, $user, $tenant, $signatureService) {
            $document = Document::create([
                'document_type' => 'talalt_targy_jegyzokonyv',
                'location_id' => $validated['location_id'] ?? null,
                'created_by_user_id' => $user->id,
                'status' => 'draft',
            ]);

            DocumentLostFoundReport::create([
                'document_id' => $document->id,
                'subject' => $validated['subject'],
                'recorded_at' => $validated['recorded_at'],
                'location_text' => $validated['location_text'],
                'representative_user_id' => $validated['representative_user_id'] ?? null,
                'witness_user_id' => $validated['witness_user_id'] ?? null,
                'guard_user_id' => $validated['guard_user_id'] ?? null,
                'content_description' => $validated['content_description'],
                'handed_over_at' => $validated['handed_over_at'] ?? null,
                'recipient_name' => $validated['recipient_name'],
                'recipient_id_card_number' => $validated['recipient_id_card_number'],
                'recipient_address' => $validated['recipient_address'],
            ]);

            $path = $signatureService->storeTemp($validated['signature_atvevo'], $tenant->slug, 'atvevo');
            DocumentSignature::create([
                'document_id' => $document->id,
                'role' => 'atvevo',
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

        ActivityLog::record('document.created', $user, 'Talált tárgy jegyzőkönyv rögzítve', [
            'document_id' => $document->id,
            'document_type' => $document->document_type,
        ]);

        return redirect()->route('documents.show', $document)->with('success', 'Dokumentum sikeresen létrehozva.');
    }
}
