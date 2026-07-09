<?php

namespace App\Http\Controllers\Documents;

use App\Http\Controllers\Controller;
use App\Http\Requests\Documents\StoreEvacuationReportRequest;
use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\DocumentAttachment;
use App\Models\DocumentEvacuationReport;
use App\Models\Location;
use App\Services\DocumentPdfService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class EvacuationReportController extends Controller
{
    private const ATTACHMENT_LABELS = [
        'kiuritesi_nyilvantartas' => 'Kiürítési nyilvántartás',
        'hatosagi_jegyzokonyv' => 'Hatósági jegyzőkönyv',
        'tuzmarshall_jegyzokonyv' => 'Tűzmarshall jegyzőkönyv',
    ];

    public function create(): Response
    {
        abort_unless(Auth::guard('tenant')->user()->canCreateDocuments(), 403);

        return Inertia::render('Documents/EvacuationReport/Create', [
            'locations' => Location::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreEvacuationReportRequest $request, DocumentPdfService $pdfService)
    {
        $validated = $request->validated();
        $tenant = app('tenant');
        $user = Auth::guard('tenant')->user();

        $document = DB::transaction(function () use ($validated, $user, $tenant, $request) {
            $document = Document::create([
                'document_type' => 'kiuritesi_jegyzokonyv',
                'location_id' => $validated['location_id'] ?? null,
                'created_by_user_id' => $user->id,
                'status' => 'draft',
            ]);

            DocumentEvacuationReport::create(array_merge(
                ['document_id' => $document->id],
                array_intersect_key($validated, array_flip([
                    'prepared_by', 'prepared_by_position', 'location_text', 'event_date', 'event_description',
                    'alarm_type', 'alarm_reason', 'evacuation_type', 'fire_alarm_control_notes',
                    'deficiencies', 'guard_duty_obligations', 'tenant_obligations', 'had_alarm',
                    'fire_what_ignited', 'fire_life_in_danger', 'fire_extinguished_how',
                    'fire_commander_arrival_time', 'fire_reentry_protocol', 'fire_cause_responsible',
                    'had_early_warning', 'delay_before_siren', 'no_delay_reason',
                    'no_delay_corrective_actions', 'delay_reason_not_reacted',
                ]))
            ));

            foreach (self::ATTACHMENT_LABELS as $key => $label) {
                if ($request->hasFile("attachment_{$key}")) {
                    $file = $request->file("attachment_{$key}");
                    $path = $file->store("documents/{$tenant->slug}/attachments/{$document->id}", 'local');
                    DocumentAttachment::create([
                        'document_id' => $document->id,
                        'label' => $key,
                        'original_name' => $file->getClientOriginalName(),
                        'stored_path' => $path,
                        'size_bytes' => $file->getSize(),
                        'mime_type' => $file->getMimeType(),
                    ]);
                }
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

        ActivityLog::record('document.created', $user, 'Kiürítési jegyzőkönyv rögzítve', [
            'document_id' => $document->id,
            'document_type' => $document->document_type,
        ]);

        return redirect()->route('documents.show', $document)->with('success', 'Dokumentum sikeresen létrehozva.');
    }
}
