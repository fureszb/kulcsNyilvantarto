<?php

namespace App\Http\Requests\Documents;

use Illuminate\Foundation\Http\FormRequest;

class StoreKeyCardHandoverRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user('tenant')?->canCreateDocuments() ?? false;
    }

    public function rules(): array
    {
        return [
            'location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'key_card_number_or_name' => ['required', 'string', 'max:255'],
            'company_or_workplace' => ['required', 'string', 'max:255'],
            'issued_at' => ['required', 'date'],
            'issued_to_name' => ['required', 'string', 'max:255'],
            'issued_to_id_card_number' => ['required', 'string', 'max:100'],
            'security_service' => ['nullable', 'string', 'max:255'],
            'returned_at' => ['nullable', 'date'],
            'returned_by_name' => ['nullable', 'string', 'max:255'],
            'signature_felvevo' => ['required', 'string', 'regex:/^data:image\/png;base64,/'],
            'signature_leado' => ['required', 'string', 'regex:/^data:image\/png;base64,/'],
            'signature_visszavevo' => ['required', 'string', 'regex:/^data:image\/png;base64,/'],
        ];
    }
}
