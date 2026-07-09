<?php

namespace App\Http\Requests\Documents;

use Illuminate\Foundation\Http\FormRequest;

class StoreDamageReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user('tenant')?->canCreateDocuments() ?? false;
    }

    public function rules(): array
    {
        return [
            'location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'recorded_from' => ['required', 'date'],
            'recorded_to' => ['required', 'date', 'after_or_equal:recorded_from'],
            'location_text' => ['required', 'string', 'max:255'],
            'subject' => ['required', 'string', 'max:255'],
            'perpetrator_name' => ['required', 'string', 'max:255'],
            'perpetrator_id_card_number' => ['required', 'string', 'max:100'],
            'perpetrator_birth_place' => ['required', 'string', 'max:255'],
            'perpetrator_birth_date' => ['required', 'date'],
            'perpetrator_mother_name' => ['required', 'string', 'max:255'],
            'perpetrator_address' => ['required', 'string', 'max:255'],
            'perpetrator_phone' => ['nullable', 'string', 'max:50'],
            'perpetrator_email' => ['nullable', 'email', 'max:255'],
            'guard_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'witness_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'event_description' => ['required', 'string', 'max:5000'],
            'perpetrator_admitted' => ['required', 'boolean'],
            'signature_karokozo' => ['required', 'string', 'regex:/^data:image\/png;base64,/'],
            'signature_biztonsagi_szolgalat' => ['required', 'string', 'regex:/^data:image\/png;base64,/'],
            'signature_kepviselo' => ['required', 'string', 'regex:/^data:image\/png;base64,/'],
        ];
    }
}
