<?php

namespace App\Http\Requests\Documents;

use Illuminate\Foundation\Http\FormRequest;

class StoreIncidentReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user('tenant')?->canCreateDocuments() ?? false;
    }

    public function rules(): array
    {
        return [
            'location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'location_text' => ['required', 'string', 'max:255'],
            'recorded_at' => ['required', 'date'],
            'event_description' => ['required', 'string', 'max:5000'],
            'guard_ids' => ['required', 'array', 'min:1'],
            'guard_ids.*' => ['integer', 'exists:users,id'],
            'signature_jegyzokonyv_vezeto' => ['required', 'string', 'regex:/^data:image\/png;base64,/'],
            'signature_tanu' => ['required', 'string', 'regex:/^data:image\/png;base64,/'],
            'signature_kepviselo' => ['required', 'string', 'regex:/^data:image\/png;base64,/'],
        ];
    }
}
