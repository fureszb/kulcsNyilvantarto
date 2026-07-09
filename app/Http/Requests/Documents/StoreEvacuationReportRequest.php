<?php

namespace App\Http\Requests\Documents;

use Illuminate\Foundation\Http\FormRequest;

class StoreEvacuationReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user('tenant')?->canCreateDocuments() ?? false;
    }

    public function rules(): array
    {
        return [
            'location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'prepared_by' => ['required', 'string', 'max:255'],
            'prepared_by_position' => ['required', 'string', 'max:255'],
            'location_text' => ['required', 'string', 'max:255'],
            'event_date' => ['required', 'date'],
            'event_description' => ['required', 'string', 'max:5000'],
            'alarm_type' => ['required', 'string', 'max:255'],
            'alarm_reason' => ['required', 'string', 'max:2000'],
            'evacuation_type' => ['required', 'string', 'max:255'],
            'fire_alarm_control_notes' => ['required', 'string', 'max:2000'],
            'deficiencies' => ['nullable', 'string', 'max:2000'],
            'guard_duty_obligations' => ['nullable', 'string', 'max:2000'],
            'tenant_obligations' => ['nullable', 'string', 'max:2000'],

            'had_alarm' => ['required', 'boolean'],

            // Ha volt riasztás/tűzjelzés
            'fire_what_ignited' => ['nullable', 'required_if:had_alarm,1', 'string', 'max:2000'],
            'fire_life_in_danger' => ['nullable', 'required_if:had_alarm,1', 'string', 'max:2000'],
            'fire_extinguished_how' => ['nullable', 'required_if:had_alarm,1', 'string', 'max:2000'],
            'fire_commander_arrival_time' => ['nullable', 'required_if:had_alarm,1', 'date'],
            'fire_reentry_protocol' => ['nullable', 'required_if:had_alarm,1', 'string', 'max:2000'],
            'fire_cause_responsible' => ['nullable', 'required_if:had_alarm,1', 'string', 'max:2000'],

            // Ha nem volt riasztás
            'had_early_warning' => ['nullable', 'required_if:had_alarm,0', 'boolean'],
            'delay_before_siren' => ['nullable', 'required_if:had_early_warning,1', 'boolean'],
            'no_delay_reason' => ['nullable', 'required_if:delay_before_siren,0', 'string', 'max:2000'],
            'no_delay_corrective_actions' => ['nullable', 'required_if:delay_before_siren,0', 'string', 'max:2000'],
            'delay_reason_not_reacted' => ['nullable', 'required_if:delay_before_siren,1', 'string', 'max:2000'],

            'attachment_kiuritesi_nyilvantartas' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
            'attachment_hatosagi_jegyzokonyv' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
            'attachment_tuzmarshall_jegyzokonyv' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
        ];
    }
}
