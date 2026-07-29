<?php

namespace App\Http\Controllers\Api\Documents;

use App\Http\Controllers\Api\Controller;
use App\Http\Controllers\Api\Documents\Concerns\BuildsDocumentResponse;
use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\DocumentAttachment;
use App\Models\DocumentEvacuationReport;
use App\Services\DocumentPdfService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EvacuationReportController extends Controller
{
    use BuildsDocumentResponse;

    private const ATTACHMENT_KEYS = ['kiuritesi_nyilvantartas', 'hatosagi_jegyzokonyv', 'tuzmarshall_jegyzokonyv'];

    private function detailPayload(DocumentEvacuationReport $detail): array
    {
        return [
            'prepared_by'                  => $detail->prepared_by,
            'prepared_by_position'         => $detail->prepared_by_position,
            'location_text'                => $detail->location_text,
            'event_date'                   => optional($detail->event_date)->toIso8601String(),
            'event_description'            => $detail->event_description,
            'alarm_type'                   => $detail->alarm_type,
            'alarm_reason'                 => $detail->alarm_reason,
            'evacuation_type'              => $detail->evacuation_type,
            'fire_alarm_control_notes'     => $detail->fire_alarm_control_notes,
            'deficiencies'                 => $detail->deficiencies,
            'guard_duty_obligations'       => $detail->guard_duty_obligations,
            'tenant_obligations'           => $detail->tenant_obligations,
            'had_alarm'                    => $detail->had_alarm,
            'fire_what_ignited'            => $detail->fire_what_ignited,
            'fire_life_in_danger'          => $detail->fire_life_in_danger,
            'fire_extinguished_how'        => $detail->fire_extinguished_how,
            'fire_commander_arrival_time'  => optional($detail->fire_commander_arrival_time)->toIso8601String(),
            'fire_reentry_protocol'        => $detail->fire_reentry_protocol,
            'fire_cause_responsible'       => $detail->fire_cause_responsible,
            'had_early_warning'            => $detail->had_early_warning,
            'delay_before_siren'           => $detail->delay_before_siren,
            'no_delay_reason'              => $detail->no_delay_reason,
            'no_delay_corrective_actions'  => $detail->no_delay_corrective_actions,
            'delay_reason_not_reacted'     => $detail->delay_reason_not_reacted,
        ];
    }

    public function show(Request $request, Document $document)
    {
        abort_unless($document->document_type === 'kiuritesi_jegyzokonyv', 404);
        $user = $request->user();
        abort_if(!$user->canManage() && $user->id !== $document->created_by_user_id, 403);

        $document->load(['signatures', 'attachments']);

        return response()->json([
            'document' => $this->documentBase($document),
            'detail'   => $this->detailPayload($document->evacuationReport),
        ]);
    }

    public function store(Request $request, DocumentPdfService $pdfService)
    {
        $user = $request->user();
        abort_unless($user->canCreateDocuments(), 403);

        $attachmentRules = [];
        foreach (self::ATTACHMENT_KEYS as $key) {
            $attachmentRules["attachment_{$key}"] = ['nullable', 'array'];
            $attachmentRules["attachment_{$key}.original_name"] = ['required_with:attachment_' . $key, 'string', 'max:255'];
            $attachmentRules["attachment_{$key}.mime_type"] = ['required_with:attachment_' . $key, 'string', 'max:100'];
            $attachmentRules["attachment_{$key}.content_base64"] = ['required_with:attachment_' . $key, 'string'];
        }

        $data = $request->validate(array_merge([
            'location_id'                 => ['nullable', 'integer', 'exists:tenant.locations,id'],
            'prepared_by'                 => ['required', 'string', 'max:255'],
            'prepared_by_position'        => ['required', 'string', 'max:255'],
            'location_text'               => ['required', 'string', 'max:255'],
            'event_date'                  => ['required', 'date'],
            'event_description'           => ['required', 'string', 'max:5000'],
            'alarm_type'                  => ['required', 'string', 'max:255'],
            'alarm_reason'                => ['required', 'string', 'max:2000'],
            'evacuation_type'             => ['required', 'string', 'max:255'],
            'fire_alarm_control_notes'    => ['required', 'string', 'max:2000'],
            'deficiencies'                => ['nullable', 'string', 'max:2000'],
            'guard_duty_obligations'      => ['nullable', 'string', 'max:2000'],
            'tenant_obligations'          => ['nullable', 'string', 'max:2000'],

            'had_alarm' => ['required', 'boolean'],

            'fire_what_ignited'            => ['nullable', 'required_if:had_alarm,true', 'string', 'max:2000'],
            'fire_life_in_danger'          => ['nullable', 'required_if:had_alarm,true', 'string', 'max:2000'],
            'fire_extinguished_how'        => ['nullable', 'required_if:had_alarm,true', 'string', 'max:2000'],
            'fire_commander_arrival_time'  => ['nullable', 'required_if:had_alarm,true', 'date'],
            'fire_reentry_protocol'        => ['nullable', 'required_if:had_alarm,true', 'string', 'max:2000'],
            'fire_cause_responsible'       => ['nullable', 'required_if:had_alarm,true', 'string', 'max:2000'],

            'had_early_warning'            => ['nullable', 'required_if:had_alarm,false', 'boolean'],
            'delay_before_siren'           => ['nullable', 'required_if:had_early_warning,true', 'boolean'],
            'no_delay_reason'              => ['nullable', 'required_if:delay_before_siren,false', 'string', 'max:2000'],
            'no_delay_corrective_actions'  => ['nullable', 'required_if:delay_before_siren,false', 'string', 'max:2000'],
            'delay_reason_not_reacted'     => ['nullable', 'required_if:delay_before_siren,true', 'string', 'max:2000'],
        ], $attachmentRules));

        $tenant = app('tenant');

        $document = DB::transaction(function () use ($data, $user, $tenant) {
            $document = Document::create([
                'document_type'      => 'kiuritesi_jegyzokonyv',
                'location_id'        => $data['location_id'] ?? null,
                'created_by_user_id' => $user->id,
                'status'             => 'draft',
            ]);

            DocumentEvacuationReport::create(array_merge(
                ['document_id' => $document->id],
                array_intersect_key($data, array_flip([
                    'prepared_by', 'prepared_by_position', 'location_text', 'event_date', 'event_description',
                    'alarm_type', 'alarm_reason', 'evacuation_type', 'fire_alarm_control_notes',
                    'deficiencies', 'guard_duty_obligations', 'tenant_obligations', 'had_alarm',
                    'fire_what_ignited', 'fire_life_in_danger', 'fire_extinguished_how',
                    'fire_commander_arrival_time', 'fire_reentry_protocol', 'fire_cause_responsible',
                    'had_early_warning', 'delay_before_siren', 'no_delay_reason',
                    'no_delay_corrective_actions', 'delay_reason_not_reacted',
                ]))
            ));

            foreach (self::ATTACHMENT_KEYS as $key) {
                $attachment = $data["attachment_{$key}"] ?? null;
                if (!$attachment) {
                    continue;
                }

                $binary = base64_decode(preg_replace('/^data:[^;]+;base64,/', '', $attachment['content_base64']));
                $path = "documents/{$tenant->slug}/attachments/{$document->id}/" . Str::uuid() . '-' . $attachment['original_name'];
                Storage::disk('local')->put($path, $binary);

                DocumentAttachment::create([
                    'document_id'    => $document->id,
                    'label'          => $key,
                    'original_name'  => $attachment['original_name'],
                    'stored_path'    => $path,
                    'size_bytes'     => strlen($binary),
                    'mime_type'      => $attachment['mime_type'],
                ]);
            }

            return $document;
        });

        try {
            $pdfPath = $pdfService->generate($document, $tenant->slug, $tenant->name);
        } catch (\Throwable $e) {
            Log::error('Dokumentum PDF generálás sikertelen: ' . $e->getMessage());
            return response()->json(['message' => 'A PDF generálása sikertelen volt. Próbálja újra.'], 500);
        }

        $document->update(['pdf_path' => $pdfPath, 'status' => 'finalized', 'finalized_at' => now()]);

        ActivityLog::record('document.created', $user, 'Kiürítési jegyzőkönyv rögzítve', [
            'document_id'   => $document->id,
            'document_type' => $document->document_type,
        ]);

        $document->load(['signatures', 'attachments']);

        return response()->json([
            'document' => $this->documentBase($document),
            'detail'   => $this->detailPayload($document->evacuationReport),
        ], 201);
    }
}
