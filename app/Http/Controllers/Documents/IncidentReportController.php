<?php

namespace App\Http\Controllers\Documents;

use App\Http\Controllers\Controller;
use App\Http\Requests\Documents\StoreIncidentReportRequest;
use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\DocumentIncidentReport;
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

class IncidentReportController extends Controller
{
    private const SIGNATURE_ROLES = [
        'jegyzokonyv_vezeto' => 'Jegyzőkönyv vezető',
        'tanu' => 'Tanú',
        'kepviselo' => 'Képviselő',
    ];

    public function create(): Response
    {
        abort_unless(Auth::guard('tenant')->user()->canCreateDocuments(), 403);

        return Inertia::render('Documents/IncidentReport/Create', [
            'locations' => Location::orderBy('name')->get(['id', 'name']),
            'workers' => TenantUser::where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(
        StoreIncidentReportRequest $request,
        DocumentSignatureService $signatureService,
        DocumentPdfService $pdfService,
    ) {
        $validated = $request->validated();
        $tenant = app('tenant');
        $user = Auth::guard('tenant')->user();

        $document = DB::transaction(function () use ($validated, $user, $tenant, $signatureService) {
            $document = Document::create([
                'document_type' => 'feljegyzeses_jegyzokonyv',
                'location_id' => $validated['location_id'] ?? null,
                'created_by_user_id' => $user->id,
                'status' => 'draft',
            ]);

            $detail = DocumentIncidentReport::create([
                'document_id' => $document->id,
                'recorded_at' => $validated['recorded_at'],
                'location_text' => $validated['location_text'],
                'event_description' => $validated['event_description'],
            ]);

            $detail->guards()->sync($validated['guard_ids']);

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

        ActivityLog::record('document.created', $user, 'Feljegyzéses jegyzőkönyv rögzítve', [
            'document_id' => $document->id,
            'document_type' => $document->document_type,
        ]);

        return redirect()->route('documents.show', $document)->with('success', 'Dokumentum sikeresen létrehozva.');
    }
}
