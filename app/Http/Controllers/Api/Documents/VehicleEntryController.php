<?php

namespace App\Http\Controllers\Api\Documents;

use App\Http\Controllers\Api\Controller;
use App\Http\Controllers\Api\Documents\Concerns\BuildsDocumentResponse;
use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\DocumentVehicleEntry;
use App\Services\DocumentPdfService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class VehicleEntryController extends Controller
{
    use BuildsDocumentResponse;

    private function detailPayload(DocumentVehicleEntry $detail): array
    {
        return [
            'license_plate'   => $detail->license_plate,
            'company_or_name' => $detail->company_or_name,
            'entry_at'        => optional($detail->entry_time)->toIso8601String(),
            'exit_at'         => optional($detail->exit_time)->toIso8601String(),
            'notes'           => $detail->notes,
        ];
    }

    public function show(Request $request, Document $document)
    {
        abort_unless($document->document_type === 'gepjarmu_beleptetes', 404);
        $user = $request->user();
        abort_if(!$user->canManage() && $user->id !== $document->created_by_user_id, 403);

        $document->load(['signatures', 'attachments']);

        return response()->json([
            'document' => $this->documentBase($document),
            'detail'   => $this->detailPayload($document->vehicleEntry),
        ]);
    }

    public function store(Request $request, DocumentPdfService $pdfService)
    {
        $user = $request->user();
        abort_unless($user->canCreateDocuments(), 403);

        $data = $request->validate([
            'location_id'      => ['nullable', 'integer', 'exists:tenant.locations,id'],
            'license_plate'    => ['required', 'string', 'max:20'],
            'company_or_name'  => ['required', 'string', 'max:255'],
            'entry_at'         => ['required', 'date'],
            'exit_at'          => ['nullable', 'date'],
            'notes'            => ['nullable', 'string', 'max:2000'],
        ]);

        $tenant = app('tenant');
        $entryAt = \Carbon\Carbon::parse($data['entry_at']);

        $document = DB::transaction(function () use ($data, $user, $entryAt) {
            $document = Document::create([
                'document_type'      => 'gepjarmu_beleptetes',
                'location_id'        => $data['location_id'] ?? null,
                'created_by_user_id' => $user->id,
                'status'             => 'draft',
            ]);

            DocumentVehicleEntry::create([
                'document_id'     => $document->id,
                'license_plate'   => $data['license_plate'],
                'company_or_name' => $data['company_or_name'],
                'entry_date'      => $entryAt->toDateString(),
                'entry_time'      => $entryAt,
                'exit_time'       => !empty($data['exit_at']) ? \Carbon\Carbon::parse($data['exit_at']) : null,
                'notes'           => $data['notes'] ?? null,
            ]);

            return $document;
        });

        try {
            $pdfPath = $pdfService->generate($document, $tenant->slug, $tenant->name);
        } catch (\Throwable $e) {
            Log::error('Dokumentum PDF generálás sikertelen: ' . $e->getMessage());
            return response()->json(['message' => 'A PDF generálása sikertelen volt. Próbálja újra.'], 500);
        }

        $document->update(['pdf_path' => $pdfPath, 'status' => 'finalized', 'finalized_at' => now()]);

        ActivityLog::record('document.created', $user, 'Gépjármű beléptető nyilvántartás rögzítve', [
            'document_id'   => $document->id,
            'document_type' => $document->document_type,
        ]);

        $document->load(['signatures', 'attachments']);

        return response()->json([
            'document' => $this->documentBase($document),
            'detail'   => $this->detailPayload($document->vehicleEntry),
        ], 201);
    }
}
