<?php

namespace App\Http\Controllers\Documents;

use App\Http\Controllers\Controller;
use App\Http\Requests\Documents\StoreEquipmentHandoverRequest;
use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\DocumentEquipmentHandover;
use App\Models\Location;
use App\Services\DocumentPdfService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class EquipmentHandoverController extends Controller
{
    public function create(): Response
    {
        abort_unless(Auth::guard('tenant')->user()->canCreateDocuments(), 403);

        return Inertia::render('Documents/EquipmentHandover/Create', [
            'locations' => Location::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreEquipmentHandoverRequest $request, DocumentPdfService $pdfService)
    {
        $validated = $request->validated();
        $tenant = app('tenant');
        $user = Auth::guard('tenant')->user();

        $document = DB::transaction(function () use ($validated, $user) {
            $document = Document::create([
                'document_type' => 'eszkoz_atadas_atvetel',
                'location_id' => $validated['location_id'] ?? null,
                'created_by_user_id' => $user->id,
                'status' => 'draft',
            ]);

            DocumentEquipmentHandover::create([
                'document_id' => $document->id,
                'equipment_name' => $validated['equipment_name'],
                'issued_at' => $validated['issued_at'],
                'issued_to_name' => $validated['issued_to_name'],
                'issuer_security_service' => $validated['issuer_security_service'],
                'returned_at' => $validated['returned_at'] ?? null,
                'returned_by_name' => $validated['returned_by_name'] ?? null,
                'receiver_security_service' => $validated['receiver_security_service'] ?? null,
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

        ActivityLog::record('document.created', $user, 'Eszközök átadás-átvétele rögzítve', [
            'document_id' => $document->id,
            'document_type' => $document->document_type,
        ]);

        return redirect()->route('documents.show', $document)->with('success', 'Dokumentum sikeresen létrehozva.');
    }
}
