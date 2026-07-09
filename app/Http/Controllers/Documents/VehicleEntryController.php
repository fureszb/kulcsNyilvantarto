<?php

namespace App\Http\Controllers\Documents;

use App\Http\Controllers\Controller;
use App\Http\Requests\Documents\StoreVehicleEntryRequest;
use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\DocumentVehicleEntry;
use App\Models\Location;
use App\Services\DocumentPdfService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class VehicleEntryController extends Controller
{
    public function create(): Response
    {
        abort_unless(Auth::guard('tenant')->user()->canCreateDocuments(), 403);

        return Inertia::render('Documents/VehicleEntry/Create', [
            'locations' => Location::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreVehicleEntryRequest $request, DocumentPdfService $pdfService)
    {
        $validated = $request->validated();
        $tenant = app('tenant');
        $user = Auth::guard('tenant')->user();

        $document = DB::transaction(function () use ($validated, $user) {
            $document = Document::create([
                'document_type' => 'gepjarmu_beleptetes',
                'location_id' => $validated['location_id'] ?? null,
                'created_by_user_id' => $user->id,
                'status' => 'draft',
            ]);

            DocumentVehicleEntry::create([
                'document_id' => $document->id,
                'license_plate' => $validated['license_plate'],
                'company_or_name' => $validated['company_or_name'],
                'entry_date' => $validated['entry_date'],
                'entry_time' => "{$validated['entry_date']} {$validated['entry_time']}:00",
                'exit_time' => !empty($validated['exit_time']) ? "{$validated['entry_date']} {$validated['exit_time']}:00" : null,
                'notes' => $validated['notes'] ?? null,
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

        ActivityLog::record('document.created', $user, 'Gépjármű beléptető nyilvántartás rögzítve', [
            'document_id' => $document->id,
            'document_type' => $document->document_type,
        ]);

        return redirect()->route('documents.show', $document)->with('success', 'Dokumentum sikeresen létrehozva.');
    }
}
